import Redis from 'redis';
import { logger } from '../utils/logger';

interface CacheOptions {
  ttl?: number;
  prefix?: string;
  tags?: string[];
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
}

class CacheService {
  private redis: Redis.RedisClientType | null = null;
  private memoryCache = new Map<string, CacheItem<any>>();
  private tagIndex = new Map<string, Set<string>>();
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly MEMORY_CACHE_SIZE = 1000;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      this.redis = Redis.createClient({ url: redisUrl });
      
      await this.redis.connect();
      logger.info('Redis cache connected successfully');
    } catch (error) {
      logger.warn('Redis not available, using memory cache only');
      this.redis = null;
    }
  }

  private generateKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  private async setMemoryCache<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.DEFAULT_TTL, tags = [] } = options;
    
    // Clean up old entries if cache is full
    if (this.memoryCache.size >= this.MEMORY_CACHE_SIZE) {
      this.cleanupMemoryCache();
    }

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000,
      tags,
    };

    this.memoryCache.set(key, cacheItem);

    // Update tag index
    tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    });
  }

  private getMemoryCache<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data;
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.memoryCache.delete(key);
    });

    // If still too full, remove oldest entries
    if (this.memoryCache.size >= this.MEMORY_CACHE_SIZE) {
      const entries = Array.from(this.memoryCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.MEMORY_CACHE_SIZE * 0.2));
      toRemove.forEach(([key]) => {
        this.memoryCache.delete(key);
      });
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = this.DEFAULT_TTL, prefix, tags = [] } = options;
    const fullKey = this.generateKey(key, prefix);

    try {
      // Set in memory cache
      await this.setMemoryCache(fullKey, data, { ttl, tags });

      // Set in Redis if available
      if (this.redis) {
        const cacheData = {
          data,
          tags,
          timestamp: Date.now(),
        };

        await this.redis.setEx(fullKey, ttl, JSON.stringify(cacheData));
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    const fullKey = this.generateKey(key, prefix);

    try {
      // Try memory cache first
      const memoryData = this.getMemoryCache<T>(fullKey);
      if (memoryData !== null) {
        return memoryData;
      }

      // Try Redis cache
      if (this.redis) {
        const redisData = await this.redis.get(fullKey);
        if (redisData) {
          const parsed = JSON.parse(redisData);
          const data = parsed.data;
          
          // Store in memory cache for faster access
          await this.setMemoryCache(fullKey, data, { tags: parsed.tags });
          
          return data;
        }
      }
    } catch (error) {
      logger.error('Cache get error:', error);
    }

    return null;
  }

  async delete(key: string, prefix?: string): Promise<void> {
    const fullKey = this.generateKey(key, prefix);

    try {
      // Remove from memory cache
      this.memoryCache.delete(fullKey);

      // Remove from Redis
      if (this.redis) {
        await this.redis.del(fullKey);
      }
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async invalidateByTag(tag: string): Promise<void> {
    try {
      // Get keys with this tag from memory cache
      const taggedKeys = this.tagIndex.get(tag) || new Set();
      
      // Remove from memory cache
      taggedKeys.forEach(key => {
        this.memoryCache.delete(key);
      });

      // Remove tag from index
      this.tagIndex.delete(tag);

      // Remove from Redis if available
      if (this.redis) {
        const pattern = `*:${tag}:*`;
        const keys = await this.redis.keys(pattern);
        
        if (keys.length > 0) {
          await this.redis.del(keys);
        }
      }
    } catch (error) {
      logger.error('Cache invalidate by tag error:', error);
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      // Remove from memory cache
      const keysToDelete: string[] = [];
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => {
        this.memoryCache.delete(key);
      });

      // Remove from Redis
      if (this.redis) {
        const keys = await this.redis.keys(`*${pattern}*`);
        if (keys.length > 0) {
          await this.redis.del(keys);
        }
      }
    } catch (error) {
      logger.error('Cache invalidate by pattern error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      // Clear memory cache
      this.memoryCache.clear();
      this.tagIndex.clear();

      // Clear Redis cache
      if (this.redis) {
        await this.redis.flushDb();
      }
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  async getStats(): Promise<any> {
    return {
      memoryCacheSize: this.memoryCache.size,
      tagIndexSize: this.tagIndex.size,
      redisConnected: this.redis !== null,
      memoryUsage: process.memoryUsage(),
    };
  }

  // Cache decorator for methods
  static cache(ttl: number = 3600, prefix?: string, tags: string[] = []) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
      const method = descriptor.value;
      const cacheService = new CacheService();

      descriptor.value = async function (...args: any[]) {
        const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
        
        // Try to get from cache
        const cached = await cacheService.get(cacheKey, prefix);
        if (cached !== null) {
          return cached;
        }

        // Execute method and cache result
        const result = await method.apply(this, args);
        const cacheOptions: CacheOptions = { ttl, tags };
        if (prefix) {
          cacheOptions.prefix = prefix;
        }
        await cacheService.set(cacheKey, result, cacheOptions);
        
        return result;
      };
    };
  }
}

export const cacheService = new CacheService();
export { CacheService }; 
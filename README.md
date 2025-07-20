# Splan - Personal Scrum AI-Supported Application

Splan, kişisel Scrum metodolojisini AI destekli özelliklerle birleştiren modern bir üretkenlik uygulamasıdır. Hedef yönetimi, sprint planlama, görev takibi ve AI destekli analitik özellikleri ile kişisel ve takım verimliliğini artırır.

## 🚀 Özellikler

### Core Features
- **Hedef Yönetimi**: SMART hedefler oluşturma ve takip etme
- **Sprint Planlama**: Agile sprint metodolojisi ile proje yönetimi
- **Görev Takibi**: Detaylı görev yönetimi ve zaman takibi
- **AI Destekli Analitik**: Yapay zeka ile verimlilik analizi
- **Gerçek Zamanlı İletişim**: WebSocket tabanlı anlık mesajlaşma

### Advanced Features
- **Offline Desteği**: İnternet bağlantısı olmadan çalışma
- **Veri Export/Import**: GDPR uyumlu veri yönetimi
- **Bildirim Sistemi**: Akıllı bildirim ve hatırlatmalar
- **İzin Yönetimi**: Gelişmiş izin ve tatil takibi
- **Mobil Uygulama**: React Native ile cross-platform destek

## 🛠️ Teknoloji Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **SQLite** - Database (development)
- **PostgreSQL** - Database (production)
- **Redis** - Caching ve session management
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **OpenAI** - AI integration

### Frontend (Mobile)
- **React Native** - Cross-platform mobile development
- **Redux Toolkit** - State management
- **TypeScript** - Type safety
- **AsyncStorage** - Local data persistence
- **React Navigation** - Navigation

### DevOps & Tools
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Swagger** - API documentation

## 📋 Gereksinimler

- Node.js 18+ 
- npm v9+
- Git
- SQLite (development)
- PostgreSQL (production)
- Redis (optional)

## 🚀 Kurulum

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/your-username/splan.git
cd splan
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. Environment Variables
`.env` dosyasını oluşturun:
```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001

# API
API_VERSION=v1
```

### 4. Database Setup
```bash
# Prisma client generate
npm run db:generate

# Database migration
npm run db:migrate

# Seed data (optional)
npm run db:seed
```

### 5. Uygulamayı Başlatın
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📚 API Dokümantasyonu

API dokümantasyonuna erişmek için:
```
http://localhost:3000/api-docs
```

### Ana Endpoint'ler

#### Authentication
- `POST /api/v1/auth/register` - Kullanıcı kaydı
- `POST /api/v1/auth/login` - Kullanıcı girişi
- `GET /api/v1/auth/profile` - Profil bilgileri
- `PUT /api/v1/auth/profile` - Profil güncelleme
- `POST /api/v1/auth/logout` - Çıkış

#### Goals
- `GET /api/v1/goals` - Hedefleri listele
- `POST /api/v1/goals` - Yeni hedef oluştur
- `GET /api/v1/goals/:id` - Hedef detayı
- `PUT /api/v1/goals/:id` - Hedef güncelle
- `DELETE /api/v1/goals/:id` - Hedef sil

#### Sprints
- `GET /api/v1/sprints` - Sprint'leri listele
- `POST /api/v1/sprints` - Yeni sprint oluştur
- `GET /api/v1/sprints/:id` - Sprint detayı
- `PUT /api/v1/sprints/:id` - Sprint güncelle
- `DELETE /api/v1/sprints/:id` - Sprint sil

#### Tasks
- `GET /api/v1/tasks` - Görevleri listele
- `POST /api/v1/tasks` - Yeni görev oluştur
- `GET /api/v1/tasks/:id` - Görev detayı
- `PUT /api/v1/tasks/:id` - Görev güncelle
- `DELETE /api/v1/tasks/:id` - Görev sil

#### AI Features
- `POST /api/v1/ai/chat` - AI sohbet
- `POST /api/v1/ai/analyze` - AI analiz

## 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Coverage ile test
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 📱 Mobile App

Mobile uygulama için `SplanMobile` klasörüne gidin:

```bash
cd SplanMobile
npm install
npm run android  # Android
npm run ios      # iOS
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (Optional)
```bash
docker build -t splan .
docker run -p 3000:3000 splan
```

### Environment Variables (Production)
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@localhost:5432/splan"
JWT_SECRET="your-production-jwt-secret"
OPENAI_API_KEY="your-openai-api-key"
REDIS_URL="redis://your-redis-server:6379"
```

## 📁 Proje Yapısı

```
splan/
├── src/
│   ├── config/          # Konfigürasyon dosyaları
│   ├── controllers/     # Route controller'ları
│   ├── middleware/      # Express middleware'leri
│   ├── routes/          # API route'ları
│   ├── services/        # Business logic
│   ├── utils/           # Yardımcı fonksiyonlar
│   └── index.ts         # Ana uygulama dosyası
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seed.ts          # Seed data
├── tests/               # Test dosyaları
├── SplanMobile/         # React Native mobile app
└── docs/                # Dokümantasyon
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🆘 Destek

- **Email**: support@splan.com
- **Issues**: [GitHub Issues](https://github.com/your-username/splan/issues)
- **Documentation**: [API Docs](http://localhost:3000/api-docs)

## 🗺️ Roadmap

### Phase 12: Advanced Features
- [ ] Machine Learning Analytics
- [ ] Advanced Reporting
- [ ] Team Collaboration
- [ ] Integration APIs

### Phase 13: Enterprise Features
- [ ] Multi-tenant Support
- [ ] Advanced Security
- [ ] Audit Logging
- [ ] Performance Monitoring

---

**Splan** ile verimliliğinizi artırın! 🚀 
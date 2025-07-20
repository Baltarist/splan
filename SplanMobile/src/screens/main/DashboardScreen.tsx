import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { 
  fetchDashboard, 
  selectDashboard,
  fetchProductivityMetrics,
  selectProductivity 
} from '../../store/slices/analyticsSlice';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const dashboard = useSelector(selectDashboard);
  const productivity = useSelector(selectProductivity);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboard()),
        dispatch(fetchProductivityMetrics(30))
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (dashboard.error) {
      Alert.alert('Hata', dashboard.error);
    }
  }, [dashboard.error]);

  const renderMetricCard = (title: string, value: number, subtitle: string, icon: string, color: string) => (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderProgressBar = (label: string, value: number, total: number, color: string) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressValue}>{value}/{total}</Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${percentage}%`, 
                backgroundColor: color 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressPercentage}>{Math.round(percentage)}%</Text>
      </View>
    );
  };

  const renderWeeklyTrend = () => {
    if (!dashboard.data?.trends.weekly) return null;

    return (
      <View style={styles.trendContainer}>
        <Text style={styles.sectionTitle}>Haftalık Trend</Text>
        <View style={styles.trendChart}>
          {dashboard.data.trends.weekly.map((week, index) => (
            <View key={index} style={styles.trendBar}>
              <View style={styles.trendBarContainer}>
                <View 
                  style={[
                    styles.trendBarFill, 
                    { 
                      height: week.total > 0 ? `${(week.completed / week.total) * 100}%` : '0%',
                      backgroundColor: week.completed > 0 ? '#4CAF50' : '#E0E0E0'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.trendLabel}>{week.week}</Text>
              <Text style={styles.trendValue}>{week.completed}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (dashboard.loading && !dashboard.data) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Üretkenlik ve İlerleme Özeti</Text>
      </View>

      {dashboard.data && (
        <>
          {/* Overview Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricsRow}>
              {renderMetricCard(
                'Toplam Görev',
                dashboard.data.overview.totalTasks,
                'Son 30 gün',
                'list-outline',
                '#2196F3'
              )}
              {renderMetricCard(
                'Tamamlanan',
                dashboard.data.overview.completedTasks,
                'Görevler',
                'checkmark-circle-outline',
                '#4CAF50'
              )}
            </View>
            <View style={styles.metricsRow}>
              {renderMetricCard(
                'Aktif Hedefler',
                dashboard.data.overview.activeGoals,
                'Devam eden',
                'flag-outline',
                '#FF9800'
              )}
              {renderMetricCard(
                'Üretkenlik',
                dashboard.data.productivity.score,
                'Puan',
                'trending-up-outline',
                '#9C27B0'
              )}
            </View>
          </View>

          {/* Progress Bars */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>İlerleme Durumu</Text>
            {renderProgressBar(
              'Görev Tamamlama',
              dashboard.data.overview.completedTasks,
              dashboard.data.overview.totalTasks,
              '#4CAF50'
            )}
            {renderProgressBar(
              'Hedef Tamamlama',
              dashboard.data.overview.completedGoals,
              dashboard.data.overview.totalGoals,
              '#FF9800'
            )}
            {renderProgressBar(
              'Sprint Tamamlama',
              dashboard.data.overview.completedSprints,
              dashboard.data.overview.totalSprints,
              '#2196F3'
            )}
          </View>

          {/* Productivity Score */}
          <View style={styles.productivityCard}>
            <Text style={styles.sectionTitle}>Üretkenlik Skoru</Text>
            <View style={styles.productivityScore}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreValue}>{dashboard.data.productivity.score}</Text>
                <Text style={styles.scoreLabel}>Puan</Text>
              </View>
              <View style={styles.productivityDetails}>
                <Text style={styles.productivityDetail}>
                  Tahmini: {dashboard.data.productivity.totalEstimatedHours}h
                </Text>
                <Text style={styles.productivityDetail}>
                  Gerçek: {dashboard.data.productivity.totalActualHours}h
                </Text>
                <Text style={styles.productivityDetail}>
                  Verimlilik: {dashboard.data.productivity.efficiency}%
                </Text>
              </View>
            </View>
          </View>

          {/* Weekly Trend */}
          {renderWeeklyTrend()}

          {/* Recent Activity */}
          {dashboard.data.recentActivity.upcomingDeadlines.length > 0 && (
            <View style={styles.recentActivity}>
              <Text style={styles.sectionTitle}>Yaklaşan Son Tarihler</Text>
              {dashboard.data.recentActivity.upcomingDeadlines.slice(0, 3).map((task: any, index: number) => (
                <View key={index} style={styles.activityItem}>
                  <Ionicons name="time-outline" size={16} color="#FF5722" />
                  <Text style={styles.activityText} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <Text style={styles.activityDate}>
                    {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  metricsGrid: {
    padding: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 10,
    color: '#999',
  },
  progressSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  productivityCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productivityScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666',
  },
  productivityDetails: {
    flex: 1,
  },
  productivityDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  trendContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  trendBar: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarContainer: {
    width: 20,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  trendBarFill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
  },
  trendLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  trendValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  recentActivity: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default DashboardScreen; 
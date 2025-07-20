import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchSprints, deleteSprint, updateSprintStatus } from '@/store/slices/sprintSlice';
import { Sprint } from '@/services/sprintService';
import { Ionicons } from '@expo/vector-icons';

interface SprintsScreenProps {
  navigation: any;
}

const SprintsScreen: React.FC<SprintsScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sprints, isLoading, error } = useSelector((state: RootState) => state.sprints);

  useEffect(() => {
    dispatch(fetchSprints());
  }, [dispatch]);

  const handleDeleteSprint = (sprintId: string) => {
    Alert.alert(
      'Sprinti Sil',
      'Bu sprinti silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => dispatch(deleteSprint(sprintId)),
        },
      ]
    );
  };

  const handleStatusChange = (sprintId: string, currentStatus: string) => {
    const statusOptions = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
    const currentIndex = statusOptions.indexOf(currentStatus);
    const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length] as 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
    
    dispatch(updateSprintStatus({ id: sprintId, status: nextStatus }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return '#fff3e0';
      case 'ACTIVE':
        return '#e3f2fd';
      case 'COMPLETED':
        return '#e8f5e8';
      case 'CANCELLED':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return '#f57c00';
      case 'ACTIVE':
        return '#1976d2';
      case 'COMPLETED':
        return '#388e3c';
      case 'CANCELLED':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'Planlama';
      case 'ACTIVE':
        return 'Aktif';
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const renderSprint = ({ item }: { item: Sprint }) => (
    <View style={styles.sprintCard}>
      <View style={styles.sprintHeader}>
        <Text style={styles.sprintTitle}>{item.title}</Text>
        <View style={styles.sprintActions}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: getStatusColor(item.status) }]}
            onPress={() => handleStatusChange(item.id, item.status)}
          >
            <Text style={[styles.statusButtonText, { color: getStatusTextColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSprint(item.id)}
          >
            <Text style={styles.deleteButtonText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.sprintDescription}>{item.description}</Text>
      
      <View style={styles.sprintMeta}>
        <Text style={styles.date}>
          {new Date(item.startDate).toLocaleDateString('tr-TR')} - {new Date(item.endDate).toLocaleDateString('tr-TR')}
        </Text>
        {item.capacity && (
          <Text style={styles.capacity}>Kapasite: {item.capacity}h</Text>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Sprintler yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Hata: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => dispatch(fetchSprints())}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sprintlerim</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateSprint')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {sprints.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Henüz sprint eklenmemiş</Text>
          <Text style={styles.emptySubtext}>İlk sprintini ekleyerek başla!</Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => navigation.navigate('CreateSprint')}
          >
            <Text style={styles.emptyAddButtonText}>İlk Sprintini Ekleyin</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sprints}
          renderItem={renderSprint}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  sprintCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sprintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sprintTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  sprintActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sprintDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  sprintMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  capacity: {
    fontSize: 12,
    color: '#999',
  },
});

export default SprintsScreen; 
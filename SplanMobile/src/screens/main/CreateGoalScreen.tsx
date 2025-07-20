import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createGoal } from '@/store/slices/goalSlice';
import { Ionicons } from '@expo/vector-icons';

interface CreateGoalScreenProps {
  navigation: any;
}

const CreateGoalScreen: React.FC<CreateGoalScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.goals);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [targetDate, setTargetDate] = useState('');

  const handleCreateGoal = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Hedef başlığı gereklidir');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Hata', 'Hedef açıklaması gereklidir');
      return;
    }

    try {
      await dispatch(createGoal({
        title: title.trim(),
        description: description.trim(),
        priority,
        targetDate: targetDate || undefined,
      })).unwrap();

      Alert.alert('Başarılı', 'Hedef başarıyla oluşturuldu', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Hedef oluşturulamadı');
    }
  };

  const getPriorityColor = (selectedPriority: string) => {
    switch (selectedPriority) {
      case 'HIGH':
        return '#F44336';
      case 'MEDIUM':
        return '#FF9800';
      case 'LOW':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'Yüksek';
      case 'MEDIUM':
        return 'Orta';
      case 'LOW':
        return 'Düşük';
      default:
        return priority;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Hedef</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hedef Başlığı *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Hedefinizi kısaca açıklayın"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Hedefinizi detaylı olarak açıklayın"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Priority Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Öncelik</Text>
          <View style={styles.priorityContainer}>
            {(['HIGH', 'MEDIUM', 'LOW'] as const).map((priorityOption) => (
              <TouchableOpacity
                key={priorityOption}
                style={[
                  styles.priorityButton,
                  priority === priorityOption && {
                    backgroundColor: getPriorityColor(priorityOption),
                  },
                ]}
                onPress={() => setPriority(priorityOption)}
              >
                <Text
                  style={[
                    styles.priorityButtonText,
                    priority === priorityOption && styles.priorityButtonTextSelected,
                  ]}
                >
                  {getPriorityText(priorityOption)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Son Tarih (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            value={targetDate}
            onChangeText={setTargetDate}
            placeholder="YYYY-MM-DD formatında (örn: 2025-12-31)"
            placeholderTextColor="#999"
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreateGoal}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Hedef Oluştur</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityButtonTextSelected: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateGoalScreen; 
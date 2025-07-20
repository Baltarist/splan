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
import { createSprint } from '@/store/slices/sprintSlice';
import { Ionicons } from '@expo/vector-icons';

interface CreateSprintScreenProps {
  navigation: any;
}

const CreateSprintScreen: React.FC<CreateSprintScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.sprints);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [capacity, setCapacity] = useState('');

  const handleCreateSprint = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Sprint başlığı gereklidir');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Hata', 'Sprint açıklaması gereklidir');
      return;
    }

    if (!startDate.trim()) {
      Alert.alert('Hata', 'Başlangıç tarihi gereklidir');
      return;
    }

    if (!endDate.trim()) {
      Alert.alert('Hata', 'Bitiş tarihi gereklidir');
      return;
    }

    try {
      await dispatch(createSprint({
        title: title.trim(),
        description: description.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        capacity: capacity ? parseFloat(capacity) : undefined,
      })).unwrap();

      Alert.alert('Başarılı', 'Sprint başarıyla oluşturuldu', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Hata', error instanceof Error ? error.message : 'Sprint oluşturulamadı');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Sprint</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sprint Başlığı *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Sprintinizi kısaca açıklayın"
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
            placeholder="Sprintinizi detaylı olarak açıklayın"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Start Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Başlangıç Tarihi *</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD formatında (örn: 2025-07-20)"
            placeholderTextColor="#999"
          />
        </View>

        {/* End Date Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bitiş Tarihi *</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD formatında (örn: 2025-08-03)"
            placeholderTextColor="#999"
          />
        </View>

        {/* Capacity Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kapasite (Saat) (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={setCapacity}
            placeholder="40"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreateSprint}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.createButtonText}>Sprint Oluştur</Text>
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

export default CreateSprintScreen; 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createTask } from '@/store/slices/taskSlice';
import { fetchGoals } from '@/store/slices/goalSlice';
import { fetchSprints } from '@/store/slices/sprintSlice';
import { Ionicons } from '@expo/vector-icons';

interface CreateTaskScreenProps {
  navigation: any;
}

const CreateTaskScreen: React.FC<CreateTaskScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.tasks);
  const { goals } = useSelector((state: RootState) => state.goals);
  const { sprints } = useSelector((state: RootState) => state.sprints);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchSprints());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Hata', error);
    }
  }, [error]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Görev başlığı gereklidir');
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
      dueDate: dueDate || undefined,
      goalId: selectedGoalId || undefined,
      sprintId: selectedSprintId || undefined,
      tags: tags.trim() || '',
      notes: notes.trim() || undefined,
    };

    try {
      await dispatch(createTask(taskData)).unwrap();
      Alert.alert('Başarılı', 'Görev başarıyla oluşturuldu', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Create task error:', error);
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: 'Düşük', color: '#4CAF50' },
    { value: 'MEDIUM', label: 'Orta', color: '#FF9800' },
    { value: 'HIGH', label: 'Yüksek', color: '#F44336' },
    { value: 'CRITICAL', label: 'Acil', color: '#9C27B0' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Yeni Görev</Text>
        <TouchableOpacity 
          style={[styles.saveButton, (!title.trim() || isLoading) && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Görev Başlığı *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Görev başlığını girin"
            placeholderTextColor="#999"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Görev açıklamasını girin"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Priority */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Öncelik</Text>
          <View style={styles.priorityContainer}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityOption,
                  priority === option.value && styles.priorityOptionSelected,
                  { borderColor: option.color }
                ]}
                onPress={() => setPriority(option.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
              >
                <Text style={[
                  styles.priorityText,
                  priority === option.value && { color: option.color }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estimated Hours */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tahmini Süre (Saat)</Text>
          <TextInput
            style={styles.input}
            value={estimatedHours}
            onChangeText={setEstimatedHours}
            placeholder="0.5"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Due Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bitiş Tarihi</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
          />
        </View>

        {/* Goal Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hedef</Text>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerText}>
              {selectedGoalId 
                ? goals.find(g => g.id === selectedGoalId)?.title || 'Hedef seçin'
                : 'Hedef seçin'
              }
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
          {goals.length > 0 && (
            <View style={styles.optionsContainer}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.option,
                    selectedGoalId === goal.id && styles.optionSelected
                  ]}
                  onPress={() => setSelectedGoalId(selectedGoalId === goal.id ? '' : goal.id)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedGoalId === goal.id && styles.optionTextSelected
                  ]}>
                    {goal.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Sprint Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sprint</Text>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerText}>
              {selectedSprintId 
                ? sprints.find(s => s.id === selectedSprintId)?.title || 'Sprint seçin'
                : 'Sprint seçin'
              }
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </View>
          {sprints.length > 0 && (
            <View style={styles.optionsContainer}>
              {sprints.map((sprint) => (
                <TouchableOpacity
                  key={sprint.id}
                  style={[
                    styles.option,
                    selectedSprintId === sprint.id && styles.optionSelected
                  ]}
                  onPress={() => setSelectedSprintId(selectedSprintId === sprint.id ? '' : sprint.id)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedSprintId === sprint.id && styles.optionTextSelected
                  ]}>
                    {sprint.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Etiketler</Text>
          <TextInput
            style={styles.input}
            value={tags}
            onChangeText={setTags}
            placeholder="virgülle ayırarak etiketler girin"
            placeholderTextColor="#999"
          />
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notlar</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ek notlarınızı girin"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: '#f0f0f0',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  optionsContainer: {
    marginTop: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    maxHeight: 150,
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionSelected: {
    backgroundColor: '#f0f8ff',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default CreateTaskScreen; 
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../../services/api';

interface TodoItem {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
}

const TodoListScreen: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/todo-list');
      setTodos(response.data.todos || []);
    } catch (err: any) {
      setError('To-Do listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: TodoItem['status']) => {
    try {
      await api.put(`/todo-list/${id}`, { status });
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
    } catch (err) {
      Alert.alert('Hata', 'Durum güncellenemedi.');
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const renderItem = ({ item }: { item: TodoItem }) => (
    <View style={styles.itemContainer}>
      <Text style={[styles.content, item.status === 'completed' && styles.completed]}>{item.content}</Text>
      <View style={styles.statusRow}>
        <Text style={styles.status}>{item.status}</Text>
        {item.status !== 'completed' && (
          <TouchableOpacity style={styles.button} onPress={() => updateStatus(item.id, 'completed')}>
            <Text style={styles.buttonText}>Tamamla</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 32 }} size="large" color="#007AFF" />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={<Text style={styles.empty}>Hiç to-do yok.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#222' },
  itemContainer: { backgroundColor: '#f7f7f7', borderRadius: 8, padding: 16, marginBottom: 12 },
  content: { fontSize: 16, color: '#222' },
  completed: { textDecorationLine: 'line-through', color: '#aaa' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  status: { fontSize: 14, color: '#007AFF', marginRight: 16 },
  button: { backgroundColor: '#007AFF', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 12 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', marginTop: 32, textAlign: 'center' },
  empty: { color: '#888', textAlign: 'center', marginTop: 32 },
});

export default TodoListScreen; 
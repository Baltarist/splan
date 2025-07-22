// Jest setup: Native modülleri mockla
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// @expo/vector-icons mock
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return {
    Ionicons: (props) => React.createElement('Ionicons', props),
    // Diğer ikonlar da gerekirse eklenebilir
  };
}); 
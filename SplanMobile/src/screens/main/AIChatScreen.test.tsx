import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import aiReducer, { initialState as aiInitialState } from '../../store/slices/aiSlice';
import AIChatScreen from './AIChatScreen';

describe('AIChatScreen', () => {
  const store = configureStore({
    reducer: { ai: aiReducer },
    preloadedState: { ai: aiInitialState },
  });

  it('renders correctly', () => {
    const { toJSON } = render(
      <Provider store={store}>
        <AIChatScreen />
      </Provider>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('should show chat input', () => {
    const { getByPlaceholderText } = render(
      <Provider store={store}>
        <AIChatScreen />
      </Provider>
    );
    expect(getByPlaceholderText("AI'ya bir şeyler sor...")).toBeTruthy();
  });
}); 
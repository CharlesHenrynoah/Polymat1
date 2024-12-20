import { useState } from 'react';
import { ChatState, Message } from '../types/chat';

import { call_llm } from '../services/starcoder_inference';

import { InferenceClient } from '@huggingface/inference';
import { refreshToken } from '../config/configdb';


export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {


      await refreshToken();

      const client = new InferenceClient({
        model: 'bigcode/starcoder2-3b',
        token: import.meta.env.VITE_HUGGINGFACE_API_KEY,
      });

      const response = await client.textGeneration({
        inputs: content,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
        },
      });


      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.generated_text,
        role: 'assistant',
        timestamp: new Date(),
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Unable to connect to AI service. Please check your API key and try again.',
      }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearError,
  };
};

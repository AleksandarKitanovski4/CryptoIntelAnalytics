// client/src/hooks/useChatAssistant.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';     // твојата фунција за повици кон backend
import type { CoinData } from '../types/crypto';

export interface ChatMessageDisplay {
  id: string;
  message: string;
  response?: string;
  timestamp: Date;
  isUser: boolean;
}

interface RequestPayload {
  coinId: number;
  timeframe: string;
  prompt: string;
}

interface ApiResponse {
  response: string; // прилагоди ако твојот API враќа 'message' наместо 'response'
}

export function useChatAssistant(
  selectedCoin?: CoinData,
  selectedTimeframe?: string
) {
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([]);

  const mutation = useMutation<ApiResponse, Error, RequestPayload>(
    ({ coinId, timeframe, prompt }) =>
      apiRequest('/analysis/chat', { coinId, timeframe, prompt }),
    {
      onSuccess(data, variables) {
        // Додај ја AI пораката
        setMessages(prev => [
          ...prev,
          {
            id: `${Date.now()}-ai`,
            message: data.response,
            isUser: false,
            timestamp: new Date(),
          },
        ]);
      },
      onError(error) {
        // Тука можеш да додадеш Toast за грешка
        console.error('Chat error:', error);
      },
    }
  );

  function sendMessage(text: string) {
    if (!selectedCoin || !selectedTimeframe) return;
    // Додај ја корисничката порака веднаш
    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        message: text,
        isUser: true,
        timestamp: new Date(),
      },
    ]);
    // Прати ја на API
    mutation.mutate({
      coinId: selectedCoin.id,
      timeframe: selectedTimeframe,
      prompt: text,
    });
  }

  return {
    messages,
    sendMessage,
    isLoading: mutation.isLoading,
  };
}
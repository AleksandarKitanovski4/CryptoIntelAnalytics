import { useState, useEffect, useCallback, useRef } from 'react';
import type { WebSocketMessage } from '../types/crypto';

export function useWebSocket(url?: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const messageHandlers = useRef<Map<string, (data: any) => void>>(new Map());

  const wsUrl = url || (() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  })();

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
        
        // Call registered handler for this message type
        const handler = messageHandlers.current.get(message.type);
        if (handler) {
          handler(message.data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
    };

    setConnectionStatus('connecting');

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  const sendMessage = useCallback((message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, [socket]);

  const subscribeToCoin = useCallback((symbol: string, timeframe: string) => {
    sendMessage({
      type: 'SUBSCRIBE_COIN',
      data: { symbol, timeframe }
    });
  }, [sendMessage]);

  const requestIndicators = useCallback((coinId: number, timeframe: string, indicatorType?: string) => {
    sendMessage({
      type: 'REQUEST_INDICATORS',
      data: { coinId, timeframe, indicatorType }
    });
  }, [sendMessage]);

  const requestHistoricalData = useCallback((coinId: number, timeframe: string, limit?: number) => {
    sendMessage({
      type: 'REQUEST_HISTORICAL_DATA',
      data: { coinId, timeframe, limit }
    });
  }, [sendMessage]);

  const registerMessageHandler = useCallback((messageType: string, handler: (data: any) => void) => {
    messageHandlers.current.set(messageType, handler);
  }, []);

  const unregisterMessageHandler = useCallback((messageType: string) => {
    messageHandlers.current.delete(messageType);
  }, []);

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    subscribeToCoin,
    requestIndicators,
    requestHistoricalData,
    registerMessageHandler,
    unregisterMessageHandler
  };
}

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { CoinData, ChatMessage } from '../types/crypto';

interface AIAssistantProps {
  selectedCoin?: CoinData;
  selectedTimeframe: string;
}

interface ChatMessageDisplay {
  id: string;
  message: string;
  response?: string;
  timestamp: Date;
  isUser: boolean;
}

export function AIAssistant({ selectedCoin, selectedTimeframe }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessageDisplay = {
      id: 'welcome',
      message: '',
      response: `Welcome to Crypto Intel Assistant! I'm here to help you analyze cryptocurrency markets. ${
        selectedCoin ? `Currently analyzing ${selectedCoin.symbol} on ${selectedTimeframe} timeframe.` : ''
      } Ask me about indicators, trends, or market analysis.`,
      timestamp: new Date(),
      isUser: false
    };
    setMessages([welcomeMessage]);
  }, [selectedCoin, selectedTimeframe]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', {
        message,
        userId: 1, // Default user for demo
        coinSymbol: selectedCoin?.symbol,
        timeframe: selectedTimeframe
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Update the last message with the response
      setMessages(prev => 
        prev.map((msg, index) => 
          index === prev.length - 1 ? { ...msg, response: data.response } : msg
        )
      );
    },
    onError: (error) => {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage: ChatMessageDisplay = {
        id: Date.now().toString(),
        message: '',
        response: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessageDisplay = {
      id: Date.now().toString(),
      message: inputMessage,
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickSuggestions = [
    'Analysis',
    'Signals', 
    'Targets'
  ];

  const handleQuickSuggestion = (suggestion: string) => {
    let message = '';
    switch (suggestion) {
      case 'Analysis':
        message = selectedCoin 
          ? `Provide a detailed analysis for ${selectedCoin.symbol} on ${selectedTimeframe} timeframe`
          : 'What indicators should I look at for market analysis?';
        break;
      case 'Signals':
        message = selectedCoin
          ? `What are the current bullish and bearish signals for ${selectedCoin.symbol}?`
          : 'What are the most reliable trading signals?';
        break;
      case 'Targets':
        message = selectedCoin
          ? `What are the support and resistance levels for ${selectedCoin.symbol}?`
          : 'How do I identify price targets?';
        break;
    }
    setInputMessage(message);
  };

  return (
    <div className="w-96 bg-crypto-card border-l border-crypto-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-crypto-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-crypto-accent to-purple-500 rounded-full flex items-center justify-center">
            <Bot className="text-white h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-gray-400">Crypto Market Analyst</p>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {messages.map((message) => (
          <div key={message.id} className="bg-crypto-dark rounded-lg p-4">
            <div className="flex items-start space-x-3">
              {message.isUser ? (
                <>
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">{message.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 bg-crypto-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 text-crypto-dark" />
                  </div>
                  <div className="space-y-2 flex-1">
                    {message.response ? (
                      <div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.response}</p>
                        {message.response.includes('BULLISH') && (
                          <div className="mt-3 p-3 bg-bullish/10 border border-bullish/20 rounded-lg">
                            <p className="text-sm font-medium text-bullish">💡 AI Suggestion: CAUTIOUSLY BULLISH</p>
                            <p className="text-xs text-gray-300 mt-1">Consider DCA strategy. Always do your own research.</p>
                          </div>
                        )}
                        {message.response.includes('BEARISH') && (
                          <div className="mt-3 p-3 bg-bearish/10 border border-bearish/20 rounded-lg">
                            <p className="text-sm font-medium text-bearish">⚠️ AI Suggestion: BEARISH TREND</p>
                            <p className="text-xs text-gray-300 mt-1">Exercise caution. Monitor key support levels.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-crypto-accent"></div>
                        <span className="text-xs text-gray-400">Analyzing...</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t border-crypto-border">
        <div className="flex items-center space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about indicators, trends, or analysis..."
            className="flex-1 bg-crypto-dark border-crypto-border text-white focus:border-crypto-accent"
            disabled={chatMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || chatMutation.isPending}
            className="bg-crypto-accent text-crypto-dark hover:bg-crypto-accent/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>Quick suggestions:</span>
          <div className="flex items-center space-x-1">
            {quickSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                className="px-2 py-1 h-6 text-xs bg-crypto-dark hover:bg-crypto-border text-gray-300"
                onClick={() => handleQuickSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

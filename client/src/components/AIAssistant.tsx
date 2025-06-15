// client/src/components/AIAssistant.tsx
"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatAssistant, ChatMessageDisplay } from "@/hooks/useChatAssistant";
import type { CoinData } from "@/types/crypto";

interface AIAssistantProps {
  selectedCoin?: CoinData;
  selectedTimeframe?: string;
}

export function AIAssistant({
  selectedCoin,
  selectedTimeframe,
}: AIAssistantProps) {
  const { messages, sendMessage, isLoading } = useChatAssistant(
    selectedCoin,
    selectedTimeframe
  );

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage.trim());
    setInputMessage("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat history */}
      <div
        className="flex-1 overflow-auto p-4 space-y-2"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg: ChatMessageDisplay) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 rounded-lg ${
                msg.isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4 flex space-x-2">
        <Input
          placeholder="Type your message..."
          value={inputMessage}
          onChange={handleChange}
          disabled={isLoading}
          aria-label="Type your message"
        />
        <Button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  );
}

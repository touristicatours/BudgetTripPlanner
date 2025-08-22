import { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, LoadingSpinner, showToast } from './Kit';

export function AIChat({ onEnhanceSearch, className = "" }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI travel assistant. I can help you plan your trip, suggest destinations, and enhance your search requests. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: conversationHistory
        })
      });

      const data = await response.json();
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.response,
        timestamp: new Date(),
        notice: data.notice
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update conversation history for context
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: inputMessage },
        { role: 'assistant', content: data.response }
      ]);

      if (data.live) {
        showToast('AI assistance provided!', 'success');
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      showToast('AI chat failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhanceSearch = async () => {
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRequest: inputMessage,
          currentParams: {}
        })
      });

      const data = await response.json();
      
      if (data.enhancedParams && onEnhanceSearch) {
        onEnhanceSearch(data.enhancedParams, data.suggestions);
        showToast('Search enhanced with AI suggestions!', 'success');
      }
    } catch (error) {
      console.error('AI enhancement error:', error);
      showToast('AI enhancement failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">🤖</span>
          AI Travel Assistant
        </h3>
        <div className="flex space-x-2">
          <Button
            onClick={handleEnhanceSearch}
            disabled={!inputMessage.trim() || isLoading}
            size="sm"
            variant="secondary"
          >
            Enhance Search
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto mb-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-orange-500 text-white'
                  : message.isError
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm">{message.content}</div>
              {message.notice && (
                <div className="text-xs mt-1 opacity-75">
                  {message.notice}
                </div>
              )}
              <div className="text-xs mt-1 opacity-60">
                {isClient ? (
                  message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : new Date(message.timestamp).toLocaleTimeString()
                ) : (
                  message.timestamp instanceof Date ? message.timestamp.toISOString() : new Date(message.timestamp).toISOString()
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about destinations, dates, budget, or anything travel-related..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          size="sm"
        >
          Send
        </Button>
      </div>

      {/* Quick Suggestions */}
      <div className="mt-3">
        <p className="text-xs text-gray-500 mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "I want a budget trip to Europe",
            "Best time to visit Tokyo?",
            "Family vacation suggestions",
            "Luxury travel options"
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(suggestion)}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

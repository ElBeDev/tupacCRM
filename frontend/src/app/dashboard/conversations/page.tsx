'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import AIAssistant from '@/components/ai/AIAssistant';

interface Message {
  id: string;
  content: string;
  direction: 'incoming' | 'outgoing';
  timestamp: string;
  status?: string;
}

interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  channel: string;
  status: string;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    loadConversations();
    
    // Initialize Socket.IO
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const newSocket = io(WS_URL);
    
    newSocket.on('connect', () => {
      console.log('Socket connected for conversations');
    });

    newSocket.on('message:new', (data: any) => {
      console.log('📨 New message received:', data);
      // Update conversations list
      loadConversations();
      
      // If this conversation is selected, reload messages
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        loadMessages(selectedConversation.id);
      }
    });

    newSocket.on('message:received', (data: any) => {
      console.log('Message received event:', data);
      loadConversations();
      
      if (selectedConversation && data.conversationId === selectedConversation.id) {
        loadMessages(selectedConversation.id);
      }
    });

    newSocket.on('ai:analysis', (data: any) => {
      console.log('🤖 AI Analysis received:', data);
      // Refresh conversations to show updated status/score
      loadConversations();
      
      // Show notification
      if (data.analysis) {
        console.log(`AI: ${data.analysis.sentiment} - Score: ${data.analysis.suggestedScore}`);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [selectedConversation]); // Add selectedConversation to dependencies

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await api.get(`/api/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Optimistically add message
      const tempMsg: Message = {
        id: 'temp-' + Date.now(),
        content: messageContent,
        direction: 'outgoing',
        timestamp: new Date().toISOString(),
        status: 'sending',
      };
      setMessages(prev => [...prev, tempMsg]);

      // Send message
      await api.post('/whatsapp/send', {
        to: selectedConversation.contactPhone,
        message: messageContent,
        conversationId: selectedConversation.id,
      });

      // Socket.IO will update messages automatically via 'message:new' event
      // No need to reload manually anymore
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar mensaje');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== 'temp-' + Date.now()));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.contactPhone.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversaciones</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar conversaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">No hay conversaciones</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedConversation?.id === conv.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                  }`}
                >
                  <div className="flex-shrink-0 relative">
                    {getChannelIcon(conv.channel)}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {conv.contactName}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{conv.contactPhone}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex">
            {/* Chat Content */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getChannelIcon(selectedConversation.channel)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedConversation.contactName}</h3>
                    <p className="text-sm text-gray-500">{selectedConversation.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    selectedConversation.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedConversation.status}
                  </span>
                  <button 
                    onClick={() => setShowAI(!showAI)}
                    className={`p-2 rounded-lg transition-colors ${
                      showAI ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                    title="Asistente IA"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p className="text-sm">No hay mensajes en esta conversación</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'outgoing'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <div className={`flex items-center justify-end space-x-1 mt-1 ${
                        message.direction === 'outgoing' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(message.timestamp)}</span>
                        {message.direction === 'outgoing' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            {message.status === 'sent' ? (
                              <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            ) : message.status === 'delivered' ? (
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                            ) : (
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                            )}
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Escribe un mensaje..."
                  rows={1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ minHeight: '42px', maxHeight: '120px' }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Presiona Enter para enviar, Shift+Enter para nueva línea</p>
            </form>
            </div>

            {/* AI Panel */}
            {showAI && (
              <div className="w-96 border-l border-gray-200 bg-gray-50 overflow-y-auto">
                <AIAssistant 
                  conversationId={selectedConversation.id}
                  onAnalysisComplete={(analysis) => {
                    console.log('AI Analysis:', analysis);
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
              <p className="text-sm">Elige una conversación de la lista para comenzar a chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

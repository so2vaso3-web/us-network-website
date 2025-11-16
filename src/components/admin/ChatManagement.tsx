'use client';

import { useState, useEffect, useRef } from 'react';
import AlertModal from '@/components/AlertModal';
import ConfirmModal from '@/components/ConfirmModal';

interface Message {
  id: string;
  visitorId: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
  read: boolean;
}

interface Conversation {
  visitorId: string;
  name: string;
  email: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function ChatManagement() {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '', type: 'warning' as 'info' | 'success' | 'warning' | 'error' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: () => {}, type: 'danger' as 'info' | 'warning' | 'danger', confirmText: 'Confirm', cancelText: 'Cancel' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false); // Track xem có request đang pending không để tránh race condition
  const selectedVisitorIdRef = useRef<string | null>(null); // Lưu visitorId đã chọn để tránh bị reset khi loadMessages()

  useEffect(() => {
    loadMessages();
    // Polling để cập nhật NHANH - SỬA: Giảm xuống 1 giây để nhận tin nhắn mới từ khách nhanh hơn
    const interval = setInterval(loadMessages, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadMessages được định nghĩa trong component, không cần dependency

  useEffect(() => {
    if (messagesEndRef.current && selectedConversation) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConversation]);

  const loadMessages = async () => {
    // Tránh race condition: Nếu có request đang pending, skip
    if (isLoadingRef.current) {
      return;
    }
    
    isLoadingRef.current = true;
    
    try {
      // Load từ server trước (Vercel KV)
      const response = await fetch(`/api/chat?t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
        cache: 'no-store',
      });

      let messages: Message[] = [];
      let serverMessages: Message[] = [];
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.messages)) {
          serverMessages = data.messages;
        }
      }
      
      // MERGE với localStorage để không mất messages (SỬA: Tránh mất tin nhắn khi spam)
      if (typeof window !== 'undefined') {
        const localMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        if (Array.isArray(localMessages) && localMessages.length > 0) {
          // Merge: Ưu tiên server, nhưng giữ lại local nếu chưa có trong server HOẶC local mới hơn
          const messageMap = new Map<string, Message>();
          
          // Thêm messages từ server trước (ưu tiên)
          serverMessages.forEach((m: Message) => {
            messageMap.set(m.id, m);
          });
          
          // Thêm messages từ local nếu chưa có trong server HOẶC local mới hơn (để giữ tin nhắn vừa gửi)
          localMessages.forEach((m: Message) => {
            const existing = messageMap.get(m.id);
            if (!existing) {
              // Chưa có trong server, thêm vào (tin nhắn mới vừa gửi)
              messageMap.set(m.id, m);
            } else {
              // Có trong cả 2, so sánh timestamp để giữ bản mới hơn
              const localTime = new Date(m.timestamp).getTime();
              const serverTime = new Date(existing.timestamp).getTime();
              if (localTime > serverTime) {
                // Local mới hơn (tin nhắn vừa gửi), giữ lại
                messageMap.set(m.id, m);
              }
            }
          });
          
          // Convert map to array
          messages = Array.from(messageMap.values());
          
          // Update localStorage với merged data
          localStorage.setItem('chatMessages', JSON.stringify(messages));
        } else {
          // Không có trong localStorage, dùng server
          messages = serverMessages;
          if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
          }
        }
      } else {
        // Không có localStorage, dùng server
        messages = serverMessages;
      }
      
      // Fallback: Nếu server không có, thử load từ localStorage
      if (messages.length === 0 && typeof window !== 'undefined') {
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            messages = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            console.error('Error parsing localStorage:', e);
          }
        }
      }
      
      if (messages.length > 0) {
        try {
          // Sort messages by timestamp để đảm bảo thứ tự đúng trước khi so sánh
          messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          // CHỈ update nếu có thay đổi thực sự để tránh re-render không cần thiết - SỬA LOGIC SO SÁNH ĐỂ TRÁNH FLICKER (CẢI THIỆN)
          setAllMessages(prev => {
            // So sánh sâu để tránh update không cần thiết - SỬA: So sánh theo ID map thay vì index
            if (prev.length !== messages.length) {
              return messages;
            }
            
            // Tạo map từ prev để so sánh nhanh hơn và chính xác hơn
            const prevMap = new Map(prev.map(m => [m.id, m]));
            
            // So sánh từng message theo ID - chính xác hơn so với so sánh theo index
            const hasChanges = messages.some(curr => {
              const prevMsg = prevMap.get(curr.id);
              if (!prevMsg) return true; // Message mới
              
              // So sánh tất cả các trường quan trọng để tránh flicker
              return prevMsg.message !== curr.message || 
                     prevMsg.timestamp !== curr.timestamp ||
                     prevMsg.read !== curr.read ||
                     prevMsg.isAdmin !== curr.isAdmin ||
                     prevMsg.name !== curr.name ||
                     prevMsg.email !== curr.email ||
                     prevMsg.visitorId !== curr.visitorId;
            });
            
            // Chỉ update khi có thay đổi thực sự
            if (!hasChanges) {
              return prev; // Giữ nguyên state cũ để tránh flicker
            }
            
            return messages; // Có thay đổi, update
          });

          // Group messages by visitorId
          const conversationMap = new Map<string, Conversation>();
          
          messages.forEach((msg: Message) => {
            if (!msg.visitorId) return; // Skip old messages without visitorId
            
            if (!conversationMap.has(msg.visitorId)) {
              const customerMsg = messages.find((m: Message) => m.visitorId === msg.visitorId && !m.isAdmin);
              conversationMap.set(msg.visitorId, {
                visitorId: msg.visitorId,
                name: customerMsg?.name || 'Anonymous',
                email: customerMsg?.email || '',
                lastMessage: msg.message,
                lastMessageTime: msg.timestamp,
                unreadCount: 0,
                messages: [],
              });
            }
            
            const conv = conversationMap.get(msg.visitorId)!;
            conv.messages.push(msg);
            
            if (msg.timestamp > conv.lastMessageTime) {
              conv.lastMessage = msg.message;
              conv.lastMessageTime = msg.timestamp;
            }
            
            if (!msg.read && !msg.isAdmin) {
              conv.unreadCount++;
            }
          });

          // Convert map to array and sort by last message time
          const convs = Array.from(conversationMap.values()).sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
          );
          
          // CHỈ update nếu có thay đổi - SỬA LOGIC SO SÁNH ĐỂ TRÁNH FLICKER
          setConversations(prev => {
            if (prev.length !== convs.length) {
              return convs;
            }
            
            // So sánh sâu để tránh update không cần thiết
            const hasChanges = prev.some((p, idx) => {
              const curr = convs[idx];
              if (!curr) return true;
              // So sánh tất cả các trường quan trọng
              return p.visitorId !== curr.visitorId || 
                     p.lastMessage !== curr.lastMessage || 
                     p.lastMessageTime !== curr.lastMessageTime ||
                     p.unreadCount !== curr.unreadCount ||
                     p.name !== curr.name ||
                     p.email !== curr.email ||
                     p.messages.length !== curr.messages.length;
            });
            
            // Chỉ update khi có thay đổi thực sự
            if (!hasChanges) {
              return prev; // Giữ nguyên state cũ để tránh flicker
            }
            
            return convs; // Có thay đổi, update
          });
          
          // Update selected conversation nếu đang mở - SỬA: Dùng ref để tránh bị reset
          if (selectedVisitorIdRef.current) {
            const updatedConv = convs.find(c => c.visitorId === selectedVisitorIdRef.current);
            if (updatedConv) {
              // CHỈ update nếu có thay đổi - SỬA LOGIC SO SÁNH ĐỂ TRÁNH FLICKER
              setSelectedConversation(prev => {
                if (!prev || prev.messages.length !== updatedConv.messages.length) {
                  return updatedConv;
                }
                
                // So sánh sâu tất cả các messages
                const hasChanges = prev.messages.some((p, idx) => {
                  const curr = updatedConv.messages[idx];
                  if (!curr) return true;
                  // So sánh tất cả các trường quan trọng
                  return p.id !== curr.id || 
                         p.message !== curr.message || 
                         p.timestamp !== curr.timestamp ||
                         p.read !== curr.read ||
                         p.isAdmin !== curr.isAdmin;
                });
                
                // Chỉ update khi có thay đổi thực sự
                if (!hasChanges) {
                  return prev; // Giữ nguyên state cũ để tránh flicker
                }
                
                return updatedConv; // Có thay đổi, update
              });
            }
            // Nếu không tìm thấy conversation, giữ nguyên selection (không reset)
          }
        } catch (e) {
          console.error('Error processing messages:', e);
          // KHÔNG clear messages nếu có lỗi, giữ lại để không mất
        }
      } else {
        // Chỉ clear nếu thực sự không có messages VÀ không có trong localStorage
        if (typeof window !== 'undefined') {
          const localMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
          if (localMessages.length === 0) {
            setAllMessages([]);
            setConversations([]);
          }
        } else {
          setAllMessages([]);
          setConversations([]);
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // KHÔNG clear messages nếu có lỗi, load từ localStorage
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chatMessages');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAllMessages(parsed);
              // Process conversations từ local
              const conversationMap = new Map<string, Conversation>();
              parsed.forEach((msg: Message) => {
                if (!msg.visitorId) return;
                if (!conversationMap.has(msg.visitorId)) {
                  const customerMsg = parsed.find((m: Message) => m.visitorId === msg.visitorId && !m.isAdmin);
                  conversationMap.set(msg.visitorId, {
                    visitorId: msg.visitorId,
                    name: customerMsg?.name || 'Anonymous',
                    email: customerMsg?.email || '',
                    lastMessage: msg.message,
                    lastMessageTime: msg.timestamp,
                    unreadCount: 0,
                    messages: [],
                  });
                }
                const conv = conversationMap.get(msg.visitorId)!;
                conv.messages.push(msg);
                if (msg.timestamp > conv.lastMessageTime) {
                  conv.lastMessage = msg.message;
                  conv.lastMessageTime = msg.timestamp;
                }
                if (!msg.read && !msg.isAdmin) {
                  conv.unreadCount++;
                }
              });
              const convs = Array.from(conversationMap.values()).sort((a, b) => 
                new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
              );
              setConversations(convs);
            }
          } catch (e) {
            console.error('Error loading from localStorage:', e);
          }
        }
      }
    } finally {
      // Reset loading flag sau khi hoàn thành (dù thành công hay thất bại)
      isLoadingRef.current = false;
    }
  };

  const markConversationAsRead = async (visitorId: string) => {
    const updated = allMessages.map(msg => 
      msg.visitorId === visitorId && !msg.isAdmin ? { ...msg, read: true } : msg
    );
    setAllMessages(updated);
    localStorage.setItem('chatMessages', JSON.stringify(updated));
    
    // Update conversations state ngay lập tức (optimistic update)
    setConversations(prev => prev.map(conv => 
      conv.visitorId === visitorId 
        ? { ...conv, unreadCount: 0 }
        : conv
    ));
    
    // Save to server (không block UI)
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updated }),
    }).catch(error => {
      console.error('Error saving to server:', error);
    });
    
    // Reload để sync
    loadMessages();
  };

  const markAllAsRead = async () => {
    const updated = allMessages.map(msg => ({ ...msg, read: true }));
    setAllMessages(updated);
    localStorage.setItem('chatMessages', JSON.stringify(updated));
    
    // Save to server
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
    } catch (error) {
      console.error('Error saving to server:', error);
    }
    
    loadMessages();
  };

  const deleteConversation = async (visitorId: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Bạn có chắc chắn muốn xóa toàn bộ cuộc trò chuyện này?',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        setConfirmModal({ ...confirmModal, isOpen: false });
        const updated = allMessages.filter(msg => msg.visitorId !== visitorId);
        setAllMessages(updated);
        localStorage.setItem('chatMessages', JSON.stringify(updated));
      
        // Save to server
        try {
          await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: updated }),
          });
        } catch (error) {
          console.error('Error saving to server:', error);
        }
        
        if (selectedConversation?.visitorId === visitorId) {
          selectedVisitorIdRef.current = null; // Clear ref khi xóa conversation
          setSelectedConversation(null);
        }
        loadMessages();
        setAlertModal({ isOpen: true, message: 'Đã xóa cuộc trò chuyện thành công!', type: 'success' });
      },
    });
  };

  const sendReply = async (conversation: Conversation) => {
    if (!replyText.trim()) {
      setAlertModal({ isOpen: true, message: 'Please enter a reply message!', type: 'warning' });
      return;
    }

    if (!conversation.visitorId) {
      setAlertModal({ isOpen: true, message: 'Error: Visitor ID not found!', type: 'error' });
      return;
    }

    const reply: Message = {
      id: `reply-${Date.now()}`,
      visitorId: conversation.visitorId,
      name: 'Admin',
      email: '',
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: true,
      read: false,
    };

    const updated = [...allMessages, reply];
    
    // Mark all customer messages in this conversation as read
    const updatedWithRead = updated.map(msg => 
      msg.visitorId === conversation.visitorId && !msg.isAdmin ? { ...msg, read: true } : msg
    );
    
    // SỬA: Sort messages trước khi update để đảm bảo thứ tự đúng
    updatedWithRead.sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    setAllMessages(updatedWithRead);
    localStorage.setItem('chatMessages', JSON.stringify(updatedWithRead));
    
    // Update selected conversation để hiển thị reply ngay - SỬA: Sort messages
    if (selectedConversation?.visitorId === conversation.visitorId) {
      const updatedConvMessages = updatedWithRead.filter(msg => msg.visitorId === conversation.visitorId);
      updatedConvMessages.sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setSelectedConversation({
        ...selectedConversation,
        messages: updatedConvMessages,
        lastMessage: reply.message,
        lastMessageTime: reply.timestamp,
        unreadCount: 0,
      });
    }
    
    // Save to server TRƯỚC, sau đó reload ngay để sync (SỬA: Check ngay lập tức)
    try {
      const saveResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedWithRead }),
      });
      
      if (!saveResponse.ok) {
        console.error('Failed to save reply to server:', saveResponse.status, saveResponse.statusText);
      } else {
        console.log('Reply saved to server successfully');
        // Reload messages ngay sau khi save thành công để sync
        setTimeout(() => {
          loadMessages();
        }, 300); // Giảm thời gian chờ xuống 300ms
      }
    } catch (error) {
      console.error('Error saving reply to server:', error);
    }
    
    // Gửi notification qua Telegram (không block)
    fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: conversation.name,
        email: conversation.email,
        message: `📤 Admin Reply:\n${replyText.trim()}`,
        visitorId: conversation.visitorId,
        isReply: true,
      }),
    }).catch(error => {
      console.error('Error sending Telegram notification:', error);
    });
    
    setReplyText('');
    
    // Reload messages sau khi save xong để sync (delay ngắn hơn để mượt mà hơn)
    setTimeout(() => {
      loadMessages();
    }, 500);
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread') return conv.unreadCount > 0;
    if (filter === 'read') return conv.unreadCount === 0;
    return true;
  });

  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Quản Lý Tin Nhắn Chat
          </h2>
          <p className="text-gray-400 text-sm">Quản lý và trả lời tin nhắn từ khách hàng</p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-check-double"></i>
              <span>Đánh Dấu Tất Cả Đã Đọc ({unreadCount})</span>
            </button>
          )}
          <button
            onClick={loadMessages}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Làm Mới</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="fas fa-comments text-blue-400 text-2xl"></i>
            <span className="text-3xl font-bold text-white">{conversations.length}</span>
          </div>
          <p className="text-gray-400 text-sm">Tổng Cuộc Trò Chuyện</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="fas fa-envelope-open text-yellow-400 text-2xl"></i>
            <span className="text-3xl font-bold text-white">{unreadCount}</span>
          </div>
          <p className="text-gray-400 text-sm">Tin Nhắn Chưa Đọc</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <i className="fas fa-check-double text-green-400 text-2xl"></i>
            <span className="text-3xl font-bold text-white">{allMessages.length}</span>
          </div>
          <p className="text-gray-400 text-sm">Tổng Tin Nhắn</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
            filter === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Tất Cả
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 font-semibold flex items-center gap-2 ${
            filter === 'unread'
              ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          <span>Chưa Đọc</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs">{unreadCount}</span>
          )}
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
            filter === 'read'
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Đã Đọc
        </button>
      </div>

      {/* Conversations List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations Sidebar */}
        <div className="lg:col-span-1 bg-white/5 rounded-xl p-4 border border-white/10 max-h-[600px] overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <i className="fas fa-inbox text-4xl mb-3 opacity-50"></i>
              <p>Không có cuộc trò chuyện nào</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.visitorId}
                  onClick={() => {
                    selectedVisitorIdRef.current = conv.visitorId; // Lưu visitorId vào ref để tránh bị reset
                    setSelectedConversation(conv);
                    markConversationAsRead(conv.visitorId);
                  }}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                    selectedConversation?.visitorId === conv.visitorId
                      ? 'bg-blue-600/30 border-blue-500'
                      : conv.unreadCount > 0
                      ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">{conv.name}</div>
                      <div className="text-xs text-gray-400 mb-1">{conv.email || 'No email'}</div>
                      <div className="text-xs text-gray-500 font-mono mb-1">{conv.visitorId.substring(0, 20)}...</div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs font-bold text-white flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2 mb-2">{conv.lastMessage}</p>
                  <div className="text-xs text-gray-500">{formatTime(conv.lastMessageTime)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation Detail */}
        <div className="lg:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{selectedConversation.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedConversation.email || 'No email'}</p>
                  <p className="text-gray-500 text-xs mt-1 font-mono">ID: {selectedConversation.visitorId}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteConversation(selectedConversation.visitorId)}
                    className="px-3 py-1 bg-red-600 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    title="Xóa cuộc trò chuyện"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-6 max-h-[400px] pr-2">
                {selectedConversation.messages
                  .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-4 ${
                          msg.isAdmin
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <div className="text-xs font-semibold mb-1 opacity-80">
                          {msg.isAdmin ? 'Admin' : msg.name}
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className="text-xs mt-2 opacity-70">{formatTime(msg.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <div className="border-t border-white/10 pt-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
                      e.preventDefault();
                      sendReply(selectedConversation);
                    }
                  }}
                  placeholder="Type your reply message..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-3 resize-none"
                  rows={3}
                />
                <button
                  onClick={() => {
                    if (selectedConversation && replyText.trim()) {
                      sendReply(selectedConversation);
                    }
                  }}
                  disabled={!replyText.trim() || !selectedConversation}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    replyText.trim() && selectedConversation
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/50 cursor-pointer'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <i className="fas fa-paper-plane"></i>
                  <span>Send Reply</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="fas fa-comments text-6xl mb-4 opacity-50"></i>
                <p>Chọn một cuộc trò chuyện để xem chi tiết và trả lời</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      />
    </div>
  );
}


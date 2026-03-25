'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Send, Search, Phone, Video, MoreVertical } from 'lucide-react';
import { mockConversations, mockMessages, instructors } from '@/lib/mock-data';
import Link from 'next/link';
import styles from './messages.module.css';

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeConv, setActiveConv] = useState(mockConversations[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  if (!isAuthenticated) {
    return <div className={styles.authPrompt}><h2>Please <Link href="/login">sign in</Link> to access messages</h2></div>;
  }

  const activeConversation = mockConversations.find(c => c.id === activeConv);
  const otherUser = activeConversation?.participants.find(p => p.id !== 'student-1');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: `m-${Date.now()}`,
      senderId: 'student-1',
      receiverId: otherUser?.id || '',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: false,
    }]);
    setNewMessage('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Messages</h2>
            <div className={styles.searchBar}>
              <Search size={16} />
              <input placeholder="Search conversations..." />
            </div>
          </div>
          <div className={styles.convList}>
            {mockConversations.map(conv => {
              const other = conv.participants.find(p => p.id !== 'student-1');
              return (
                <button
                  key={conv.id}
                  className={`${styles.convItem} ${conv.id === activeConv ? styles.convItemActive : ''}`}
                  onClick={() => setActiveConv(conv.id)}
                >
                  <img src={other?.avatar} alt="" className={styles.convAvatar} />
                  <div className={styles.convInfo}>
                    <strong>{other?.name}</strong>
                    <p>{conv.lastMessage.content}</p>
                  </div>
                  {conv.unreadCount > 0 && <span className={styles.unreadBadge}>{conv.unreadCount}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className={styles.chatArea}>
          <div className={styles.chatHeader}>
            <img src={otherUser?.avatar} alt="" className={styles.chatAvatar} />
            <div>
              <strong>{otherUser?.name}</strong>
              <span className={styles.onlineStatus}>Online</span>
            </div>
            <div className={styles.chatActions}>
              <button className={styles.chatActionBtn}><Phone size={18} /></button>
              <button className={styles.chatActionBtn}><Video size={18} /></button>
              <button className={styles.chatActionBtn}><MoreVertical size={18} /></button>
            </div>
          </div>

          <div className={styles.messageList}>
            {messages.map(msg => (
              <div key={msg.id} className={`${styles.message} ${msg.senderId === 'student-1' ? styles.sent : styles.received}`}>
                <div className={styles.messageBubble}>
                  <p>{msg.content}</p>
                  <span className={styles.messageTime}>
                    {new Date(msg.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.inputArea}>
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className={styles.messageInput}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button className={styles.sendBtn} onClick={handleSend} disabled={!newMessage.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

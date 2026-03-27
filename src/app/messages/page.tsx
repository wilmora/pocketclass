'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useConversations, useMessages, sendMessage } from '@/lib/hooks';
import { Send, Search, Phone, Video, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import styles from './messages.module.css';

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id || '';

  const { conversations, loading: convsLoading } = useConversations(userId);
  const [activeConv, setActiveConv] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<
    { id: string; senderId: string; receiverId: string; content: string; timestamp: string; isRead: boolean }[]
  >([]);

  // Derive active conversation and partner
  const effectiveActiveConv = activeConv || conversations[0]?.id || '';
  const activeConversation = conversations.find(c => c.id === effectiveActiveConv);
  const otherUser = activeConversation?.participants.find(p => p.id !== userId);
  const partnerId = otherUser?.id || '';

  const { messages: hookMessages, loading: msgsLoading } = useMessages(userId, partnerId);

  // Combine hook messages with optimistic messages for the current partner
  const messages = [
    ...hookMessages,
    ...optimisticMessages.filter(
      m =>
        (m.senderId === userId && m.receiverId === partnerId) ||
        (m.senderId === partnerId && m.receiverId === userId)
    ),
  ];

  if (!isAuthenticated) {
    return <div className={styles.authPrompt}><h2>Please <Link href="/login">sign in</Link> to access messages</h2></div>;
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !partnerId || sending) return;
    const content = newMessage;
    setNewMessage('');
    setSending(true);
    try {
      const msg = await sendMessage(userId, partnerId, content);
      // Add to optimistic messages so it appears immediately (demo mode has no realtime subscription)
      setOptimisticMessages(prev => [...prev, msg]);
    } catch {
      // Restore message on failure
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  if (convsLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h2>Messages</h2>
            </div>
            <div className={styles.convList}>
              <p style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading conversations...</p>
            </div>
          </div>
          <div className={styles.chatArea}>
            <div className={styles.messageList}>
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {conversations.map(conv => {
              const other = conv.participants.find(p => p.id !== userId);
              return (
                <button
                  key={conv.id}
                  className={`${styles.convItem} ${conv.id === effectiveActiveConv ? styles.convItemActive : ''}`}
                  onClick={() => {
                    setActiveConv(conv.id);
                    setOptimisticMessages([]);
                  }}
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
            {msgsLoading ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading messages...</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`${styles.message} ${msg.senderId === userId ? styles.sent : styles.received}`}>
                  <div className={styles.messageBubble}>
                    <p>{msg.content}</p>
                    <span className={styles.messageTime}>
                      {new Date(msg.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
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
            <button className={styles.sendBtn} onClick={handleSend} disabled={!newMessage.trim() || sending}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

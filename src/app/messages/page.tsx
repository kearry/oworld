// src/app/messages/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Loader2, Send, Search, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/lib/validations';

interface Conversation {
    id: string;
    userId: string;
    username: string;
    handle: string;
    profileImage: string | null;
    lastMessage: string;
    timestamp: string;
    unread: boolean;
}

interface MessageWithUser extends Message {
    sender: {
        id: string;
        username: string;
        handle: string;
        profileImage: string | null;
    };
}

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<MessageWithUser[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch conversations when component mounts
    useEffect(() => {
        if (status === 'authenticated') {
            fetchConversations();
        }
    }, [status]);

    // Fetch messages when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.userId);
        }
    }, [activeConversation]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // For demo purposes, generate sample conversations if API is not implemented
    useEffect(() => {
        if (status === 'authenticated' && loading) {
            // Sample conversations
            const sampleConversations: Conversation[] = [
                {
                    id: '1',
                    userId: 'user1',
                    username: 'Jane Smith',
                    handle: '@janesmith',
                    profileImage: 'https://i.pravatar.cc/150?img=1',
                    lastMessage: 'Hey, how are you doing?',
                    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
                    unread: true,
                },
                {
                    id: '2',
                    userId: 'user2',
                    username: 'John Doe',
                    handle: '@johndoe',
                    profileImage: 'https://i.pravatar.cc/150?img=2',
                    lastMessage: 'Did you see the latest post?',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
                    unread: false,
                },
                {
                    id: '3',
                    userId: 'user3',
                    username: 'Alex Johnson',
                    handle: '@alexj',
                    profileImage: 'https://i.pravatar.cc/150?img=3',
                    lastMessage: 'Thanks for sharing that article!',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
                    unread: false,
                },
            ];

            setConversations(sampleConversations);
            setLoading(false);

            // Set first conversation as active
            if (sampleConversations.length > 0) {
                setActiveConversation(sampleConversations[0]);
            }
        }
    }, [status, loading]);

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/messages/conversations');

            if (!response.ok) {
                throw new Error('Failed to fetch conversations');
            }

            const data = await response.json();
            setConversations(data);

            // Set first conversation as active
            if (data.length > 0) {
                setActiveConversation(data[0]);
            }
        } catch (err) {
            setError('Failed to load conversations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/messages/${userId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const data = await response.json();
            setMessages(data);

            // Mark conversation as read
            setConversations(prev =>
                prev.map(conv =>
                    conv.userId === userId ? { ...conv, unread: false } : conv
                )
            );
        } catch (err) {
            setError('Failed to load messages');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // For demo purposes, generate sample messages if API is not implemented
    useEffect(() => {
        if (activeConversation && messages.length === 0) {
            // Sample messages
            const sampleMessages: MessageWithUser[] = [
                {
                    id: '1',
                    content: 'Hey there!',
                    senderId: activeConversation.userId,
                    recipientId: session?.user.id || '',
                    read: true,
                    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
                    sender: {
                        id: activeConversation.userId,
                        username: activeConversation.username,
                        handle: activeConversation.handle,
                        profileImage: activeConversation.profileImage,
                    },
                },
                {
                    id: '2',
                    content: 'Hi! How are you doing?',
                    senderId: session?.user.id || '',
                    recipientId: activeConversation.userId,
                    read: true,
                    createdAt: new Date(Date.now() - 1000 * 60 * 29).toISOString(), // 29 minutes ago
                    sender: {
                        id: session?.user.id || '',
                        username: session?.user.username || '',
                        handle: session?.user.handle || '',
                        profileImage: session?.user.image || null,
                    },
                },
                {
                    id: '3',
                    content: 'I'm good, thanks! Just checking out the new features on the platform.Have you seen the new analytics page?',
          senderId: activeConversation.userId,
                    recipientId: session?.user.id || '',
                    read: true,
                    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
                    sender: {
                        id: activeConversation.userId,
                        username: activeConversation.username,
                        handle: activeConversation.handle,
                        profileImage: activeConversation.profileImage,
                    },
                },
                {
                    id: '4',
                    content: 'Not yet, I'll have to check it out.I've been busy working on a new post.',
                    senderId: session?.user.id || '',
                    recipientId: activeConversation.userId,
                    read: true,
                    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
                    sender: {
                        id: session?.user.id || '',
                        username: session?.user.username || '',
                        handle: session?.user.handle || '',
                        profileImage: session?.user.image || null,
                    },
                },
            ];

            setMessages(sampleMessages);
        }
    }, [activeConversation, messages.length, session?.user]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user || !activeConversation || !newMessage.trim()) {
            return;
        }

        try {
            setSendingMessage(true);

            // Create new message object
            const messageData = {
                content: newMessage,
                recipientId: activeConversation.userId,
            };

            // In a real implementation, send to API
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messageData),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // For demo purposes, add message locally
            const newMsg: MessageWithUser = {
                id: `temp-${Date.now()}`,
                content: newMessage,
                senderId: session.user.id,
                recipientId: activeConversation.userId,
                read: false,
                createdAt: new Date().toISOString(),
                sender: {
                    id: session.user.id,
                    username: session.user.username,
                    handle: session.user.handle,
                    profileImage: session.user.image || null,
                },
            };

            setMessages(prev => [...prev, newMsg]);

            // Update last message in conversation list
            setConversations(prev =>
                prev.map(conv =>
                    conv.userId === activeConversation.userId
                        ? {
                            ...conv,
                            lastMessage: newMessage,
                            timestamp: new Date().toISOString(),
                        }
                        : conv
                )
            );

            // Clear input
            setNewMessage('');
        } catch (err) {
            setError('Failed to send message');
            console.error(err);
        } finally {
            setSendingMessage(false);
        }
    };

    // Filter conversations based on search query
    const filteredConversations = conversations.filter(
        conv =>
            conv.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            conv.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold mb-4">Sign in to access messages</h1>
                <p>You need to be signed in to use this feature.</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)]">
            <div className="flex h-full">
                {/* Conversations sidebar */}
                <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search messages"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading && conversations.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    onClick={() => setActiveConversation(conversation)}
                                    className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start space-x-3 
                              ${activeConversation?.id === conversation.id
                                            ? 'bg-gray-100 dark:bg-gray-700'
                                            : ''
                                        }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Image
                                            src={conversation.profileImage || '/default-avatar.png'}
                                            alt={conversation.username}
                                            width={50}
                                            height={50}
                                            className="rounded-full"
                                        />
                                        {conversation.unread && (
                                            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-medium truncate">{conversation.username}</h3>
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {conversation.lastMessage}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message content */}
                <div className="hidden md:flex flex-col flex-1 h-full">
                    {activeConversation ? (
                        <>
                            {/* Conversation header */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center">
                                    <Image
                                        src={activeConversation.profileImage || '/default-avatar.png'}
                                        alt={activeConversation.username}
                                        width={40}
                                        height={40}
                                        className="rounded-full mr-3"
                                    />
                                    <div>
                                        <h3 className="font-medium">{activeConversation.username}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {activeConversation.handle}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.senderId === session?.user.id ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-lg ${message.senderId === session?.user.id
                                                    ? 'bg-blue-500 text-white rounded-br-none'
                                                    : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'
                                                }`}
                                        >
                                            <p>{message.content}</p>
                                            <div
                                                className={`text-xs mt-1 ${message.senderId === session?.user.id ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message input */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700"
                                        disabled={sendingMessage}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || sendingMessage}
                                        className={`p-2 rounded-full ${!newMessage.trim() || sendingMessage
                                                ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                                                : 'bg-blue-500 hover:bg-blue-600'
                                            } text-white`}
                                    >
                                        {sendingMessage ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send size={20} />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <p className="mb-2">Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile view for active conversation */}
            {activeConversation && (
                <div
                    className={`fixed inset-0 z-50 md:hidden bg-white dark:bg-gray-800 ${activeConversation ? 'flex' : 'hidden'
                        } flex-col`}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                        <button onClick={() => setActiveConversation(null)} className="mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <Image
                            src={activeConversation.profileImage || '/default-avatar.png'}
                            alt={activeConversation.username}
                            width={40}
                            height={40}
                            className="rounded-full mr-3"
                        />
                        <div>
                            <h3 className="font-medium">{activeConversation.username}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activeConversation.handle}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.senderId === session?.user.id ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${message.senderId === session?.user.id
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-100 dark:bg-gray-700 rounded-bl-none'
                                        }`}
                                >
                                    <p>{message.content}</p>
                                    <div
                                        className={`text-xs mt-1 ${message.senderId === session?.user.id ? 'text-blue-100' : 'text-gray-500'
                                            }`}
                                    >
                                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-100 dark:bg-gray-700"
                                disabled={sendingMessage}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sendingMessage}
                                className={`p-2 rounded-full ${!newMessage.trim() || sendingMessage
                                        ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    } text-white`}
                            >
                                {sendingMessage ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
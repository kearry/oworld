// src/app/messages/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Message {
    id: string;
    content: string;
    senderId: string;
    recipientId: string;
    read: boolean;
    createdAt: Date;
    sender: {
        id: string;
        username: string;
        profileImage: string | null;
    };
}

interface Conversation {
    userId: string;
    username: string;
    handle: string;
    profileImage: string | null;
}

export default function MessagesPage() {
    const { data: session, status } = useSession();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Safely extract the current user ID
    const currentUserId = session?.user
        ? (session.user as { id: string }).id
        : '';

    useEffect(() => {
        if (status !== 'authenticated') return;
        fetch('/api/messages/conversations')
            .then((res) => res.json())
            .then(setConversations)
            .finally(() => setLoadingConvos(false));
    }, [status]);

    useEffect(() => {
        if (!activeConversation) return;
        setLoadingMsgs(true);
        fetch(`/api/messages/${activeConversation.userId}`)
            .then((res) => res.json())
            .then((data: Message[]) => {
                const msgs = data.map((m) => ({
                    ...m,
                    createdAt: new Date(m.createdAt),
                }));
                setMessages(msgs);
            })
            .finally(() => setLoadingMsgs(false));
    }, [activeConversation]);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    const sendMessage = async () => {
        if (!activeConversation || !input.trim() || !currentUserId) return;

        // Use non-null assertions since we know session.user is defined here
        const sender = session!.user as { id: string; username: string; image?: string | null };

        const newMsg: Message = {
            id: Date.now().toString(),
            content: input,
            senderId: currentUserId,
            recipientId: activeConversation.userId,
            read: true,
            createdAt: new Date(),
            sender: {
                id: currentUserId,
                username: sender.username,
                profileImage: sender.image ?? null,
            },
        };

        setMessages((prev) => [...prev, newMsg]);
        setInput('');

        await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: newMsg.content,
                recipientId: newMsg.recipientId,
            }),
        });
    };

    if (status === 'loading' || loadingConvos) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        return (
            <div className="p-4 text-center">
                <p>
                    Please{' '}
                    <Link href="/auth/signin" className="text-blue-500">
                        sign in
                    </Link>{' '}
                    to view your messages.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-screen">
            {/* Conversations List */}
            <div className="w-1/3 border-r overflow-y-auto">
                {conversations.map((conv) => (
                    <div
                        key={conv.userId}
                        className={`p-4 cursor-pointer ${activeConversation?.userId === conv.userId ? 'bg-gray-100' : ''
                            }`}
                        onClick={() => setActiveConversation(conv)}
                    >
                        <div className="flex items-center">
                            {conv.profileImage ? (
                                <Image
                                    src={conv.profileImage}
                                    alt={conv.username}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="h-10 w-10 bg-gray-300 rounded-full" />
                            )}
                            <div className="ml-3">
                                <p className="font-semibold">{conv.username}</p>
                                <p className="text-sm text-gray-500">@{conv.handle}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Messages Panel */}
            <div className="flex-1 flex flex-col">
                {activeConversation ? (
                    <>
                        <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
                            {loadingMsgs ? (
                                <div className="flex justify-center mt-8">
                                    <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`mb-4 flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'
                                            }`}
                                    >
                                        <div className="max-w-xs">
                                            <p
                                                className={`p-2 rounded ${msg.senderId === currentUserId
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200'
                                                    }`}
                                            >
                                                {msg.content}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t flex">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 p-2 border rounded mr-2"
                                placeholder="Type a message..."
                            />
                            <button
                                onClick={sendMessage}
                                className="px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p>Select a conversation to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

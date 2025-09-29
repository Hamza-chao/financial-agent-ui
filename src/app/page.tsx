// src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

// Define the structure for a chat message
interface Message {
  role: 'user' | 'assistant';
  text: string;
  chart_image?: string;
}

// --- Reusable UI Components ---
const AiIcon = () => ( <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"> <svg className="w-6 h-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"> <path d="M18 4h-4V2h-4v2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM8 18H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V8h2v2zm4 4h-2v-2h2v2zm0-4h-2V8h2v2zm0-4h-2V4h2v4zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z"/> </svg> </div> );
const TypingIndicator = () => ( <div className="flex items-start gap-3 mb-6"> <AiIcon /> <div className="bg-slate-200 p-4 rounded-lg rounded-tl-none chat-bubble"> <div className="typing-indicator"> <span className="w-2 h-2 bg-slate-400 rounded-full inline-block"></span> <span className="w-2 h-2 bg-slate-400 rounded-full inline-block"></span> <span className="w-2 h-2 bg-slate-400 rounded-full inline-block"></span> </div> </div> </div> );
const SendIcon = () => ( <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"> <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path> </svg> );

// --- Main Page Component ---
export default function FinancialAnalystPage() {
    const [messages, setMessages] = useState<Message[]>([ { role: 'assistant', text: "Hello! I'm your AI Financial Analyst. I can provide stock prices, company news, and market analysis. How can I help you today?" } ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const API_URL = "https://financial-agent-service-597955193973.us-central1.run.app/chat";

    useEffect(() => {
        chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
    }, [messages, isLoading]);

    const handleSendMessage = async (messageText?: string) => {
        const text = (messageText || userInput).trim();
        if (text === '') return;
        setMessages(prev => [...prev, { role: 'user', text: text }]);
        setUserInput('');
        setIsLoading(true);
        const historyForApi = messages[0]?.role === 'assistant' ? messages.slice(1) : messages;
        const apiChatHistory = historyForApi.map(msg => [msg.role, msg.text] as [string, string]);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: text, chat_history: apiChatHistory }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const detail = errorData?.detail || response.statusText;
                throw new Error(`API Error: ${detail || response.status}`);
            }
            const data = await response.json();
            const assistantMessage: Message = { role: 'assistant', text: data.text_response, chart_image: data.chart_image };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            const errorMessage: Message = { role: 'assistant', text: `Sorry, something went wrong: ${(err as Error).message}` };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => { if (event.key === 'Enter' && !isLoading) { handleSendMessage(); } };
    const handleExampleClick = (text: string) => { handleSendMessage(text); };

    return (
        <>
            <style jsx global>{` body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; } .chat-bubble { max-width: 80%; word-wrap: break-word; } .chat-container::-webkit-scrollbar { width: 6px; } .chat-container::-webkit-scrollbar-track { background: #f1f5f9; } .chat-container::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; } .example-prompt { transition: transform 0.2s ease, box-shadow 0.2s ease; } .example-prompt:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); } .typing-indicator span { animation: bounce 1.4s infinite ease-in-out both; } .typing-indicator span:nth-child(1) { animation-delay: -0.32s; } .typing-indicator span:nth-child(2) { animation-delay: -0.16s; } @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } } `}</style>
            <main className="flex items-center justify-center min-h-screen">
                <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl m-4">
                    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-2xl flex items-center justify-center shadow-md">
                        <svg className="w-7 h-7 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"></path></svg>
                        <h1 className="text-xl font-bold tracking-wider">AI Financial Analyst</h1>
                    </header>
                    <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto chat-container">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 mb-6 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'assistant' && <AiIcon />}
                                <div className={`${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-tl-none'} p-4 rounded-lg chat-bubble`}>
                                    <ReactMarkdown className="prose prose-sm prose-slate max-w-none">{msg.text}</ReactMarkdown>
                                    {msg.chart_image && (
                                        <div className="mt-4 border-t border-slate-300 pt-4">
                                            <div className="rounded-lg shadow-md overflow-hidden">
                                                <Image src={`data:image/png;base64,${msg.chart_image}`} alt="Stock Price Chart" width={500} height={300} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && <TypingIndicator />}
                        {messages.length === 1 && (
                             <div className="my-8 text-center">
                                <h2 className="text-slate-500 font-semibold mb-4">Try an example:</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                    <div className="example-prompt bg-white p-3 border border-slate-200 rounded-lg cursor-pointer" onClick={() => handleExampleClick('What are the latest earnings for NVDA?')}>
                                        <p className="font-semibold text-slate-700">Get Latest Earnings</p>
                                        <p className="text-sm text-slate-500">for NVIDIA (NVDA)</p>
                                    </div>
                                    <div className="example-prompt bg-white p-3 border border-slate-200 rounded-lg cursor-pointer" onClick={() => handleExampleClick('Show me a stock price chart for AAPL')}>
                                        <p className="font-semibold text-slate-700">Show Stock Chart</p>
                                        <p className="text-sm text-slate-500">for Apple (AAPL)</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-white border-t border-slate-200 rounded-b-2xl">
                        <div className="flex items-center gap-3">
                            <input id="user-input" type="text" placeholder="Ask a financial question..." className="flex-1 p-3 bg-white border border-slate-300 text-black placeholder-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={handleKeyPress} disabled={isLoading} />
                            <button id="send-button" className="bg-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center hover:bg-blue-700 transition shadow disabled:bg-slate-400" onClick={() => handleSendMessage()} disabled={isLoading} >
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

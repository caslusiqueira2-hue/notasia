import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Bot, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export const ChatView = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', content: 'Olá! Como posso ajudar você hoje com suas notas e metas?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulação de resposta da IA (Contexto real seria injetado aqui)
    setTimeout(() => {
      const botMessage = { 
        id: Date.now() + 1, 
        role: 'bot', 
        content: `Baseado em suas notas, percebo que você está focado em produtividade. Atualmente você tem metas pendentes em Estudos e Trabalho.` 
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Chat Contextual IA</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Consulte suas informações com inteligência.</p>
        </div>
        <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles size={12} />
          Gemini 1.5 Pro
        </div>
      </div>

      <div className="flex-1 overflow-hidden premium-card flex flex-col mb-4">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={clsx(
                "flex items-start gap-3 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-slate-100 text-slate-600" : "bg-primary-600 text-white"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={clsx(
                "p-3.5 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-primary-500 text-white rounded-tr-none" 
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none">
                <Loader2 size={16} className="animate-spin text-primary-600" />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form onSubmit={handleSend} className="relative">
            <input 
              type="text"
              placeholder="Pergunte algo sobre suas notas..."
              className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
              disabled={!input.trim() || isTyping}
            >
              <Send size={16} />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-center text-slate-400 font-medium tracking-wide flex items-center justify-center gap-1">
            <Sparkles size={10} className="text-primary-500" />
            RESPOSTAS GERADAS POR INTELIGÊNCIA ARTIFICIAL
          </div>
        </div>
      </div>
    </div>
  );
};

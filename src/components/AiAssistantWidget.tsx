import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, HelpCircle, AlertCircle, Loader2 } from "lucide-react";
import { UserAccount } from "../types";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AiAssistantWidgetProps {
  currentAccount: UserAccount;
}

export default function AiAssistantWidget({ currentAccount }: AiAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roleLabel = currentAccount.role === "Admin" ? "Sistem Admin" : "Petugas Lapangan";

  // Role-based quick helper questions
  const suggestions = currentAccount.role === "Admin" 
    ? [
        "Bagaimana alur verifikasi berkas?",
        "Arti metrik SLA Delay pada monitoring?",
        "Cara ekspor laporan harian?"
      ]
    : [
        "Formulir apa saja yang harus diisi?",
        "Bagaimana cara upload gambar bukti?",
        "Solusi jika gagal sinkronisasi data?"
      ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  // Set initial welcome message based on role
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "model",
          text: `Halo **${currentAccount.name}** (${roleLabel})! Saya Asisten AI SIMANTU. Ada yang bisa saya bantu terkait tugas dan pemantauan sistem hari ini?`
        }
      ]);
    }
  }, [currentAccount]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setInput("");
    setErrorMsg(null);
    setIsLoading(true);

    // Append user message
    const updatedMessages = [...messages, { role: "user" as const, text: userMsg }];
    setMessages(updatedMessages);

    try {
      // Map history to the format expected by the backend
      // [{ role: 'user' | 'model', parts: [{ text: string }] }]
      const mappedHistory = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMsg,
          history: mappedHistory
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server tidak mengembalikan respons JSON yang valid!");
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        { role: "model", text: data.text || "Mohon maaf, saya mendapatkan respon kosong." }
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan koneksi ke server AI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Find last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        const lastUserText = messages[i].text;
        // Slice before that user message, and make the request again
        setMessages(messages.slice(0, i));
        handleSendMessage(lastUserText);
        break;
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  // Helper function to render simple markdown-like syntax (bold and lists)
  const renderMessageText = (text: string) => {
    // Escape HTML then convert markdown bold **text** to <strong>text</strong>
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-18 lg:bottom-6 right-6 z-40 bg-gradient-to-tr from-[#535CE8] via-[#4a53db] to-[#3b2cc4] text-white rounded-full p-4 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group cursor-pointer border border-[#535CE8]/30"
        id="ai-assistant-toggle-btn"
        title="Bantuan AI Chat"
      >
        <span className="max-w-0 overflow-hidden group-hover:max-w-32 transition-all duration-300 ease-out text-xs font-black tracking-wider uppercase whitespace-nowrap hidden sm:inline-block">
          AI TANYA JAWAB
        </span>
        <div className="relative">
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </div>
      </button>

      {/* Sidebar Chat Drawer */}
      {isOpen && (
        <div 
          className="fixed top-0 right-0 z-50 w-[420px] max-w-full h-screen border-l border-slate-200 bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
          id="ai-assistant-sidebar-panel"
        >
          {/* Header Panel */}
          <div className="bg-gradient-to-r from-[#535CE8] via-[#4a53db] to-[#3b2cc4] p-4.5 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/15">
                <Sparkles className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5 text-white">
                  SIMANTU AI Assistant
                  <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded text-[8px] font-extrabold animate-pulse uppercase">
                    Aktif
                  </span>
                </h4>
                <p className="text-[10px] text-indigo-100 font-medium">Asisten pintar untuk {roleLabel}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer font-bold"
              title="Tutup Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick suggesting panel when history has only 1 bot welcome msg */}
          {messages.length === 1 && (
            <div className="px-5 py-4 bg-slate-50 border-b border-gray-100">
              <p className="text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-[#535CE8]" /> Pertanyaan Populer:
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(s)}
                    className="text-left text-[11px] font-semibold text-slate-700 bg-white border border-slate-200/80 hover:border-[#535CE8] hover:text-[#535CE8] p-2.5 rounded-xl transition-all cursor-pointer hover:shadow-sm"
                  >
                    💡 {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message History Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => {
              const isBot = msg.role === "model";
              return (
                <div
                  key={index}
                  className={`flex gap-2 max-w-[90%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                    isBot ? "bg-[#535CE8]/10 text-[#535CE8] border-[#535CE8]/20" : "bg-white text-slate-600 border-slate-200"
                  }`}>
                    {isBot ? <Bot className="w-4 h-4" /> : <div className="text-[10px] font-black">{currentAccount.name.slice(0, 2).toUpperCase()}</div>}
                  </div>
                  
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isBot 
                      ? "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none whitespace-pre-line shadow-sm"
                      : "bg-[#535CE8] text-white rounded-tr-none shadow-md shadow-[#535CE8]/15"
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              );
            })}

            {/* AI is thinking indicator */}
            {isLoading && (
              <div className="flex gap-2 max-w-[90%] mr-auto">
                <div className="w-7 h-7 rounded-lg bg-[#535CE8]/10 text-[#535CE8] border border-[#535CE8]/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2 text-[11px] font-bold text-slate-500 shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 text-[#535CE8] animate-spin" />
                  SIMANTU AI sedang mengetik...
                </div>
              </div>
            )}

            {/* Error Message display block */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-250/60 rounded-2xl flex flex-col gap-2 text-xs text-rose-800">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 flex-shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-rose-950">Gagal Memuat Jawaban</h5>
                    <p className="text-[11px] leading-relaxed mt-0.5 font-medium">{errorMsg}</p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-1 self-start bg-rose-600 hover:bg-rose-700 text-white font-black px-3.5 py-1.5 rounded-xl text-[10px] transition-all cursor-pointer shadow-sm shadow-rose-600/15 flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Sparkles className="w-3 h-3" /> Coba Kirim Ulang
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <form 
            onSubmit={handleFormSubmit}
            className="p-4 border-t border-gray-150 bg-white flex gap-2 items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tulis pertanyaan Anda di sini..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#535CE8] focus:bg-white disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-3 bg-[#535CE8] text-white rounded-xl hover:bg-[#3b2cc4] disabled:opacity-40 transition-all cursor-pointer flex-shrink-0 flex items-center justify-center shadow-md shadow-[#535CE8]/15"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

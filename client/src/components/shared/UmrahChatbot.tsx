import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2, Maximize2, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const STORAGE_KEY = "go-umrah-chat-history";
const MAX_STORED = 30;

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch { return []; }
}

function saveHistory(msgs: Message[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-MAX_STORED)));
  } catch {}
}

const WELCOME_MSG: Message = {
  role: "assistant",
  content: "مرحباً بك في مساعد Go Umrah الذكي! 🕌\n\nأنا هنا لمساعدتك في كل ما يتعلق بالحج والعمرة — من الباقات والأسعار إلى متطلبات التأشيرة والإجراءات. كيف يمكنني مساعدتك اليوم؟",
  timestamp: new Date(),
};

const QUICK_QUESTIONS = [
  "ما هي متطلبات تأشيرة العمرة؟",
  "ما الفرق بين عمرة الداخل والخارج؟",
  "كيف أحجز باقة حج من خارج المملكة؟",
  "ما هي أفضل فنادق مكة المكرمة؟",
  "ما هي مواعيد العمرة في رمضان؟",
];

export default function UmrahChatbot() {
  const [location] = useLocation();
  const pageContext = location.split("/")[1] || "home";

  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const history = loadHistory();
    return history.length > 0 ? history : [WELCOME_MSG];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data: any) => {
      const raw = data?.choices?.[0]?.message?.content;
      const content = (typeof raw === "string" ? raw : null) || "عذراً، لم أتمكن من الإجابة. يرجى المحاولة مرة أخرى.";
      setMessages(prev => [...prev, { role: "assistant", content, timestamp: new Date() }]);
      setIsLoading(false);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى أو التواصل مع فريق الدعم.",
        timestamp: new Date(),
      }]);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Persist chat history
  useEffect(() => {
    if (messages.length > 1) saveHistory(messages);
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: msg, timestamp: new Date() }];
    setMessages(newMessages);
    setIsLoading(true);
    chatMutation.mutate({
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      pageContext,
    });
  };

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([WELCOME_MSG]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: "linear-gradient(135deg, #1B5E52, #2d7a6a)" }}
          aria-label="فتح المساعد الذكي"
        >
          <MessageCircle className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A96E] rounded-full flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">AI</span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={`fixed z-50 shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
            minimized
              ? "bottom-6 left-6 w-72 h-14"
              : "bottom-6 left-6 w-80 sm:w-96 h-[520px]"
          }`}
          style={{ border: "1px solid rgba(27,94,82,0.15)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1B5E52, #2d7a6a)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">مساعد Go Umrah</p>
                {!minimized && <p className="text-white/60 text-[10px]">متاح دائماً للمساعدة</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!minimized && (
                <button
                  onClick={handleClearHistory}
                  className="text-white/70 hover:text-white p-1 rounded transition-colors"
                  title="مسح المحادثة"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => setMinimized(!minimized)} className="text-white/70 hover:text-white p-1 rounded transition-colors">
                {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" ? "bg-[#1B5E52]" : "bg-[#C9A96E]"
                    }`}>
                      {msg.role === "user" ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#1B5E52] text-white rounded-tr-sm"
                        : "bg-white text-gray-800 shadow-sm rounded-tl-sm border border-gray-100"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 items-center">
                    <div className="w-7 h-7 rounded-full bg-[#C9A96E] flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm border border-gray-100">
                      <Loader2 className="w-4 h-4 text-[#1B5E52] animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions (only on first message) */}
              {messages.length === 1 && (
                <div className="px-3 py-2 bg-white border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 mb-2">أسئلة شائعة:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="text-[10px] bg-[#1B5E52]/8 text-[#1B5E52] border border-[#1B5E52]/20 rounded-full px-2.5 py-1 hover:bg-[#1B5E52]/15 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 text-sm bg-gray-50 border-gray-200 focus:border-[#1B5E52]/40"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="sm"
                  className="bg-[#1B5E52] hover:bg-[#2d7a6a] text-white px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

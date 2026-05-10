import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, X, Sparkles, Bot, User, ChevronDown, RefreshCw } from "lucide-react";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type PageContext = "hajj" | "umrah" | "hotels" | "flights" | "visa" | "transport" | "tours" | "store" | "media" | "default";

interface PilgrimAIAssistantProps {
  context?: PageContext;
}

const CONTEXT_TITLES: Record<string, string> = {
  hajj: "مساعد الحج الذكي",
  umrah: "مساعد العمرة الذكي",
  hotels: "مساعد الفنادق الذكي",
  flights: "مساعد الرحلات الذكي",
  visa: "مساعد التأشيرة الذكي",
  transport: "مساعد المواصلات الذكي",
  tours: "مساعد الجولات الذكي",
  store: "مساعد المتجر الذكي",
  media: "مساعد المركز الإعلامي",
  default: "مساعد جو عمرة الذكي",
};

const WELCOME_MESSAGES: Record<string, string> = {
  hajj: "مرحباً! أنا مساعدك المتخصص في خدمات الحج. يمكنني مساعدتك في اختيار الباقة المناسبة والإجابة على جميع أسئلتك.",
  umrah: "أهلاً وسهلاً! أنا مساعدك لخدمات العمرة. اسألني عن الباقات والأسعار ومتطلبات التأشيرة.",
  hotels: "مرحباً! أنا مساعدك لحجز الفنادق في مكة والمدينة. سأساعدك في اختيار أفضل فندق بأنسب سعر.",
  flights: "أهلاً! أنا مساعدك للرحلات الجوية. سأساعدك في إيجاد أفضل رحلة إلى المملكة العربية السعودية.",
  visa: "مرحباً! أنا مساعدك لاستفسارات التأشيرة. سأشرح لك متطلبات وإجراءات الحصول على تأشيرة العمرة أو الحج.",
  transport: "أهلاً! أنا مساعدك لخدمات النقل. سأساعدك في حجز المواصلات المناسبة لرحلتك.",
  tours: "مرحباً! أنا مساعدك للجولات السياحية الإسلامية. سأعرّفك على أبرز المواقع المقدسة والتاريخية.",
  store: "أهلاً! أنا مساعدك في المتجر الإسلامي. سأساعدك في اختيار مستلزمات الحج والعمرة المناسبة.",
  default: "السلام عليكم! أنا مساعد منصة جو عمرة الذكي. يمكنني مساعدتك في كل ما يتعلق بالحج والعمرة والخدمات المرتبطة بها.",
};

export default function PilgrimAIAssistant({ context = "default" }: PilgrimAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic suggestions from backend
  const { data: suggestions = [] } = trpc.ai.getSuggestions.useQuery(
    { pageContext: context },
    { staleTime: Infinity }
  );

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      const rawContent = response?.choices?.[0]?.message?.content ?? "عذراً، لم أتمكن من الإجابة. حاول مرة أخرى.";
      const content: string = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
      setMessages((prev) => [...prev, { role: "assistant" as const, content }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى." },
      ]);
    },
  });

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatMutation.isPending]);

  const handleSend = (text?: string) => {
    const content = text ?? input.trim();
    if (!content || chatMutation.isPending) return;
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    // Send to backend with page context — backend adds the system prompt
    chatMutation.mutate({ messages: newMessages as any, pageContext: context });
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
  };

  const title = CONTEXT_TITLES[context] || CONTEXT_TITLES.default;
  const welcome = WELCOME_MESSAGES[context] || WELCOME_MESSAGES.default;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br from-[#1B5E52] to-[#0D4F3C] hover:scale-110 active:scale-95",
          isOpen && "rotate-180"
        )}
        aria-label="فتح المساعد الذكي"
      >
        {isOpen ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <Bot className="w-7 h-7 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#C9A96E] rounded-full border-2 border-white animate-pulse" />
          </div>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed bottom-24 left-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-left",
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
        )}
        style={{ background: "linear-gradient(135deg, #0f2a24 0%, #1B5E52 100%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C9A96E]" />
            </div>
            <div>
              <div className="text-white text-sm font-bold" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {title}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/50 text-[10px]">متاح الآن</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="محادثة جديدة"
              >
                <RefreshCw className="w-3 h-3 text-white/70" />
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-80 px-4 py-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="w-14 h-14 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/30 flex items-center justify-center">
                <Bot className="w-7 h-7 text-[#C9A96E]" />
              </div>
              <p className="text-white/80 text-sm text-center leading-relaxed" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {welcome}
              </p>
              {/* Quick suggestion buttons */}
              <div className="w-full space-y-2">
                <p className="text-white/40 text-xs text-center" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  أسئلة شائعة:
                </p>
                {suggestions.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-right text-xs text-white/80 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2.5 transition-colors border border-white/10 hover:border-[#C9A96E]/30"
                    style={{ fontFamily: "'Tajawal', sans-serif" }}
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3" dir="rtl">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5",
                    msg.role === "user"
                      ? "bg-[#C9A96E]/30 border border-[#C9A96E]/50"
                      : "bg-white/10 border border-white/20"
                  )}>
                    {msg.role === "user"
                      ? <User className="w-3 h-3 text-[#C9A96E]" />
                      : <Bot className="w-3 h-3 text-white/70" />
                    }
                  </div>
                  <div className={cn(
                    "max-w-[82%] rounded-2xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-[#C9A96E]/20 border border-[#C9A96E]/30 text-white rounded-tr-sm"
                      : "bg-white/10 border border-white/10 text-white/90 rounded-tl-sm"
                  )} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-2 flex-row" dir="rtl">
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                    <Bot className="w-3 h-3 text-white/70" />
                  </div>
                  <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#C9A96E]/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#C9A96E]/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-[#C9A96E]/70 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Inline suggestions after conversation starts */}
        {messages.length > 0 && suggestions.length > 0 && !chatMutation.isPending && (
          <div className="px-3 pt-2 flex gap-1.5 flex-wrap border-t border-white/5">
            {suggestions.slice(0, 2).map((s, i) => (
              <button
                key={i}
                onClick={() => handleSend(s)}
                className="text-[10px] text-white/60 bg-white/8 hover:bg-white/15 border border-white/10 rounded-full px-2.5 py-1 transition-colors"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 pb-3 pt-2 border-t border-white/10">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 min-h-[40px] max-h-24 resize-none text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:ring-[#C9A96E]/50"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || chatMutation.isPending}
              size="icon"
              className="w-9 h-9 rounded-xl bg-[#C9A96E] hover:bg-[#b8955a] text-white flex-shrink-0"
            >
              {chatMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

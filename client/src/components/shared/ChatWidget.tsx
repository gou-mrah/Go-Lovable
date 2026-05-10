import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Loader2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type Conversation = { id: number; providerName: string; lastMessage?: string; updatedAt: Date };
type Message = { id: number; senderId: number; content: string; createdAt: Date };

function ConversationList({
  onSelect,
}: {
  onSelect: (conv: Conversation) => void;
}) {
  const { data, isLoading } = trpc.chat.listMyConversations.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-teal-600" /></div>;
  if (!data?.length) return (
    <div className="text-center py-8 text-gray-400 text-sm">لا توجد محادثات بعد</div>
  );

  return (
    <div className="divide-y divide-gray-100">
      {data.map((conv: any) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv)}
          className="w-full text-right px-4 py-3 hover:bg-teal-50 transition-colors"
        >
          <div className="font-medium text-sm text-gray-800">{conv.providerName}</div>
          {conv.lastMessage && (
            <div className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</div>
          )}
        </button>
      ))}
    </div>
  );
}

function MessageThread({
  conversationId,
  currentUserId,
  onBack,
}: {
  conversationId: number;
  currentUserId: number;
  onBack: () => void;
}) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.chat.getMessages.useQuery(
    { conversationId, limit: 50 },
    { refetchInterval: 10_000 }
  );

  const sendMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      utils.chat.getMessages.invalidate({ conversationId });
      setText("");
    },
    onError: () => toast.error("فشل إرسال الرسالة"),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMutation.mutate({ conversationId, content: text.trim() });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-gray-100">
        <button onClick={onBack} className="text-teal-700 hover:text-teal-900">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium text-sm text-gray-700">المحادثة</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-teal-600" /></div>
        ) : (
          ((data as any[]) ?? []).map((msg: any) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMine
                      ? "bg-teal-700 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100 flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="اكتب رسالة..."
          className="text-right text-sm h-9"
          dir="rtl"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
          className="h-9 w-9 p-0 bg-teal-700 hover:bg-teal-800 text-white"
        >
          {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-24 left-4 z-40" dir="rtl">
      {open && (
        <div className="mb-3 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-teal-700 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-bold text-sm">المحادثات</span>
            <button onClick={() => { setOpen(false); setActiveConv(null); }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            {activeConv ? (
              <MessageThread
                conversationId={activeConv.id}
                currentUserId={user!.id}
                onBack={() => setActiveConv(null)}
              />
            ) : (
              <ConversationList onSelect={setActiveConv} />
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-teal-700 text-white shadow-lg hover:bg-teal-800 transition-colors flex items-center justify-center"
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </div>
  );
}

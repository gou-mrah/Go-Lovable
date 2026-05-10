import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

export type RealtimeNotification = {
  type: string;
  title?: string;
  message?: string;
  conversationId?: number;
  bookingId?: number;
};

type Handler = (notification: RealtimeNotification) => void;

let globalHandlers: Handler[] = [];
let sseInstance: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function connectSSE() {
  if (sseInstance && sseInstance.readyState !== EventSource.CLOSED) return;

  sseInstance = new EventSource("/api/notifications/stream", { withCredentials: true });

  sseInstance.onmessage = (event) => {
    try {
      const data: RealtimeNotification = JSON.parse(event.data);
      if (data.type === "connected") return;
      globalHandlers.forEach((h) => h(data));
    } catch {}
  };

  sseInstance.onerror = () => {
    sseInstance?.close();
    sseInstance = null;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectSSE, 5000);
  };
}

function disconnectSSE() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  sseInstance?.close();
  sseInstance = null;
}

export function useRealtimeNotifications(onNotification?: Handler) {
  const handlerRef = useRef<Handler | undefined>(onNotification);
  handlerRef.current = onNotification;

  const defaultHandler = useCallback((n: RealtimeNotification) => {
    if (n.title) {
      toast(n.title, { description: n.message });
    }
  }, []);

  useEffect(() => {
    const handler: Handler = (n) => {
      if (handlerRef.current) {
        handlerRef.current(n);
      } else {
        defaultHandler(n);
      }
    };

    globalHandlers.push(handler);
    connectSSE();

    return () => {
      globalHandlers = globalHandlers.filter((h) => h !== handler);
      if (globalHandlers.length === 0) {
        disconnectSSE();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

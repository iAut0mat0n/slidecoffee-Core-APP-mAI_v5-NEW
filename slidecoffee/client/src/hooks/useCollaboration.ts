import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface UserPresence {
  userId: number;
  userName: string;
  color: string;
  cursor?: { x: number; y: number };
  currentSlide?: number;
}

interface CollaborationState {
  users: Map<string, UserPresence>;
  locks: Map<number, string>; // slideId -> socketId
  isConnected: boolean;
}

export function useCollaboration(projectId: string | null) {
  const { user } = useSupabaseAuth();
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<CollaborationState>({
    users: new Map(),
    locks: new Map(),
    isConnected: false,
  });

  useEffect(() => {
    if (!projectId || !user) return;

    // Connect to WebSocket server
    const socket = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // Generate random color for this user
    const colors = [
      "#3B82F6", // blue
      "#10B981", // green
      "#F59E0B", // amber
      "#EF4444", // red
      "#8B5CF6", // purple
      "#EC4899", // pink
    ];
    const userColor = colors[Math.floor(Math.random() * colors.length)];

    socket.on("connect", () => {
      console.log("[Collaboration] Connected to WebSocket");
      setState((prev) => ({ ...prev, isConnected: true }));

      // Join project room
      socket.emit("join-project", {
        projectId,
        user: {
          userId: user.id,
          userName: user.user_metadata?.name || user.email?.split('@')[0] || "Anonymous",
          color: userColor,
        },
      });
    });

    socket.on("disconnect", () => {
      console.log("[Collaboration] Disconnected from WebSocket");
      setState((prev) => ({ ...prev, isConnected: false }));
    });

    // Handle room state (initial state when joining)
    socket.on("room-state", (data: { users: any[]; locks: [number, string][] }) => {
      const usersMap = new Map(data.users.map((u) => [u.socketId, u]));
      const locksMap = new Map(data.locks);
      setState((prev) => ({ ...prev, users: usersMap, locks: locksMap }));
    });

    // Handle user joined
    socket.on("user-joined", (data: { socketId: string; user: UserPresence }) => {
      setState((prev) => {
        const newUsers = new Map(prev.users);
        newUsers.set(data.socketId, data.user);
        return { ...prev, users: newUsers };
      });
    });

    // Handle user left
    socket.on("user-left", (data: { socketId: string }) => {
      setState((prev) => {
        const newUsers = new Map(prev.users);
        newUsers.delete(data.socketId);
        return { ...prev, users: newUsers };
      });
    });

    // Handle cursor updates
    socket.on("cursor-update", (data: { socketId: string; user: UserPresence }) => {
      setState((prev) => {
        const newUsers = new Map(prev.users);
        newUsers.set(data.socketId, data.user);
        return { ...prev, users: newUsers };
      });
    });

    // Handle slide locked
    socket.on("slide-locked", (data: { slideId: number; socketId: string }) => {
      setState((prev) => {
        const newLocks = new Map(prev.locks);
        newLocks.set(data.slideId, data.socketId);
        return { ...prev, locks: newLocks };
      });
    });

    // Handle slide unlocked
    socket.on("slide-unlocked", (data: { slideId: number }) => {
      setState((prev) => {
        const newLocks = new Map(prev.locks);
        newLocks.delete(data.slideId);
        return { ...prev, locks: newLocks };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId, user]);

  const moveCursor = (x: number, y: number, slideId: number) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit("cursor-move", { projectId, x, y, slideId });
    }
  };

  const requestSlideLock = (slideId: number): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socketRef.current || !projectId) {
        resolve(false);
        return;
      }

      const socket = socketRef.current;

      const onGranted = () => {
        socket.off("lock-granted", onGranted);
        socket.off("lock-denied", onDenied);
        resolve(true);
      };

      const onDenied = () => {
        socket.off("lock-granted", onGranted);
        socket.off("lock-denied", onDenied);
        resolve(false);
      };

      socket.once("lock-granted", onGranted);
      socket.once("lock-denied", onDenied);

      socket.emit("request-slide-lock", { projectId, slideId });

      // Timeout after 5 seconds
      setTimeout(() => {
        socket.off("lock-granted", onGranted);
        socket.off("lock-denied", onDenied);
        resolve(false);
      }, 5000);
    });
  };

  const releaseSlideLock = (slideId: number) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit("release-slide-lock", { projectId, slideId });
    }
  };

  const updateSlide = (slideId: number, content: any, operation: any) => {
    if (socketRef.current && projectId) {
      socketRef.current.emit("slide-update", { projectId, slideId, content, operation });
    }
  };

  const sendChatMessage = (message: string) => {
    if (socketRef.current && projectId && user) {
      socketRef.current.emit("chat-message", {
        projectId,
        message,
        user: {
          userId: user.id,
          userName: user.user_metadata?.name || user.email?.split('@')[0] || "Anonymous",
          color: "#3B82F6",
        },
      });
    }
  };

  return {
    ...state,
    moveCursor,
    requestSlideLock,
    releaseSlideLock,
    updateSlide,
    sendChatMessage,
    socket: socketRef.current,
  };
}


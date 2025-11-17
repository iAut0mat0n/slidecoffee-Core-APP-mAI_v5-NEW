import type { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

/**
 * WebSocket Server for Real-time Collaborative Editing
 * Handles presence, live cursors, and slide content synchronization
 */

interface UserPresence {
  userId: number;
  userName: string;
  color: string;
  cursor?: { x: number; y: number };
  currentSlide?: number;
}

interface RoomState {
  projectId: string;
  users: Map<string, UserPresence>;
  slideContent: Map<number, any>; // slideId -> content
  locks: Map<number, string>; // slideId -> socketId (who's editing)
}

const rooms = new Map<string, RoomState>();

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === "production" 
        ? ["https://slidecoffee.com"] // Replace with actual domain
        : ["http://localhost:3000", "http://localhost:5173"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    /**
     * Join a project room for collaboration
     */
    socket.on("join-project", (data: { projectId: string; user: UserPresence }) => {
      const { projectId, user } = data;
      
      // Leave any previous rooms
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      // Join the project room
      socket.join(projectId);

      // Initialize room if it doesn't exist
      if (!rooms.has(projectId)) {
        rooms.set(projectId, {
          projectId,
          users: new Map(),
          slideContent: new Map(),
          locks: new Map(),
        });
      }

      const room = rooms.get(projectId)!;
      room.users.set(socket.id, user);

      // Notify others
      socket.to(projectId).emit("user-joined", {
        socketId: socket.id,
        user,
      });

      // Send current room state to the new user
      socket.emit("room-state", {
        users: Array.from(room.users.entries()).map(([id, u]) => ({ socketId: id, ...u })),
        locks: Array.from(room.locks.entries()),
      });

      console.log(`[WebSocket] User ${user.userName} joined project ${projectId}`);
    });

    /**
     * Update cursor position
     */
    socket.on("cursor-move", (data: { projectId: string; cursor: { x: number; y: number } }) => {
      const { projectId, cursor } = data;
      const room = rooms.get(projectId);
      
      if (room && room.users.has(socket.id)) {
        const user = room.users.get(socket.id)!;
        user.cursor = cursor;
        
        // Broadcast to others
        socket.to(projectId).emit("cursor-update", {
          socketId: socket.id,
          cursor,
        });
      }
    });

    /**
     * Update current slide
     */
    socket.on("slide-change", (data: { projectId: string; slideId: number }) => {
      const { projectId, slideId } = data;
      const room = rooms.get(projectId);
      
      if (room && room.users.has(socket.id)) {
        const user = room.users.get(socket.id)!;
        user.currentSlide = slideId;
        
        // Broadcast to others
        socket.to(projectId).emit("user-slide-change", {
          socketId: socket.id,
          slideId,
        });
      }
    });

    /**
     * Request slide lock for editing
     */
    socket.on("request-lock", (data: { projectId: string; slideId: number }) => {
      const { projectId, slideId } = data;
      const room = rooms.get(projectId);
      
      if (!room) {
        socket.emit("lock-denied", { slideId, reason: "Room not found" });
        return;
      }

      // Check if slide is already locked
      if (room.locks.has(slideId)) {
        const lockedBy = room.locks.get(slideId)!;
        const lockingUser = room.users.get(lockedBy);
        socket.emit("lock-denied", {
          slideId,
          reason: `Slide is being edited by ${lockingUser?.userName || "another user"}`,
        });
        return;
      }

      // Grant lock
      room.locks.set(slideId, socket.id);
      socket.emit("lock-granted", { slideId });
      
      // Notify others
      socket.to(projectId).emit("slide-locked", {
        slideId,
        socketId: socket.id,
        user: room.users.get(socket.id),
      });
    });

    /**
     * Release slide lock
     */
    socket.on("release-lock", (data: { projectId: string; slideId: number }) => {
      const { projectId, slideId } = data;
      const room = rooms.get(projectId);
      
      if (room && room.locks.get(slideId) === socket.id) {
        room.locks.delete(slideId);
        io.to(projectId).emit("slide-unlocked", { slideId });
      }
    });

    /**
     * Sync slide content
     */
    socket.on("slide-update", (data: { projectId: string; slideId: number; content: any; operation?: any }) => {
      const { projectId, slideId, content, operation } = data;
      const room = rooms.get(projectId);
      
      if (!room) return;

      // Verify user has lock
      if (room.locks.get(slideId) !== socket.id) {
        socket.emit("sync-error", { slideId, reason: "No lock held" });
        return;
      }

      // Update room state
      room.slideContent.set(slideId, content);

      // Broadcast to others (Operational Transform)
      socket.to(projectId).emit("slide-synced", {
        slideId,
        content,
        operation,
        author: socket.id,
      });
    });

    /**
     * Chat message
     */
    socket.on("chat-message", (data: { projectId: string; message: string }) => {
      const { projectId, message } = data;
      const room = rooms.get(projectId);
      
      if (!room || !room.users.has(socket.id)) return;

      const user = room.users.get(socket.id)!;

      // Broadcast to everyone in the room (including sender)
      io.to(projectId).emit("chat-message", {
        socketId: socket.id,
        user,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    /**
     * Subscribe to slide generation progress
     */
    socket.on("subscribe-generation", (data: { projectId: string }) => {
      const generationRoom = `generation-${data.projectId}`;
      socket.join(generationRoom);
      console.log(`[WebSocket] Subscribed to generation progress for project ${data.projectId}`);
    });

    /**
     * Unsubscribe from slide generation progress
     */
    socket.on("unsubscribe-generation", (data: { projectId: string }) => {
      const generationRoom = `generation-${data.projectId}`;
      socket.leave(generationRoom);
      console.log(`[WebSocket] Unsubscribed from generation progress for project ${data.projectId}`);
    });

    /**
     * Subscribe to notification updates
     */
    socket.on("subscribe-notifications", (data: { userId: number }) => {
      const notificationRoom = `notifications-${data.userId}`;
      socket.join(notificationRoom);
      console.log(`[WebSocket] User ${data.userId} subscribed to notifications`);
    });

    /**
     * Unsubscribe from notification updates
     */
    socket.on("unsubscribe-notifications", (data: { userId: number }) => {
      const notificationRoom = `notifications-${data.userId}`;
      socket.leave(notificationRoom);
      console.log(`[WebSocket] User ${data.userId} unsubscribed from notifications`);
    });

    /**
     * Handle disconnection
     */
    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);

      // Find and clean up user from all rooms
      rooms.forEach((room, projectId) => {
        if (room.users.has(socket.id)) {
          const user = room.users.get(socket.id);
          room.users.delete(socket.id);

          // Release any locks held by this user
          room.locks.forEach((lockedBy, slideId) => {
            if (lockedBy === socket.id) {
              room.locks.delete(slideId);
              io.to(projectId).emit("slide-unlocked", { slideId });
            }
          });

          // Notify others
          socket.to(projectId).emit("user-left", {
            socketId: socket.id,
            user,
          });

          // Clean up empty rooms
          if (room.users.size === 0) {
            rooms.delete(projectId);
            console.log(`[WebSocket] Room ${projectId} deleted (empty)`);
          }
        }
      });
    });
  });

  /**
   * Emit notification to specific user
   */
  const emitNotification = (userId: number, notification: any) => {
    const notificationRoom = `notifications-${userId}`;
    io.to(notificationRoom).emit("new-notification", notification);
  };

  /**
   * Emit slide generation progress to project subscribers
   */
  const emitGenerationProgress = (projectId: string, progress: {
    status: 'started' | 'analyzing' | 'generating' | 'slide_created' | 'completed' | 'error';
    message: string;
    currentSlide?: number;
    totalSlides?: number;
    slideData?: any;
    error?: string;
  }) => {
    const generationRoom = `generation-${projectId}`;
    io.to(generationRoom).emit("generation-progress", {
      projectId,
      timestamp: new Date().toISOString(),
      ...progress,
    });
    console.log(`[WebSocket] Generation progress for ${projectId}: ${progress.status} - ${progress.message}`);
  };

  console.log("[WebSocket] Server initialized");
  return { io, emitNotification, emitGenerationProgress };
}


"use client";

import { createContext, useContext, useEffect } from "react";
import type { Socket } from "socket.io-client";
import { socket } from "@/lib/socket";
import { useAuth } from "./AuthContext";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      socket.disconnect();
      return;
    }

    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const value = useContext(SocketContext);

  if (!value) {
    throw new Error(
      "useSocketContext must be used inside SocketProvider"
    );
  }

  return value;
}
export function useSocket() {
    const socket = useContext(SocketContext);

    if (!socket) {
        throw new Error("useSocket must be used within SocketProvider");
    }

    return socket;
}
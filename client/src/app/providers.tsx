"use client";

import { SocketProvider } from "@/lib/socket-provider";
import { AuthProvider } from "@/context/AuthContext";
import type { AuthUser } from "@/types/auth";

type ProvidersProps = {
    children: React.ReactNode;
    user: AuthUser | null;
};

export default function Providers({
    children,
    user,
}: ProvidersProps) {
    return (
        <AuthProvider user={user}>
            <SocketProvider>
                {children}
            </SocketProvider>
        </AuthProvider>
    );
}
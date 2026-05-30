import { randomUUID } from "crypto";

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function tempUserName(email: string): string {
    const localPart = email.split("@")[0]?.replace(/[^a-z0-9]/gi, "").toLowerCase() || "user";
    return `${localPart}-${randomUUID().slice(0, 8)}`;
}

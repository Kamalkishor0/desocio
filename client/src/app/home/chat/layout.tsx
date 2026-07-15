import { ConversationList } from "@/components/chat/ConversationList";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid h-full grid-cols-[clamp(18rem,28vw,24rem)_1fr]">
            <ConversationList />

            <div className="border-l border-white/10">
                {children}
            </div>
        </div>
    );
}
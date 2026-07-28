import { ConversationList } from "@/components/chat/ConversationList";

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="grid h-full min-h-0 grid-cols-[clamp(18rem,28vw,24rem)_1fr] overflow-hidden">
            <aside className="slim-scrollbar min-h-0 overflow-y-auto border-r border-white/10">
                <ConversationList />
            </aside>

            <div className="min-h-0 overflow-hidden">
                {children}
            </div>
        </div>
    );
}
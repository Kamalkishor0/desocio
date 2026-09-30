"use client";

import { useEffect, useRef, useState } from "react";
import {
  Flag,
  Gamepad2,
  History,
  Lightbulb,
  PawPrint,
  SendHorizontal,
  Smile,
  Utensils,
  type LucideIcon,
} from "lucide-react";

const emojiCategories = {
  smileys: [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
  "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
  "😘", "😗", "😋", "😛", "😜", "🤪", "🤨", "🧐",
  "🤓", "😎", "🥳", "😏", "😒", "😞", "😔", "😟",
  "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺",
  "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳",
  "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗",
  "🤔", "🫡", "🤭", "🤫", "🤥", "😶", "😐", "😑",
  "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱",
  "😴", "🤤", "😪", "😵", "🤐", "🤢", "🤮", "🤧",
  "😷", "🤒", "🤕", "👍", "👎", "👏", "🙌", "👐",
  "🤝", "🙏", "💪", "👋", "🤞", "✌️", "🤟", "👌",
  "🫶", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤",
  "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗",
  ],
  animals: [
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮",
    "🐷", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🦄",
    "🐝", "🦋", "🐌", "🐞", "🐜", "🕷️", "🐢", "🐍", "🦎", "🦖", "🐙", "🦀",
    "🐠", "🐟", "🐡", "🐬", "🐳", "🦈", "🐊", "🐘", "🦒", "🦓", "🦘", "🦬",
  ],
  food: [
    "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒", "🥭",
    "🍍", "🥝", "🍅", "🥑", "🥕", "🌽", "🌶️", "🥒", "🍕", "🍔", "🍟", "🌭",
    "🌮", "🌯", "🍿", "🍣", "🍜", "🍚", "🍩", "🍪", "🎂", "🍰", "🍫", "🍭",
    "☕", "🍵", "🧃", "🥤", "🍺", "🍻", "🍷", "🥂", "🍽️", "🥢", "🍴", "🧂",
  ],
  activities: [
    "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏆", "🥇", "🎮", "🎲", "🧩", "🎯",
    "🎸", "🎹", "🥁", "🎤", "🎬", "🎨", "📚", "✏️", "🚗", "🚲", "✈️", "🚀",
    "🏠", "🏖️", "🏕️", "🌋", "🌈", "☀️", "🌙", "⭐", "🎉", "🎊", "🎁", "🎈",
  ],
  objects: [
    "💡", "📱", "💻", "⌚", "📷", "📺", "☎️", "💰", "💎", "🔑", "🔒", "🔔",
    "📌", "📍", "✉️", "📦", "📝", "📅", "✅", "❌", "⚠️", "❗", "❓", "💬",
    "❤️", "🔥", "✨", "💯", "⚡", "💥", "💫", "🌟", "💤", "🕯️", "🧸", "🎵",
  ],
  flags: [
    "🏳️", "🏴", "🏁", "🚩", "🏳️‍🌈", "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇮🇳", "🇵🇰", "🇧🇩",
    "🇳🇵", "🇱🇰", "🇦🇪", "🇸🇦", "🇶🇦", "🇹🇷", "🇫🇷", "🇩🇪", "🇮🇹", "🇪🇸", "🇵🇹", "🇳🇱",
    "🇧🇷", "🇲🇽", "🇦🇷", "🇿🇦", "🇳🇬", "🇰🇪", "🇯🇵", "🇰🇷", "🇨🇳", "🇸🇬", "🇹🇭", "🇳🇿",
  ],
} as const;

const defaultRecentEmojis = ["😀", "😂", "😍", "😊", "👍", "❤️", "🎉", "🔥", "🙏", "✨", "💯", "✅"];
const recentEmojiStorageKey = "desocio-recent-emojis";

type EmojiCategory = "recent" | keyof typeof emojiCategories;

const emojiTabs: { key: EmojiCategory; label: string; Icon: LucideIcon }[] = [
  { key: "recent", label: "Recent emojis", Icon: History },
  { key: "smileys", label: "Smileys and people", Icon: Smile },
  { key: "animals", label: "Animals and nature", Icon: PawPrint },
  { key: "food", label: "Food and drink", Icon: Utensils },
  { key: "activities", label: "Activities and travel", Icon: Gamepad2 },
  { key: "objects", label: "Objects and symbols", Icon: Lightbulb },
  { key: "flags", label: "Flags", Icon: Flag },
];

type Props = {
  onSend: (content: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
};

export function MessageInput({ onSend, onTyping }: Props) {
  const [content, setContent] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState<EmojiCategory>("recent");
  const [recentEmojis, setRecentEmojis] = useState<string[]>(defaultRecentEmojis);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedEmojis = window.localStorage.getItem(recentEmojiStorageKey);

    if (!storedEmojis) return;

    try {
      const parsedEmojis = JSON.parse(storedEmojis);

      if (Array.isArray(parsedEmojis) && parsedEmojis.every((emoji) => typeof emoji === "string")) {
        setRecentEmojis(parsedEmojis);
      }
    } catch {
      window.localStorage.removeItem(recentEmojiStorageKey);
    }
  }, []);

  useEffect(() => {
    if (!emojiPickerOpen) return;

    function handleOutsideClick(event: PointerEvent) {
      if (!emojiPickerRef.current?.contains(event.target as Node)) {
        setEmojiPickerOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [emojiPickerOpen]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTyping(false);
    };
  }, [onTyping]);

  function updateTyping(value: string) {
    setContent(value);
    onTyping(value.trim().length > 0);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1500);
    }
  }

  function addEmoji(emoji: string) {
    updateTyping(`${content}${emoji}`);
    setRecentEmojis((current) => {
      const updated = [emoji, ...current.filter((recentEmoji) => recentEmoji !== emoji)].slice(0, 32);
      window.localStorage.setItem(recentEmojiStorageKey, JSON.stringify(updated));
      return updated;
    });
  }

  async function handleSend() {
    const trimmed = content.trim();

    if (!trimmed) {
      return;
    }

    await onSend(trimmed);
    setContent("");
    onTyping(false);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.ctrlKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="shrink-0 border-t border-gray-700 p-3 backdrop-blur">
      <div className="flex items-center gap-2 rounded-2xl border border-gray-700 bg-[#080809] px-3 py-2 shadow-lg shadow-black/10">
        <div ref={emojiPickerRef} className="relative shrink-0">
          {emojiPickerOpen ? (
            <div className="absolute bottom-12 left-0 w-72 overflow-hidden rounded-2xl border border-gray-700 bg-[#151516] shadow-xl shadow-black/30">
              <div className="flex border-b border-gray-700 px-1 py-1">
                {emojiTabs.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveEmojiCategory(key)}
                    aria-label={label}
                    aria-pressed={activeEmojiCategory === key}
                    title={label}
                    className={`inline-flex h-8 flex-1 items-center justify-center rounded-lg transition ${
                      activeEmojiCategory === key
                        ? "bg-white/10 text-white"
                        : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
                    }`}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>

              <div className="slim-scrollbar grid max-h-56 grid-cols-8 gap-1 overflow-y-auto p-2">
                {(activeEmojiCategory === "recent"
                  ? recentEmojis
                  : emojiCategories[activeEmojiCategory]
                ).map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xl transition hover:bg-white/10"
                    aria-label={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setEmojiPickerOpen((open) => !open)}
            aria-label="Open emoji picker"
            aria-expanded={emojiPickerOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            <Smile size={18} />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => updateTyping(e.target.value)}
          onBlur={() => onTyping(false)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-gray-400"
          placeholder="Type a message..."
        />

        <button
          type="button"
          onClick={handleSend}
          aria-label="Send message"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-white text-[#080809] transition hover:bg-gray-200 hover:text-[#080809]"
        >
          <SendHorizontal size={16} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
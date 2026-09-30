"use client";

import { useEffect, useRef, useState } from "react";
import {
  Flag,
  Gamepad2,
  History,
  Lightbulb,
  PawPrint,
  Smile,
  Utensils,
  type LucideIcon,
} from "lucide-react";

const emojiCategories = {
  smileys: [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃",
    "😉", "😌", "😍", "🥰", "😘", "😋", "😛", "😜", "🤪", "🤨", "🧐", "🤓",
    "😎", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😫", "🥺",
    "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨",
    "🤗", "🤔", "🫡", "🤭", "🤫", "😶", "😐", "😑", "😬", "🙄", "😮", "😲",
    "🥱", "😴", "🤤", "😵", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "👍", "👎",
    "👏", "🙌", "🤝", "🙏", "💪", "👋", "🤞", "✌️", "🤟", "👌", "🫶", "❤️",
    "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "💕", "💞", "💓",
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

type EmojiCategory = "recent" | keyof typeof emojiCategories;

const defaultRecentEmojis = ["😀", "😂", "😍", "😊", "👍", "❤️", "🎉", "🔥", "🙏", "✨", "💯", "✅"];
const recentEmojiStorageKey = "desocio-recent-emojis";
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
  onSelect: (emoji: string) => void;
};

export function EmojiPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<EmojiCategory>("recent");
  const [recentEmojis, setRecentEmojis] = useState<string[]>(defaultRecentEmojis);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(recentEmojiStorageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((emoji) => typeof emoji === "string")) {
        setRecentEmojis(parsed);
      }
    } catch {
      window.localStorage.removeItem(recentEmojiStorageKey);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: PointerEvent) {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    return () => document.removeEventListener("pointerdown", handleOutsideClick);
  }, [open]);

  function selectEmoji(emoji: string) {
    const updated = [emoji, ...recentEmojis.filter((recentEmoji) => recentEmoji !== emoji)].slice(0, 32);
    setRecentEmojis(updated);
    window.localStorage.setItem(recentEmojiStorageKey, JSON.stringify(updated));
    onSelect(emoji);
  }

  const visibleEmojis = activeCategory === "recent"
    ? recentEmojis
    : emojiCategories[activeCategory];

  return (
    <div ref={pickerRef} className="relative shrink-0">
      {open ? (
        <div className="absolute bottom-11 left-0 z-20 w-72 overflow-hidden rounded-2xl border border-gray-700 bg-[#151516] shadow-xl shadow-black/30">
          <div className="flex border-b border-gray-700 px-1 py-1">
            {emojiTabs.map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                aria-label={label}
                aria-pressed={activeCategory === key}
                title={label}
                className={`inline-flex h-8 flex-1 items-center justify-center rounded-lg transition ${activeCategory === key ? "bg-white/10 text-white" : "text-gray-500 hover:bg-white/5 hover:text-gray-300"}`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
          <div className="slim-scrollbar grid max-h-56 grid-cols-8 gap-1 overflow-y-auto p-2">
            {visibleEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => selectEmoji(emoji)}
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
        onClick={() => setOpen((current) => !current)}
        aria-label="Open emoji picker"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
      >
        <Smile size={18} />
      </button>
    </div>
  );
}

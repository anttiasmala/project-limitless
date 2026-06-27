'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import type { ChatMessage } from '@/utils/multiplayer/multiplayerTypes';
import SvgSmileyFace from '@/icons/smiley_face';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/** Quick-reaction row shown above the input. Folds the old emoji picker in. */
const QUICK_EMOJIS = ['👍', '😂', '😮', '🔥', '☠️', '⚔️', '🏆', '🦜'];

type Props = {
  isSpectator: boolean;
  messages: ChatMessage[];
  /** Id of the local player, so own messages align right. */
  myId: string;
  onSend: (text: string) => void;
};

export default function Chat({ isSpectator, messages, myId, onSend }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Count of messages already seen, so the toggle can badge unread ones.
  const [seenCount, setSeenCount] = useState(messages.length);
  const listRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const [isDarkTheme] = useLocalStorage('isDarkTheme', true);

  const unread = open ? 0 : Math.max(0, messages.length - seenCount);

  // Keep the scroll pinned to the newest line while the panel is open. This is
  // a genuine DOM sync (no state writes), so it stays in an effect.
  useEffect(() => {
    if (!open) return;
    const element = listRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [open, messages.length]);

  // Close the emoji picker when clicking anywhere outside of it (the toggle
  // button lives inside the same ref, so its own click won't close it here).
  useEffect(() => {
    if (!showEmojiPicker) return;
    function handlePointerDown(event: PointerEvent) {
      if (!emojiPickerRef.current?.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [showEmojiPicker]);

  function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft('');
  }

  // Mark everything seen whenever the panel opens or closes — messages that
  // arrived while it was open shouldn't count as unread afterwards.
  function openPanel() {
    setSeenCount(messages.length);
    setOpen(true);
  }

  function closePanel() {
    setSeenCount(messages.length);
    setShowEmojiPicker(false);
    setOpen(false);
  }

  return (
    <>
      {/* Toggle — floating bottom-right, hidden while the panel is open */}
      {!open && (
        <Button
          variant="gold"
          aria-label="Open chat"
          className="fixed right-4 bottom-4 z-50 h-14 w-14 rounded-full p-0 text-2xl shadow-lg"
          onClick={openPanel}
        >
          <span aria-hidden>💬</span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-xs font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      )}

      {/* Panel — bottom sheet on mobile, docked right column on desktop */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat"
          className="fixed inset-x-0 bottom-0 z-50 flex h-dvh flex-col rounded-t-2xl border-2 border-slate-300 bg-white shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-80 md:rounded-none md:border-t-0 md:border-r-0 md:border-l-2 dark:border-red-700 dark:bg-red-950"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b-2 border-slate-300 px-4 py-3 dark:border-red-700">
            <p className="font-bold tracking-wide text-slate-800 dark:text-yellow-300">
              💬 Chat
            </p>
            <Button
              variant="ghost"
              aria-label="Close chat"
              className="rounded-full text-xl leading-none text-slate-600 hover:bg-amber-200 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300 dark:hover:bg-amber-900 dark:hover:text-red-400"
              onClick={closePanel}
            >
              ✕
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 ? (
              <p className="m-auto text-center text-sm text-slate-400 dark:text-amber-700">
                No messages yet — say ahoy! 🏴‍☠️
              </p>
            ) : (
              messages.map((message) => {
                const mine = message.senderId === myId;
                return (
                  <div
                    key={message.id}
                    className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                  >
                    {!mine && (
                      <span className="px-1 text-xs text-slate-500 dark:text-amber-600">
                        {message.senderIcon} {message.senderName}
                      </span>
                    )}
                    <span
                      className={`max-w-[85%] rounded-2xl px-3 py-1.5 text-sm wrap-break-word ${
                        mine
                          ? 'rounded-br-sm bg-amber-600 text-white dark:bg-amber-700 dark:text-yellow-100'
                          : 'rounded-bl-sm bg-slate-200 text-slate-800 dark:bg-red-900 dark:text-yellow-300'
                      }`}
                    >
                      {message.text}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick emoji row */}
          <div className="flex shrink-0 flex-wrap gap-1 border-t-2 border-slate-200 px-3 py-2 dark:border-red-800">
            {QUICK_EMOJIS.map((emoji) => (
              <Button
                key={emoji}
                variant="unstyled"
                aria-label={`Send ${emoji}`}
                disabled={isSpectator}
                className="rounded-lg p-1 text-xl hover:scale-110 hover:bg-slate-100 dark:hover:bg-red-900"
                onClick={() => handleSend(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>

          {/* Input */}
          <form
            className="flex shrink-0 items-center gap-2 border-t-2 border-slate-200 p-3 dark:border-red-800"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(draft);
            }}
          >
            <div ref={emojiPickerRef} className="relative flex min-w-0 flex-1">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message…"
                aria-label="Chat message"
                maxLength={200}
                disabled={isSpectator}
                className="min-w-0 flex-1 px-2 py-2 pr-10 text-base font-normal disabled:cursor-not-allowed disabled:opacity-60"
              />
              <Button
                type="button"
                onClick={() => setShowEmojiPicker((prevValue) => !prevValue)}
                variant="unstyled"
                aria-label="Toggle emoji picker"
                disabled={isSpectator}
                className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-amber-100 p-1 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-red-800 dark:hover:bg-red-700"
              >
                <SvgSmileyFace
                  className={`h-6 w-6 transition-colors ${
                    showEmojiPicker
                      ? 'text-amber-700 dark:text-yellow-300'
                      : 'text-amber-600 dark:text-yellow-400'
                  }`}
                />
              </Button>
              {showEmojiPicker && (
                <div className="absolute -right-3 bottom-full z-50 mb-2 h-87.5 max-h-[calc(100dvh-4rem)] w-75 sm:h-112.5 sm:w-87.5">
                  <EmojiPicker
                    width="100%"
                    height="100%"
                    previewConfig={{ showPreview: false }}
                    autoFocusSearch={false}
                    onEmojiClick={(emojiObject) => {
                      setDraft((prevDraft) =>
                        (prevDraft + emojiObject.emoji).slice(0, 200),
                      );
                      setShowEmojiPicker(false);
                    }}
                    theme={isDarkTheme ? Theme.DARK : Theme.LIGHT}
                  />
                </div>
              )}
            </div>
            <Button
              variant="gold"
              size="md"
              type="submit"
              disabled={!draft.trim() || isSpectator}
            >
              Send
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

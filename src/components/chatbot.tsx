"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/app-providers";
import { apiRequest } from "@/lib/api-client";
import type { ChatMessage } from "@/lib/types";

export function Chatbot() {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  const toggleOpen = () => {
    setOpen((current) => {
      const nextOpen = !current;
      if (nextOpen && messages.length === 0) {
        setMessages([{ role: "assistant", content: t("chatbot.greeting") }]);
      }
      return nextOpen;
    });
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || pending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    try {
      const response = await apiRequest<{ reply: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: nextMessages, language: lang }),
      });
      setMessages([...nextMessages, { role: "assistant", content: response.reply }]);
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: t("chatbot.error") }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {open ? (
        <section
          className={`fixed bottom-24 z-50 flex h-[min(620px,calc(100vh-8rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl ${
            lang === "ar" ? "left-4" : "right-4"
          }`}
          aria-label={t("chatbot.title")}
        >
          <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <h2 className="font-bold text-primary">{t("chatbot.title")}</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-border px-2 py-1 text-sm"
              aria-label={t("chatbot.close")}
            >
              ×
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {pending ? (
              <div className="flex justify-start">
                <p className="rounded-2xl bg-card px-4 py-2 text-sm text-muted">...</p>
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-border bg-card p-4">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("chatbot.placeholder")}
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2"
            />
            <button
              type="submit"
              disabled={pending || input.trim().length === 0}
              className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {t("chatbot.send")}
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={toggleOpen}
        className={`fixed bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground shadow-xl transition hover:scale-105 ${
          lang === "ar" ? "left-6" : "right-6"
        }`}
        aria-label={open ? t("chatbot.close") : t("chatbot.open")}
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}


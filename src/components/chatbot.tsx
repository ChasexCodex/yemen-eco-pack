"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useLanguage } from "@/components/app-providers";
import { apiRequest } from "@/lib/api-client";
import type { ChatCompletionRequest, ChatMessage, ChatResponse } from "@/lib/types";

type ChatStage = "email" | "chat" | "rating" | "complete";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function Chatbot() {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [stage, setStage] = useState<ChatStage>("email");
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  const resetConversation = () => {
    setMessages([{ role: "assistant", content: t("chatbot.emailPrompt") }]);
    setInput("");
    setCustomerEmail("");
    setStage("email");
    setLocalError(null);
    setPending(false);
  };

  const toggleOpen = () => {
    setOpen((current) => {
      const nextOpen = !current;
      if (nextOpen && messages.length === 0) {
        resetConversation();
      }
      return nextOpen;
    });
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || pending) return;

    if (stage === "email") {
      if (!isValidEmail(trimmed)) {
        setLocalError(t("chatbot.invalidEmail"));
        return;
      }

      setCustomerEmail(trimmed.toLowerCase());
      setInput("");
      setLocalError(null);
      setStage("chat");
      setMessages([{ role: "assistant", content: t("chatbot.greeting") }]);
      return;
    }

    if (stage !== "chat") {
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setPending(true);

    try {
      const response = await apiRequest<ChatResponse>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: nextMessages, language: lang, customerEmail }),
      });
      setMessages([...nextMessages, { role: "assistant", content: response.reply }]);
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: t("chatbot.error") }]);
    } finally {
      setPending(false);
    }
  };

  const finishConversation = async (rating: number) => {
    if (pending || !customerEmail) {
      return;
    }

    setPending(true);
    setLocalError(null);

    try {
      await apiRequest<{ ok: true }>("/api/chat/complete", {
        method: "POST",
        body: JSON.stringify({
          messages,
          language: lang,
          customerEmail,
          rating,
        } satisfies ChatCompletionRequest),
      });
      setMessages((current) => [...current, { role: "assistant", content: t("chatbot.rateThanks") }]);
      setStage("complete");
    } catch {
      setLocalError(t("chatbot.rateError"));
    } finally {
      setPending(false);
    }
  };

  const requestRating = () => {
    if (pending || stage !== "chat") {
      return;
    }

    setLocalError(null);
    setStage("rating");
    setMessages((current) => [...current, { role: "assistant", content: t("chatbot.ratePrompt") }]);
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
            <div>
              <h2 className="font-bold text-primary">{t("chatbot.title")}</h2>
              {customerEmail ? <p className="text-xs text-muted">{customerEmail}</p> : null}
            </div>
            <div className="flex items-center gap-2">
              {stage === "chat" ? (
                <button
                  type="button"
                  onClick={requestRating}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium"
                >
                  {t("chatbot.end")}
                </button>
              ) : null}
              {stage === "complete" ? (
                <button
                  type="button"
                  onClick={resetConversation}
                  className="rounded-full border border-border px-3 py-1 text-xs font-medium"
                >
                  {t("chatbot.restart")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-2 py-1 text-sm"
                aria-label={t("chatbot.close")}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
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
            {localError ? (
              <div className="flex justify-start">
                <p className="max-w-[85%] rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">
                  {localError}
                </p>
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>

          {stage === "rating" ? (
            <div className="border-t border-border bg-card p-4">
              <p className="mb-3 text-sm font-medium text-foreground">{t("chatbot.rateLabel")}</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => void finishConversation(value)}
                    disabled={pending}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 font-semibold hover:bg-background/80 disabled:opacity-60"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ) : stage === "complete" ? (
            <div className="border-t border-border bg-card p-4">
              <p className="mb-3 text-sm text-muted">{t("chatbot.finished")}</p>
              <button
                type="button"
                onClick={resetConversation}
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground"
              >
                {t("chatbot.restart")}
              </button>
            </div>
          ) : (
            <form onSubmit={sendMessage} className="flex gap-2 border-t border-border bg-card p-4">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={
                  stage === "email" ? t("chatbot.emailPlaceholder") : t("chatbot.placeholder")
                }
                type={stage === "email" ? "email" : "text"}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2"
              />
              <button
                type="submit"
                disabled={pending || input.trim().length === 0}
                className="rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
              >
                {stage === "email" ? t("chatbot.start") : t("chatbot.send")}
              </button>
            </form>
          )}
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
        {open ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </>
  );
}

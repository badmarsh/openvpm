"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, RotateCcw, Sparkles, User } from "lucide-react";
import { aiService } from "@/lib/ai-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

const SYSTEM_PROMPT = `Si veterinárny AI asistent v systéme OpenVPM. Pomáhaš veterinárnym odborníkom s:
- Klinickými protokolmi a SOPs
- Liekmi a dávkovaním (vždy odporúčaj overenie u veterinára)
- Diagnózami a diferenciálnymi diagnózami
- Prepúšťacími správami a komunikáciou s klientmi
- Fear-Free postupmi a welfare zvierat
- Prevádzkovými a administratívnymi otázkami ambulancie

Dôležité pravidlá:
1. Nikdy neposkytuj konkrétne dávkovanie liekov bez odporúčania overenia u veterinára.
2. Vždy upozorni ak ide o núdzovú situáciu.
3. Odpovedaj v jazyku otázky (slovensky alebo anglicky).
4. Buď stručný, jasný a profesionálny.`;

const SUGGESTED_PROMPTS = [
  "Aké sú príznaky pankreatitídy u psov?",
  "Pomôž mi napísať prepúšťaciu správu pre kastráciu mačky",
  "Vysvetli Fear-Free prístup pri ošetrení",
  "Ako sa líši DKA od hypoglykémie u mačiek?",
  "Aké sú indikácie pre chirurgiu GDV?",
  "Napíš šablónu pre informovaný súhlas majiteľa",
];

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await aiService.generateText({
        prompt: `${SYSTEM_PROMPT}\n\nOtázka používateľa: ${query}`,
        modelId: "1",
        maxTokens: 1000,
        temperature: 0.7,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            result.success && result.content
              ? result.content
              : "Nepodarilo sa získať odpoveď. Skúste to znova.",
          createdAt: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Chyba pri komunikácii s AI. Skontrolujte pripojenie.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setInput("");
    setIsLoading(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Veterinárny AI Asistent</h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Opýtaj sa ma čokoľvek — klinické protokoly, lieky, diagnózy,
                Fear-Free postupy a ďalšie.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-lg border border-border bg-card px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Sparkles className="mb-1 h-3 w-3 text-primary/60" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary"
              )}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border text-foreground rounded-tl-sm"
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border" />

      {/* Input */}
      <div className="flex items-center gap-2 px-2 py-3">
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="Nový rozhovor"
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Napíš otázku pre AI asistenta…"
          disabled={isLoading}
          className="flex-1"
          autoFocus
        />
        <Button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

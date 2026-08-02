"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, Mic, Image as ImageIcon, Stethoscope, FileText } from "lucide-react";

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Agent Chat", href: "/agent", icon: Bot, exact: true },
    { name: "Voice Scribe", href: "/agent/voice", icon: Mic, exact: false },
    { name: "Medical Imaging", href: "/agent/imaging", icon: ImageIcon, exact: false },
    { name: "Clinical Assistant", href: "/agent/clinical", icon: Stethoscope, exact: false },
    { name: "Discharge Report", href: "/agent/discharge", icon: FileText, exact: false },
  ];

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col pt-6">
      <div className="mb-6 flex space-x-1 rounded-xl bg-muted/40 p-1 shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.exact 
            ? pathname === tab.href 
            : pathname.startsWith(tab.href);
            
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{tab.name}</span>
            </Link>
          );
        })}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

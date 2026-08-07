"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PawPrint,
  Users,
  Calendar,
  FileText,
  Receipt,
  Package,
  MessageSquare,
  ClipboardList,
  BarChart3,
  Settings,
  ShieldAlert,
  Bot,
  Mic,
  Stethoscope,
  Image as ImageIcon,
  PenLine,
  Star,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Megaphone,
  CalendarDays,
  Workflow,
  BookOpen,
  ReceiptText,
  Sparkles,
  Globe,
  Palette,
  Zap,
} from "lucide-react";
import { PawMark } from "@/components/brand/paw-mark";
import { useTranslations } from "next-intl";

type UserRole = "admin" | "veterinarian" | "technician" | "front_desk" | "viewer";

const allRoles: UserRole[] = [
  "admin",
  "veterinarian",
  "technician",
  "front_desk",
  "viewer",
];

function isUserRole(role?: string | null): role is UserRole {
  return allRoles.includes(role as UserRole);
}

interface NavItem {
  href: string;
  key: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: string;
  exact?: boolean;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    titleKey: "nav.sectionClinical",
    items: [
      { href: "/", key: "nav.dashboard", icon: LayoutDashboard, roles: allRoles, exact: true },
      { href: "/patients", key: "nav.patients", icon: PawPrint, roles: allRoles },
      { href: "/clients", key: "nav.clients", icon: Users, roles: allRoles },
      { href: "/schedule", key: "nav.schedule", icon: Calendar, roles: allRoles },
      { href: "/records", key: "nav.records", icon: FileText, roles: allRoles },
      { href: "/billing", key: "nav.billing", icon: Receipt, roles: allRoles, exact: true },
      { href: "/billing/ekasa", key: "nav.ekasaReceipts", icon: ReceiptText, roles: ["admin", "veterinarian"] },
      { href: "/inventory", key: "nav.inventory", icon: Package, roles: allRoles },
      { href: "/inbox", key: "nav.inbox", icon: MessageSquare, roles: allRoles },
      { href: "/whiteboard", key: "nav.whiteboard", icon: ClipboardList, roles: allRoles },
      { href: "/controlled-substances", key: "nav.controlledSubstances", icon: ShieldAlert, roles: ["admin", "veterinarian"] },
      { href: "/reports", key: "nav.reports", icon: BarChart3, roles: ["admin", "veterinarian"] },
    ],
  },
  {
    titleKey: "nav.sectionMarketing",
    items: [
      { href: "/marketing", key: "nav.marketing", icon: Megaphone, roles: ["admin", "veterinarian", "front_desk"], exact: true },
      { href: "/marketing/planner", key: "nav.marketingPlanner", icon: CalendarDays, roles: ["admin", "veterinarian", "front_desk"] },
      { href: "/marketing/brand-kit", key: "nav.marketingBrandKit", icon: Palette, roles: ["admin", "veterinarian"] },
      { href: "/marketing/automations", key: "nav.automations", icon: Zap, roles: ["admin"] },
      { href: "/marketing/media", key: "nav.marketingMedia", icon: ImageIcon, roles: ["admin", "veterinarian", "front_desk"] },
      { href: "/marketing/canvas", key: "nav.marketingCanvas", icon: PenLine, roles: ["admin", "veterinarian"] },
      { href: "/marketing/reviews", key: "nav.marketingReviews", icon: Star, roles: ["admin", "veterinarian", "front_desk"] },
      { href: "/website", key: "nav.website", icon: Globe, roles: ["admin", "veterinarian", "front_desk"] },
    ],
  },
  {
    titleKey: "nav.sectionAi",
    items: [
      { href: "/agent", key: "nav.agent", icon: Bot, roles: ["admin", "veterinarian"], badge: "AI", exact: true },
      { href: "/agent/voice", key: "nav.agentVoice", icon: Mic, roles: allRoles, badge: "AI" },
      { href: "/documents", key: "nav.documents", icon: BookOpen, roles: allRoles, badge: "AI" },
      { href: "/agent/clinical", key: "nav.agentClinical", icon: Stethoscope, roles: ["admin", "veterinarian"], badge: "AI" },
      { href: "/agent/imaging", key: "nav.agentImaging", icon: ImageIcon, roles: ["admin", "veterinarian"], badge: "AI" },
      { href: "/agent/discharge", key: "nav.agentDischarge", icon: FileCheck, roles: allRoles, badge: "AI" },
    ],
  },
  {
    titleKey: "nav.sectionSettings",
    items: [
      { href: "/settings", key: "nav.settings", icon: Settings, roles: ["admin"] },
    ],
  },
];

type SidebarProps = {
  className?: string;
  collapsible?: boolean;
  onNavigate?: () => void;
  width?: "fixed" | "full";
};

export function Sidebar({
  className,
  collapsible = true,
  onNavigate,
  width = "fixed",
}: SidebarProps = {}) {
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = isUserRole(session?.user?.role) ? session.user.role : undefined;
  const { data: branding } = trpc.settings.getBranding.useQuery();
  const isCollapsed = collapsible && collapsed;
  const canShowNav = status === "authenticated" && role !== undefined;

  // Optimized lightweight background polling for unread inbox badge (prevents DB locks & 30s UI lags)
  const { data: unreadData } = trpc.communications.getUnreadCount.useQuery(
    undefined,
    {
      enabled: canShowNav,
      refetchInterval: 60000,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  const unreadInboxCount = Math.max(0, Number(unreadData?.count ?? 0));
  const unreadInboxLabel =
    unreadInboxCount > 99 ? "99+" : String(unreadInboxCount);

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-surface transition-all duration-150 shadow-sm",
        width === "full" ? "w-full" : isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center border-b border-border px-4 justify-between">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          {branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={branding.name ?? "Practice logo"}
              className="h-8 w-8 rounded-lg object-cover shrink-0"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0 shadow-xs">
              <PawMark className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          {!isCollapsed && (
            <div className="min-w-0">
              <span className="font-heading text-base font-bold tracking-tight block truncate">
                VET IS
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-1 font-medium truncate">
                OpenVPM Suite
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5 custom-scrollbar" role="navigation" aria-label="Main navigation">
        {canShowNav &&
          navSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) => item.roles.includes(role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center justify-between">
                    <span>{t(section.titleKey)}</span>
                    {section.titleKey === "nav.sectionAi" && (
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                )}
                {isCollapsed && idx > 0 && (
                  <div className="my-2 border-t border-border/50 mx-2" />
                )}

                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          data-tour={`nav-${item.href}`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all group relative",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-xs font-bold"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <span className="relative shrink-0">
                            <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-105", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                            {isCollapsed && item.href === "/inbox" && unreadInboxCount > 0 ? (
                              <span
                                aria-label={`${unreadInboxCount} unread inbox conversations`}
                                className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-surface"
                              />
                            ) : null}
                          </span>

                          {!isCollapsed && (
                            <span className="truncate flex-1 text-left">{t(item.key)}</span>
                          )}

                          {!isCollapsed && item.href === "/inbox" && unreadInboxCount > 0 ? (
                            <span
                              aria-label={`${unreadInboxCount} unread inbox conversations`}
                              className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground"
                            >
                              {unreadInboxLabel}
                            </span>
                          ) : null}

                          {!isCollapsed && item.badge ? (
                            <span
                              className={cn(
                                "ml-auto rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase leading-none tracking-wider",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              )}
                            >
                              {item.badge}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
      </nav>

      {/* User Footer & Collapse Control */}
      <div className="border-t border-border p-2 space-y-1">
        {session?.user && !isCollapsed && (
          <div className="flex items-center gap-3 rounded-lg bg-accent/40 px-3 py-2 border border-border/50">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
              {session.user.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground">
                {session.user.name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground capitalize font-medium">
                {session.user.role ? t(`roles.${session.user.role}`) : ""}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              title="Odhlásiť sa"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
        {collapsible && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex w-full items-center justify-center gap-2 rounded-lg p-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Zbaliť menu</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}

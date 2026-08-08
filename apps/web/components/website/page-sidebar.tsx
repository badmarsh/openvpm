"use client";

import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LayoutTemplate, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TemplatePicker } from "./template-picker";
import { SortableItem } from "./sortable-item";

const templateKeyMap: Record<string, string> = {
  "clean-modern": "cleanModern",
  "warm-trusting": "warmTrusting",
  "clinical-professional": "clinicalProfessional",
  "playful-friendly": "playfulFriendly",
  "emergency-first": "emergencyFirst",
};

interface Page {
  id: string;
  title: string;
  slug: string;
  isHome: boolean;
  showInNav: boolean;
  sortOrder: number;
}

interface PageSidebarProps {
  pages: Page[];
  selectedPageId: string | null;
  siteId: string;
  siteTemplateId: string;
  isUpdatingTemplate: boolean;
  onSelectPage: (id: string) => void;
  onReorderPages: (pageOrders: { id: string; sortOrder: number }[]) => void;
  onChangeTemplate: (templateId: string) => void;
}

export function PageSidebar({
  pages,
  selectedPageId,
  siteId,
  siteTemplateId,
  isUpdatingTemplate,
  onSelectPage,
  onReorderPages,
  onChangeTemplate,
}: PageSidebarProps) {
  const t = useTranslations("website");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pages.findIndex((p) => p.id === active.id);
    const newIndex = pages.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(pages, oldIndex, newIndex);
    onReorderPages(reordered.map((page, index) => ({ id: page.id, sortOrder: index })));
  }

  const templateKey = templateKeyMap[siteTemplateId] ?? "cleanModern";

  return (
    <div className="space-y-4">
      {/* Pages list */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{t("editor.pages")}</h3>
          <Button variant="ghost" size="sm" disabled aria-label={t("editor.addPage")}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pages.map((page) => page.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="mt-3 space-y-1">
              {pages.map((page) => (
                <li key={page.id}>
                  <SortableItem id={page.id} className="w-full">
                    <button
                      type="button"
                      onClick={() => onSelectPage(page.id)}
                      className={cn(
                        "flex flex-1 items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                        selectedPageId === page.id || (!selectedPageId && page.isHome)
                          ? "bg-primary/10 font-medium text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <span>{page.title}</span>
                      {!page.showInNav && (
                        <span className="text-xs text-muted-foreground">hidden</span>
                      )}
                    </button>
                  </SortableItem>
                </li>
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {/* Template switcher */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold">{t("editor.template")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(`templates.${templateKey}` as "templates.cleanModern")}
        </p>
        <TemplatePicker
          onSelect={onChangeTemplate}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={isUpdatingTemplate}
            >
              {isUpdatingTemplate ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LayoutTemplate className="mr-2 h-4 w-4" />
              )}
              {t("editor.template")}
            </Button>
          }
          disabled={isUpdatingTemplate}
        />
      </div>
    </div>
  );
}

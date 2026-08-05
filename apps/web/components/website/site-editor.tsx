"use client";

import { useState } from "react";
import Link from "next/link";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Eye,
  Globe,
  GripVertical,
  LayoutTemplate,
  Loader2,
  Plus,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { TemplatePicker } from "./template-picker";

const templateKeyMap: Record<string, string> = {
  "clean-modern": "cleanModern",
  "warm-trusting": "warmTrusting",
  "clinical-professional": "clinicalProfessional",
  "playful-friendly": "playfulFriendly",
  "emergency-first": "emergencyFirst",
};

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

function SortableItem({ id, children, className }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2",
        isDragging && "opacity-50",
        className
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

export function SiteEditor() {
  const t = useTranslations("website");
  const utils = trpc.useUtils();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: site, isLoading } = trpc.website.getSite.useQuery(undefined);

  const seed = trpc.website.seedDefaultWebsite.useMutation({
    onSuccess: () => {
      toast.success(t("editor.saved"));
      void utils.website.getSite.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const publish = trpc.website.publishSite.useMutation({
    onSuccess: () => {
      toast.success(t("editor.published"));
      void utils.website.getSite.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const unpublish = trpc.website.unpublishSite.useMutation({
    onSuccess: () => {
      toast.success(t("editor.unpublished"));
      void utils.website.getSite.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const reorderPages = trpc.website.reorderPages.useMutation({
    onSuccess: () => {
      toast.success(t("editor.saved"));
      void utils.website.getSite.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const reorderBlocks = trpc.website.reorderBlocks.useMutation({
    onSuccess: () => {
      toast.success(t("editor.saved"));
      void utils.website.getSite.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const selectedPage = site?.pages.find((page) => page.id === selectedPageId) ?? site?.pages[0];

  if (typeof window !== "undefined" && site && !previewUrl) {
    setPreviewUrl(`${window.location.origin}/site/${site.slug}`);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handlePageDragEnd(event: DragEndEvent) {
    if (!site) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = site.pages.findIndex((p) => p.id === active.id);
    const newIndex = site.pages.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(site.pages, oldIndex, newIndex);
    reorderPages.mutate({
      pageOrders: reordered.map((page, index) => ({
        id: page.id,
        sortOrder: index,
      })),
    });
  }

  function handleBlockDragEnd(event: DragEndEvent) {
    if (!selectedPage) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedPage.blocks.findIndex((b) => b.id === active.id);
    const newIndex = selectedPage.blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(selectedPage.blocks, oldIndex, newIndex);
    reorderBlocks.mutate({
      blockOrders: reordered.map((block, index) => ({
        id: block.id,
        sortOrder: index,
      })),
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Globe className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">{t("title")}</h3>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
        <TemplatePicker
          onSelect={(templateId, slug) => seed.mutate({ templateId, slug })}
          trigger={
            <Button className="mt-6" disabled={seed.isPending}>
              {seed.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LayoutTemplate className="mr-2 h-4 w-4" />
              )}
              {t("editor.create")}
            </Button>
          }
          disabled={seed.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold">{site.title}</h2>
          <p className="text-sm text-muted-foreground">
            {t(`status.${site.status}` as "status.draft")} · {site.slug}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              {t("editor.preview")}
            </Link>
          </Button>
          {site.status === "published" ? (
            <Button
              variant="secondary"
              onClick={() => unpublish.mutate({ id: site.id })}
              disabled={unpublish.isPending}
            >
              {unpublish.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("editor.unpublish")}
            </Button>
          ) : (
            <Button
              onClick={() => publish.mutate({ id: site.id })}
              disabled={publish.isPending}
            >
              {publish.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("editor.publish")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pages sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t("editor.pages")}</h3>
              <Button variant="ghost" size="sm" disabled>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handlePageDragEnd}
            >
              <SortableContext
                items={site.pages.map((page) => page.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="mt-3 space-y-1">
                  {site.pages.map((page) => (
                    <li key={page.id}>
                      <SortableItem id={page.id} className="w-full">
                        <button
                          type="button"
                          onClick={() => setSelectedPageId(page.id)}
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

          <div className="rounded-lg border p-4">
            <h3 className="font-semibold">{t("editor.template")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`templates.${templateKeyMap[site.templateId] ?? "cleanModern"}` as "templates.cleanModern")}
            </p>
            <Button variant="outline" size="sm" className="mt-3" disabled>
              <LayoutTemplate className="mr-2 h-4 w-4" />
              {t("editor.template")}
            </Button>
          </div>
        </div>

        {/* Blocks editor */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="font-semibold">{selectedPage?.title}</h3>
              <Button variant="ghost" size="sm" disabled>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleBlockDragEnd}
            >
              <SortableContext
                items={selectedPage?.blocks.map((block) => block.id) ?? []}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y">
                  {selectedPage?.blocks.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50"
                    >
                      <SortableItem id={block.id} className="flex-1">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {t(`blocks.${block.blockType}` as "blocks.hero")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {block.isVisible ? "Visible" : "Hidden"}
                          </p>
                        </div>
                      </SortableItem>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" disabled>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {selectedPage && selectedPage.blocks.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      {t("editor.emptyBlocks")}
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}

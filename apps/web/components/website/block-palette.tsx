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
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortableItem } from "./sortable-item";

interface Block {
  id: string;
  blockType: string;
  sortOrder: number;
  isVisible: boolean;
}

interface BlockPaletteProps {
  page: { id: string; title: string; blocks: Block[] } | undefined;
  onReorderBlocks: (blockOrders: { id: string; sortOrder: number }[]) => void;
  onRemoveBlock?: (blockId: string) => void;
  onAddBlock?: () => void;
}

export function BlockPalette({
  page,
  onReorderBlocks,
  onRemoveBlock,
  onAddBlock,
}: BlockPaletteProps) {
  const t = useTranslations("website");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    if (!page) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = page.blocks.findIndex((b) => b.id === active.id);
    const newIndex = page.blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(page.blocks, oldIndex, newIndex);
    onReorderBlocks(reordered.map((block, index) => ({ id: block.id, sortOrder: index })));
  }

  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">{page?.title ?? t("editor.pages")}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddBlock}
          disabled={!onAddBlock}
          aria-label={t("editor.addBlock")}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Blocks list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={page?.blocks.map((block) => block.id) ?? []}
          strategy={verticalListSortingStrategy}
        >
          <div className="divide-y">
            {page?.blocks.map((block) => (
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
                      {block.isVisible ? t("editor.visible") : t("editor.hidden")}
                    </p>
                  </div>
                </SortableItem>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveBlock?.(block.id)}
                    disabled={!onRemoveBlock}
                    aria-label={t("editor.removeBlock")}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {page && page.blocks.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {t("editor.emptyBlocks")}
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

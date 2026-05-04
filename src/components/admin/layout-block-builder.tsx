"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type LayoutBlock, normalizeLayoutBlocks } from "@/lib/layout-blocks";

function createBlock(type: LayoutBlock["type"]): LayoutBlock {
  const id = `${type}-${Math.random().toString(36).slice(2, 10)}`;
  if (type === "HeroImage") return { id, type, title: "Hero title", subtitle: "", imageUrl: "" };
  if (type === "EditorialText") return { id, type, heading: "Section heading", body: "" };
  if (type === "MasonryGallery") return { id, type, images: [] };
  if (type === "ProjectFactSheet") return { id, type, facts: [] };
  if (type === "AdSlot") return { id, type, title: "Sponsor", imageUrl: "", ctaText: "", ctaUrl: "" };
  return { id, type: "LeadInquiryForm", heading: "Enquire about this project" };
}

function SortableItem({
  block,
  onChange,
  onDelete,
}: {
  block: LayoutBlock;
  onChange: (block: LayoutBlock) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-primary/15 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab rounded-md border border-primary/20 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-primary"
        >
          Drag
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{block.type}</p>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-red-200 px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-red-700"
        >
          Remove
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {block.type === "HeroImage" ? (
          <>
            <input
              value={block.title ?? ""}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              placeholder="Title"
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
            <input
              value={block.subtitle ?? ""}
              onChange={(e) => onChange({ ...block, subtitle: e.target.value })}
              placeholder="Subtitle"
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
            <input
              value={block.imageUrl}
              onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
              placeholder="Image URL"
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
          </>
        ) : null}
        {block.type === "EditorialText" ? (
          <>
            <input
              value={block.heading ?? ""}
              onChange={(e) => onChange({ ...block, heading: e.target.value })}
              placeholder="Heading"
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
            <textarea
              value={block.body}
              onChange={(e) => onChange({ ...block, body: e.target.value })}
              placeholder="Body"
              rows={5}
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
          </>
        ) : null}
        {block.type === "MasonryGallery" ? (
          <textarea
            value={block.images.map((i) => i.url).join("\n")}
            onChange={(e) =>
              onChange({
                ...block,
                images: e.target.value
                  .split("\n")
                  .map((url) => url.trim())
                  .filter(Boolean)
                  .map((url) => ({ url })),
              })
            }
            placeholder="Image URLs (one per line)"
            rows={4}
            className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
          />
        ) : null}
        {block.type === "ProjectFactSheet" ? (
          <>
            <textarea
              value={block.facts.map((fact) => `${fact.label}: ${fact.value}`).join("\n")}
              onChange={(e) =>
                onChange({
                  ...block,
                  facts: e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((line) => {
                      const [label, ...rest] = line.split(":");
                      return { label: label.trim(), value: rest.join(":").trim() };
                    })
                    .filter((v) => v.label && v.value),
                })
              }
              placeholder="Facts as Label: Value"
              rows={4}
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
          </>
        ) : null}
        {block.type === "AdSlot" ? (
          <>
            <input
              value={block.title ?? ""}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              placeholder="Ad title"
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
            <input
              value={block.imageUrl ?? ""}
              onChange={(e) => onChange({ ...block, imageUrl: e.target.value })}
              placeholder="Ad image URL"
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
            <input
              value={block.ctaText ?? ""}
              onChange={(e) => onChange({ ...block, ctaText: e.target.value })}
              placeholder="CTA text"
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
            <input
              value={block.ctaUrl ?? ""}
              onChange={(e) => onChange({ ...block, ctaUrl: e.target.value })}
              placeholder="CTA URL"
              className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
            />
          </>
        ) : null}
        {block.type === "LeadInquiryForm" ? (
          <input
            value={block.heading ?? ""}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
            placeholder="Form heading"
            className="w-full rounded-md border border-primary/20 px-3 py-2 text-sm"
          />
        ) : null}
      </div>
    </div>
  );
}

export function LayoutBlockBuilder({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (blocks: LayoutBlock[]) => void;
}) {
  const blocks = normalizeLayoutBlocks(value);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function setBlock(next: LayoutBlock) {
    onChange(blocks.map((block) => (block.id === next.id ? next : block)));
  }

  function addBlock(type: LayoutBlock["type"]) {
    onChange([...blocks, createBlock(type)]);
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((block) => block.id !== id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  const palette: LayoutBlock["type"][] = [
    "HeroImage",
    "EditorialText",
    "MasonryGallery",
    "ProjectFactSheet",
    "AdSlot",
    "LeadInquiryForm",
  ];

  return (
    <section className="rounded-xl border border-primary/15 bg-surface p-5">
      <h4 className="font-serif text-2xl">Visual Layout Builder</h4>
      <p className="mt-2 text-sm text-muted">Add blocks from sidebar, drag to reorder, and edit content inline.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-primary/10 bg-white p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-primary">Block Palette</p>
          <div className="mt-2 space-y-2">
            {palette.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="w-full rounded-md border border-primary/20 px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-charcoal hover:bg-primary/5"
              >
                + {type}
              </button>
            ))}
          </div>
        </aside>
        <div className="space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              {blocks.length ? (
                blocks.map((block) => (
                  <SortableItem
                    key={block.id}
                    block={block}
                    onChange={setBlock}
                    onDelete={() => removeBlock(block.id)}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-primary/30 bg-white p-6 text-sm text-muted">
                  No blocks yet. Add one from the palette.
                </div>
              )}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </section>
  );
}

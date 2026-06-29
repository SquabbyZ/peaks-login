import { Check } from "lucide-react"
import React from "react"

import { cn } from "~/lib/utils"
import type { Tag } from "~/types"
import { COLOR_CLASSES } from "~/components/ui/tag-badge"

interface TagMultiSelectProps {
  tags: Tag[]
  value: string[]
  onChange: (next: string[]) => void
  testId?: string
  emptyText?: string
}

export function TagMultiSelect({
  tags,
  value,
  onChange,
  testId,
  emptyText = "暂无可选标签,请先在 '标签管理' 中创建"
}: TagMultiSelectProps) {
  if (tags.length === 0) {
    return (
      <p className="text-xs text-muted-foreground" data-testid={`${testId}-empty`}>
        {emptyText}
      </p>
    )
  }
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }
  return (
    <div
      className="flex flex-wrap gap-1.5"
      data-testid={testId}>
      {tags.map((tag) => {
        const selected = value.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            data-testid={`${testId}-option-${tag.id}`}
            className={cn(
              "inline-flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors",
              selected
                ? "border-primary bg-primary/10"
                : "border-border bg-background hover:bg-muted"
            )}>
            <span
              className={cn(
                "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                COLOR_CLASSES[tag.color]
              )}>
              {tag.name}
            </span>
            {selected && <Check className="h-3 w-3 text-primary" />}
          </button>
        )
      })}
    </div>
  )
}

const DOT_HEX: Record<Tag["color"], string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  gray: "#6b7280"
}

interface TagDotProps {
  tag: Tag
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function TagDot({
  tag,
  selected,
  onClick,
  className
}: TagDotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tag.name}
      className={cn(
        "inline-block h-4 w-4 rounded-full border-2 transition-all",
        selected
          ? "border-foreground scale-110"
          : "border-transparent hover:scale-110",
        className
      )}
      style={{ backgroundColor: DOT_HEX[tag.color] }}
    />
  )
}

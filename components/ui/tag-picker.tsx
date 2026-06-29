import { Check, X } from "lucide-react"
import React from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select"
import { COLOR_CLASSES } from "~/components/ui/tag-badge"
import { cn } from "~/lib/utils"
import type { Tag } from "~/types"

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
      <p
        className="text-xs text-muted-foreground"
        data-testid={`${testId}-empty`}>
        {emptyText}
      </p>
    )
  }
  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    )
  }
  return (
    <div className="flex flex-wrap gap-1.5" data-testid={testId}>
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

interface TagSingleSelectProps {
  tags: Tag[]
  value?: string
  onChange: (tagId: string | undefined) => void
  testId?: string
  emptyText?: string
  placeholder?: string
}

export function TagSingleSelect({
  tags,
  value,
  onChange,
  testId,
  emptyText = "暂无可选标签,请先在 '标签管理' 中创建",
  placeholder = "选择标签"
}: TagSingleSelectProps) {
  if (tags.length === 0) {
    return (
      <p
        className="text-xs text-muted-foreground"
        data-testid={`${testId}-empty`}>
        {emptyText}
      </p>
    )
  }
  const selectedTag = tags.find((t) => t.id === value)
  return (
    <div className="flex items-center gap-2" data-testid={testId}>
      <Select
        value={value ?? ""}
        onValueChange={(v) => onChange(v || undefined)}>
        <SelectTrigger
          data-testid={testId ? `${testId}-trigger` : undefined}
          className="h-9 flex-1">
          <SelectValue placeholder={placeholder}>
            {selectedTag ? (
              <span
                className={cn(
                  "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                  COLOR_CLASSES[selectedTag.color]
                )}>
                {selectedTag.name}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {tags.map((tag) => (
            <SelectItem
              key={tag.id}
              value={tag.id}
              data-testid={testId ? `${testId}-option-${tag.id}` : undefined}>
              <span
                className={cn(
                  "mr-2 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
                  COLOR_CLASSES[tag.color]
                )}>
                {tag.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          aria-label="清除标签"
          data-testid={testId ? `${testId}-clear` : undefined}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
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

export function TagDot({ tag, selected, onClick, className }: TagDotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={tag.name}
      className={cn(
        "inline-block h-4 w-4 rounded-full border-2 transition-all",
        selected
          ? "scale-110 border-foreground"
          : "border-transparent hover:scale-110",
        className
      )}
      style={{ backgroundColor: DOT_HEX[tag.color] }}
    />
  )
}

import { cn } from "~/lib/utils"
import type { Tag, TagColor } from "~/types"

export const COLOR_CLASSES: Record<TagColor, string> = {
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
}

export const TAG_COLORS: TagColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "gray"
]

export const COLOR_LABELS: Record<TagColor, string> = {
  red: "红",
  orange: "橙",
  yellow: "黄",
  green: "绿",
  blue: "蓝",
  purple: "紫",
  pink: "粉",
  gray: "灰"
}

interface TagBadgeProps {
  tag: Tag
  className?: string
}

export function TagBadge({ tag, className }: TagBadgeProps) {
  return (
    <span
      title={tag.name}
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
        COLOR_CLASSES[tag.color],
        className
      )}>
      {tag.name}
    </span>
  )
}

interface TagListProps {
  tags: Tag[]
  className?: string
}

export function TagList({ tags, className }: TagListProps) {
  if (tags.length === 0) return null
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      {tags.map((tag) => (
        <TagBadge key={tag.id} tag={tag} />
      ))}
    </span>
  )
}

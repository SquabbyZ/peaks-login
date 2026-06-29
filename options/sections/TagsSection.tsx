import { MoreHorizontal, Pencil, Plus, Tag, Trash2 } from "lucide-react"
import React, { useEffect, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "~/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table"
import {
  COLOR_CLASSES,
  COLOR_LABELS,
  TAG_COLORS,
  TagBadge
} from "~/components/ui/tag-badge"
import type { TagColor, Tag as TagModel } from "~/types"

interface TagsSectionProps {
  tags: TagModel[]
  t: (key: string) => string
  onAdd: (data: TagFormData) => Promise<void> | void
  onEdit: (id: string, data: TagFormData) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
}

export interface TagFormData {
  name: string
  color: TagColor
}

const EMPTY_FORM: TagFormData = { name: "", color: "blue" }

export function TagsSection({
  tags,
  t,
  onAdd,
  onEdit,
  onDelete
}: TagsSectionProps) {
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TagFormData>(EMPTY_FORM)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (formError) {
      const timer = setTimeout(() => setFormError(null), 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [formError])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (tag: TagModel) => {
    setEditingId(tag.id)
    setForm({ name: tag.name, color: tag.color })
    setFormError(null)
    setFormOpen(true)
  }

  const cancelForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  const saveForm = async () => {
    const name = form.name.trim()
    if (!name) {
      setFormError("请输入标签名称")
      return
    }
    if (name.length > 16) {
      setFormError("标签名称不能超过 16 个字符")
      return
    }
    if (editingId) {
      await onEdit(editingId, { name, color: form.color })
    } else {
      await onAdd({ name, color: form.color })
    }
    cancelForm()
  }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    await onDelete(pendingDeleteId)
    setPendingDeleteId(null)
  }

  return (
    <Card id="section-tags" data-testid="section-tags">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle>{t("tagManagement") || "标签管理"}</CardTitle>
          </div>
          <Button onClick={openCreate} size="sm" data-testid="tags-new-button">
            <Plus className="mr-2 h-4 w-4" />
            新建标签
          </Button>
        </div>
        <CardDescription>
          创建可复用的彩色标签, 并在 CAS / 回调 / 账号 / 组合中引用。当前{" "}
          {tags.length} 个。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formOpen && (
          <div
            data-testid="tags-form"
            className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {editingId ? "编辑标签" : "新建标签"}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelForm}
                data-testid="tags-form-cancel">
                取消
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tag-name">名称</Label>
                <Input
                  id="tag-name"
                  data-testid="tag-name"
                  maxLength={16}
                  placeholder="如:生产 / 测试 / 个人"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>颜色</Label>
                <Select
                  value={form.color}
                  onValueChange={(v) =>
                    setForm({ ...form, color: v as TagColor })
                  }>
                  <SelectTrigger data-testid="tag-color">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAG_COLORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {COLOR_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>预览</Label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${COLOR_CLASSES[form.color]}`}>
                    {form.name.trim() || "标签预览"}
                  </span>
                </div>
              </div>
            </div>
            {formError && (
              <div
                data-testid="tags-form-error"
                className="text-xs text-destructive">
                {formError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button onClick={saveForm} data-testid="tags-form-save" size="sm">
                保存
              </Button>
            </div>
          </div>
        )}

        {tags.length > 0 ? (
          <div
            data-testid="tags-table-scroll"
            className="mb-4 max-h-[60vh] overflow-x-auto overflow-y-auto rounded-md border border-border">
            <Table className="border-separate border-spacing-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10 w-[80px] whitespace-nowrap bg-card">
                    颜色
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[200px] whitespace-nowrap bg-card">
                    名称
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[120px] whitespace-nowrap bg-card">
                    预览
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[80px] whitespace-nowrap bg-card text-right">
                    操作
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id} data-testid={`tags-row-${tag.id}`}>
                    <TableCell>
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: DOT_HEX[tag.color] }}
                        aria-label={COLOR_LABELS[tag.color]}
                      />
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {tag.name}
                    </TableCell>
                    <TableCell>
                      <TagBadge tag={tag} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`tags-row-actions-${tag.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(tag)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog
                            open={pendingDeleteId === tag.id}
                            onOpenChange={(o) =>
                              !o && setPendingDeleteId(null)
                            }>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => {
                                e.preventDefault()
                                setPendingDeleteId(tag.id)
                              }}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>删除标签</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确认要删除标签 "{tag.name}"
                                  吗?删除后引用此标签的配置会丢失该标签。此操作不可撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            还没有标签。点右上角"新建标签"开始。
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const DOT_HEX: Record<TagColor, string> = {
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  gray: "#6b7280"
}

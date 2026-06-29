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
      setFormError(t("tagNameRequired"))
      return
    }
    if (name.length > 16) {
      setFormError(t("tagNameTooLong"))
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
            <CardTitle>{t("tagManagement")}</CardTitle>
          </div>
          <Button onClick={openCreate} size="sm" data-testid="tags-new-button">
            <Plus className="mr-2 h-4 w-4" />
            {t("newTag")}
          </Button>
        </div>
        <CardDescription>
          {t("tagManagementDescription")(tags.length)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formOpen && (
          <div
            data-testid="tags-form"
            className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {editingId ? t("editTag") : t("newTag")}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelForm}
                data-testid="tags-form-cancel">
                {t("cancel")}
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tag-name">{t("tagName")}</Label>
                <Input
                  id="tag-name"
                  data-testid="tag-name"
                  maxLength={16}
                  placeholder={t("tagNamePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("tagColor")}</Label>
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
                <Label>{t("tagPreview")}</Label>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${COLOR_CLASSES[form.color]}`}>
                    {form.name.trim() || t("tagPreviewLabel")}
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
                {t("save")}
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
                    {t("tagColor")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[200px] whitespace-nowrap bg-card">
                    {t("tagName")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[120px] whitespace-nowrap bg-card">
                    {t("tagPreview")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[80px] whitespace-nowrap bg-card text-right">
                    {t("actions")}
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
                            {t("edit")}
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
                              {t("delete")}
                            </DropdownMenuItem>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("deleteTagTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("deleteTagDescription")(tag.name)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmDelete}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  {t("delete")}
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
            {t("tagEmpty")}
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

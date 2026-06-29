import {
  Check,
  Copy,
  Download,
  Link as LinkIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X
} from "lucide-react"
import React, { useMemo, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table"
import { TagBadge } from "~/components/ui/tag-badge"
import {
  CallbackDialogs,
  type CallbackFormData
} from "~/options/dialogs/CallbackDialogs"
import type { CallbackConfig, Tag } from "~/types"

interface CallbackSectionProps {
  configs: CallbackConfig[]
  t: (key: string) => string
  onAdd: (data: CallbackFormData) => Promise<void> | void
  onEdit: (id: string, data: CallbackFormData) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
  onCopy: (config: CallbackConfig) => Promise<void> | void
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void
  copiedId: string | null
  tags: Tag[]
}

const EMPTY_FORM: CallbackFormData = {
  name: "",
  url: "",
  tokenKeys: ["accessToken"],
  enableCors: false,
  tagId: undefined
}

export function CallbackSection({
  configs,
  t,
  onAdd,
  onEdit,
  onDelete,
  onCopy,
  onExport,
  onImport,
  copiedId,
  tags
}: CallbackSectionProps) {
  const [addingOpen, setAddingOpen] = useState(false)
  const [editing, setEditing] = useState<CallbackConfig | null>(null)
  const [form, setForm] = useState<CallbackFormData>(EMPTY_FORM)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const tagMap = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag])),
    [tags]
  )

  const filteredCallback = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return configs
    return configs.filter((c) => {
      const effectiveTagId = c.tagId ?? c.tagIds?.[0]
      const tagName = effectiveTagId
        ? (tagMap.get(effectiveTagId)?.name ?? "").toLowerCase()
        : ""
      return (
        c.name.toLowerCase().includes(q) ||
        c.url.toLowerCase().includes(q) ||
        tagName.includes(q)
      )
    })
  }, [configs, searchQuery, tagMap])

  const openEdit = (cb: CallbackConfig) => {
    setEditing(cb)
    setForm({
      name: cb.name,
      url: cb.url,
      tokenKeys: cb.tokenKeys || ["accessToken"],
      enableCors: cb.enableCors || false,
      tagId: cb.tagId ?? cb.tagIds?.[0]
    })
  }

  const handleAdd = async (data: CallbackFormData) => {
    await onAdd(data)
    setAddingOpen(false)
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    await onEdit(editing.id, form)
    setEditing(null)
  }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    await onDelete(pendingDeleteId)
    setPendingDeleteId(null)
  }

  return (
    <Card id="section-callback" data-testid="section-callback">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <CardTitle>{t("callbackAddresses")}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setForm(EMPTY_FORM)
                setAddingOpen(true)
              }}
              size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t("addCallbackAddress")}
            </Button>
            <Button onClick={onExport} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              {t("exportConfig")}
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={onImport}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                id="import-callback-file"
              />
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {t("importConfig")}
              </Button>
            </div>
          </div>
        </div>
        <CardDescription>{t("callbackDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {configs.length > 0 && (
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              className="h-8 pl-8 pr-8 text-xs"
              data-testid="callback-table-search"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="清除搜索"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
        {filteredCallback.length > 0 ? (
          <div
            data-testid="callback-table-scroll"
            className="mb-4 max-h-[60vh] overflow-x-auto overflow-y-auto rounded-md border border-border">
            <Table className="min-w-[960px] border-separate border-spacing-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 top-0 z-20 w-[150px] min-w-[150px] whitespace-nowrap bg-card">
                    {t("callbackName")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[200px] whitespace-nowrap bg-card">
                    {t("callbackUrl")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[140px] min-w-[140px] whitespace-nowrap bg-card">
                    {t("tag")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[200px] whitespace-nowrap bg-card">
                    {t("tokenKeys")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[100px] whitespace-nowrap bg-card">
                    {t("enableCors")}
                  </TableHead>
                  <TableHead className="sticky right-0 top-0 z-20 w-[150px] min-w-[150px] whitespace-nowrap bg-card text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCallback.map((cb) => {
                  const cbTagId = cb.tagId ?? cb.tagIds?.[0]
                  const cbTag = cbTagId ? tagMap.get(cbTagId) : null
                  return (
                    <TableRow key={cb.id}>
                      <TableCell className="sticky left-0 z-10 w-[150px] min-w-[150px] whitespace-nowrap bg-card font-medium">
                        {cb.name}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {cb.url}
                      </TableCell>
                      <TableCell className="w-[140px] min-w-[140px] whitespace-nowrap">
                        {cbTag ? <TagBadge tag={cbTag} /> : null}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {cb.tokenKeys?.join(", ") || "accessToken"}
                      </TableCell>
                      <TableCell className="max-w-[100px]">
                        {(cb.enableCors ?? false) ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="sticky right-0 z-10 w-[150px] min-w-[150px] whitespace-nowrap bg-card text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(cb)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCopy(cb)}>
                              {copiedId === cb.id ? (
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="mr-2 h-4 w-4" />
                              )}
                              {t("copy")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog
                              open={pendingDeleteId === cb.id}
                              onOpenChange={(o) =>
                                !o && setPendingDeleteId(null)
                              }>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    setPendingDeleteId(cb.id)
                                  }}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("delete")}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t("deleteCallbackTitle")}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("deleteCallbackDescription")} "{cb.name}"
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
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : searchQuery ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            没有匹配的回调地址
          </div>
        ) : null}
      </CardContent>
      <CallbackDialogs
        addingOpen={addingOpen}
        onAddingOpenChange={(o) => !o && setAddingOpen(false)}
        editing={editing}
        onEditingOpenChange={(o) => !o && setEditing(null)}
        form={form}
        setForm={setForm}
        onAdd={handleAdd}
        onSaveEdit={handleSaveEdit}
        t={t}
        tags={tags}
      />
    </Card>
  )
}

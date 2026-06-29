import {
  Check,
  Copy,
  Download,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Server,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip"
import { CasDialogs, type CasFormData } from "~/options/dialogs/CasDialogs"
import type { CasConfig, Tag } from "~/types"

interface CasSectionProps {
  configs: CasConfig[]
  t: (key: string) => string
  onAdd: (data: CasFormData) => Promise<void> | void
  onEdit: (id: string, data: CasFormData) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
  onCopy: (config: CasConfig) => Promise<void> | void
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void
  copiedId: string | null
  tags: Tag[]
}

const EMPTY_FORM: CasFormData = {
  name: "",
  url: "",
  usernameField: "email",
  passwordField: "password",
  tokenResponseKey: "token",
  tagId: undefined
}

export function CasSection({
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
}: CasSectionProps) {
  const [addingOpen, setAddingOpen] = useState(false)
  const [editing, setEditing] = useState<CasConfig | null>(null)
  const [form, setForm] = useState<CasFormData>(EMPTY_FORM)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const tagMap = useMemo(
    () => new Map(tags.map((tag) => [tag.id, tag])),
    [tags]
  )

  const filteredCas = useMemo(() => {
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

  const openEdit = (cas: CasConfig) => {
    setEditing(cas)
    setForm({
      name: cas.name,
      url: cas.url,
      usernameField: cas.usernameField || "email",
      passwordField: cas.passwordField || "password",
      tokenResponseKey: cas.tokenResponseKey || "token",
      tagId: cas.tagId ?? cas.tagIds?.[0]
    })
  }

  const handleAdd = async (data: CasFormData) => {
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
    <Card id="section-cas" data-testid="section-cas">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>{t("casLoginAddresses")}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setForm(EMPTY_FORM)
                setAddingOpen(true)
              }}
              size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {t("addCasAddress")}
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
                id="import-cas-file"
              />
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {t("importConfig")}
              </Button>
            </div>
          </div>
        </div>
        <CardDescription>{t("casLoginDescription")}</CardDescription>
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
              data-testid="cas-table-search"
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
        {filteredCas.length > 0 ? (
          <div
            data-testid="cas-table-scroll"
            className="mb-4 max-h-[60vh] overflow-x-auto overflow-y-auto rounded-md border border-border">
            <Table className="min-w-[1000px] border-separate border-spacing-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 top-0 z-20 w-[150px] min-w-[150px] whitespace-nowrap bg-card">
                    {t("casName")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[170px] whitespace-nowrap bg-card">
                    {t("casUrl")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[140px] min-w-[140px] whitespace-nowrap bg-card">
                    {t("tag")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[120px] whitespace-nowrap bg-card">
                    {t("usernameField")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[120px] whitespace-nowrap bg-card">
                    {t("passwordField")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[150px] whitespace-nowrap bg-card">
                    {t("tokenResponseKey")}
                  </TableHead>
                  <TableHead className="sticky right-0 top-0 z-20 w-[150px] min-w-[150px] whitespace-nowrap bg-card text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCas.map((cas) => {
                  const casTagId = cas.tagId ?? cas.tagIds?.[0]
                  const casTag = casTagId ? tagMap.get(casTagId) : null
                  return (
                    <TableRow key={cas.id}>
                      <TableCell className="sticky left-0 z-10 w-[150px] min-w-[150px] whitespace-nowrap bg-card font-medium">
                        {cas.name}
                      </TableCell>
                      <TableCell className="max-w-[170px] truncate text-muted-foreground">
                        {cas.url}
                      </TableCell>
                      <TableCell className="w-[140px] min-w-[140px] whitespace-nowrap">
                        {casTag ? <TagBadge tag={casTag} /> : null}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {cas.usernameField || "email"}
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate">
                        {cas.passwordField || "password"}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {cas.tokenResponseKey || "token"}
                      </TableCell>
                      <TableCell className="sticky right-0 z-10 w-[150px] min-w-[150px] whitespace-nowrap bg-card text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(cas)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCopy(cas)}>
                              {copiedId === cas.id ? (
                                <Check className="mr-2 h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="mr-2 h-4 w-4" />
                              )}
                              {t("copy")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog
                              open={pendingDeleteId === cas.id}
                              onOpenChange={(o) =>
                                !o && setPendingDeleteId(null)
                              }>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    setPendingDeleteId(cas.id)
                                  }}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("delete")}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    {t("deleteCasTitle")}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t("deleteCasDescription")} "{cas.name}"
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
            没有匹配的 CAS 地址
          </div>
        ) : null}
      </CardContent>
      <CasDialogs
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

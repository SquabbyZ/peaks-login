import {
  Check,
  Copy,
  Key,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react"
import React, { useEffect, useMemo, useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "~/components/ui/accordion"
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
import { TagBadge } from "~/components/ui/tag-badge"
import { TagSingleSelect } from "~/components/ui/tag-picker"
import { createTimestamp, generateId } from "~/lib/storage"
import { useCombos } from "~/lib/useCombos"
import { useTranslation } from "~/lib/useTranslation"
import type {
  AccountConfig,
  AppSettings,
  CallbackConfig,
  CasConfig,
  LoginCombo
} from "~/types"

interface CombosSectionProps {
  settings: AppSettings
}

interface ComboDraft {
  name: string
  tagId?: string
  casId: string
  accountId: string
  callbackId: string
  tokenKeyMappings?: Record<string, string>
}

const EMPTY_DRAFT: ComboDraft = {
  name: "",
  tagId: undefined,
  casId: "",
  accountId: "",
  callbackId: "",
  tokenKeyMappings: undefined
}

export function CombosSection({ settings }: CombosSectionProps) {
  const { t } = useTranslation()
  const { combos, loading, error, upsert, remove } = useCombos()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ComboDraft>(EMPTY_DRAFT)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const casList: CasConfig[] = settings.casConfigs ?? []
  const accList: AccountConfig[] = settings.accounts ?? []
  const cbList: CallbackConfig[] = settings.callbackConfigs ?? []
  const tagList = settings.tags ?? []
  const ready = casList.length > 0 && accList.length > 0 && cbList.length > 0

  // 自动 reset 错误
  useEffect(() => {
    if (formError) {
      const t = setTimeout(() => setFormError(null), 3000)
      return () => clearTimeout(t)
    }
    return undefined
  }, [formError])

  const casMap = useMemo(
    () => new Map(casList.map((c) => [c.id, c])),
    [casList]
  )
  const accMap = useMemo(
    () => new Map(accList.map((a) => [a.id, a])),
    [accList]
  )
  const cbMap = useMemo(() => new Map(cbList.map((c) => [c.id, c])), [cbList])
  const tagMap = useMemo(
    () => new Map(tagList.map((tag) => [tag.id, tag])),
    [tagList]
  )

  const openCreate = () => {
    setEditingId(null)
    setDraft({ ...EMPTY_DRAFT })
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (combo: LoginCombo) => {
    setEditingId(combo.id)
    setDraft({
      name: combo.name,
      tagId: combo.tagId ?? combo.tagIds?.[0],
      casId: combo.casId,
      accountId: combo.accountId,
      callbackId: combo.callbackId,
      tokenKeyMappings: combo.tokenKeyMappings
    })
    setFormError(null)
    setFormOpen(true)
  }

  const cancelForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setDraft(EMPTY_DRAFT)
    setFormError(null)
  }

  const saveForm = async () => {
    const name = draft.name.trim()
    if (!name) {
      setFormError(t("comboNameRequired"))
      return
    }
    if (!draft.casId || !draft.accountId || !draft.callbackId) {
      setFormError(t("comboRequiredFields"))
      return
    }
    const now = createTimestamp()
    const existing = editingId ? combos.find((c) => c.id === editingId) : null
    const next: LoginCombo = {
      id: editingId ?? generateId(),
      name,
      tagId: draft.tagId,
      casId: draft.casId,
      accountId: draft.accountId,
      callbackId: draft.callbackId,
      tokenKeyMappings: draft.tokenKeyMappings,
      pinned: existing?.pinned ?? false,
      lastUsedAt: existing?.lastUsedAt,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    }
    await upsert(next)
    cancelForm()
  }

  const handleCopy = async (combo: LoginCombo) => {
    const now = createTimestamp()
    const next: LoginCombo = {
      id: generateId(),
      name: `${combo.name} (${t("copy")})`,
      tagId: combo.tagId ?? combo.tagIds?.[0],
      casId: combo.casId,
      accountId: combo.accountId,
      callbackId: combo.callbackId,
      tokenKeyMappings: combo.tokenKeyMappings,
      pinned: false,
      lastUsedAt: undefined,
      createdAt: now,
      updatedAt: now
    }
    await upsert(next)
    setCopiedId(next.id)
    setTimeout(() => {
      setCopiedId((cur) => (cur === next.id ? null : cur))
    }, 1500)
  }

  const togglePin = async (combo: LoginCombo) => {
    const now = createTimestamp()
    await upsert({ ...combo, pinned: !combo.pinned, updatedAt: now })
  }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    await remove(pendingDeleteId)
    setPendingDeleteId(null)
  }

  // 排序: 置顶在前, 然后按更新时间倒序
  const sortedCombos = useMemo(
    () =>
      [...combos].sort((a, b) => {
        if ((a.pinned ?? false) !== (b.pinned ?? false)) {
          return a.pinned ? -1 : 1
        }
        return b.updatedAt - a.updatedAt
      }),
    [combos]
  )

  // 搜索过滤: 匹配组合名 / 标签名 / CAS 名 / 账号名 / 回调名
  const filteredCombos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sortedCombos
    return sortedCombos.filter((combo) => {
      const cas = casMap.get(combo.casId)
      const acc = accMap.get(combo.accountId)
      const cb = cbMap.get(combo.callbackId)
      const effectiveTagId = combo.tagId ?? combo.tagIds?.[0]
      const tagName = effectiveTagId
        ? (tagMap.get(effectiveTagId)?.name ?? "").toLowerCase()
        : ""
      return (
        combo.name.toLowerCase().includes(q) ||
        tagName.includes(q) ||
        (cas?.name ?? "").toLowerCase().includes(q) ||
        (acc?.name ?? "").toLowerCase().includes(q) ||
        (acc?.username ?? "").toLowerCase().includes(q) ||
        (cb?.name ?? "").toLowerCase().includes(q)
      )
    })
  }, [sortedCombos, searchQuery, casMap, accMap, cbMap, tagMap])

  const renderTag = (combo: LoginCombo) => {
    const effectiveTagId = combo.tagId ?? combo.tagIds?.[0]
    if (!effectiveTagId) return null
    const tag = tagMap.get(effectiveTagId)
    if (!tag) return null
    return (
      <div className="flex items-center gap-1">
        <TagBadge tag={tag} />
      </div>
    )
  }

  return (
    <Card id="section-combos" data-testid="section-combos">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <CardTitle>{t("combos")}</CardTitle>
          </div>
          <Button
            onClick={openCreate}
            disabled={!ready || formOpen}
            size="sm"
            data-testid="combos-new-button">
            <Plus className="mr-2 h-4 w-4" />
            {t("newCombo")}
          </Button>
        </div>
        <CardDescription>
          {t("combosDescription")(combos.length)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!ready && (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            {t("combosRequiredFirstConfig")}
          </div>
        )}

        {formOpen && (
          <div
            data-testid="combos-form"
            className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {editingId ? t("editCombo") : t("newCombo")}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelForm}
                data-testid="combos-form-cancel">
                {t("cancel")}
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="combo-name">{t("comboName")}</Label>
                <Input
                  id="combo-name"
                  data-testid="combo-name"
                  maxLength={32}
                  placeholder={t("comboNamePlaceholder")}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>{t("comboTag")}</Label>
                <TagSingleSelect
                  tags={tagList}
                  value={draft.tagId}
                  onChange={(next) => setDraft({ ...draft, tagId: next })}
                  testId="combo-tags"
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("comboCas")}</Label>
                <Select
                  value={draft.casId || undefined}
                  onValueChange={(v) => setDraft({ ...draft, casId: v })}>
                  <SelectTrigger data-testid="combo-cas">
                    <SelectValue placeholder={t("comboCasPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {casList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("comboAccount")}</Label>
                <Select
                  value={draft.accountId || undefined}
                  onValueChange={(v) => setDraft({ ...draft, accountId: v })}>
                  <SelectTrigger data-testid="combo-account">
                    <SelectValue placeholder={t("comboAccountPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {accList.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label>{t("comboCallback")}</Label>
                <Select
                  value={draft.callbackId || undefined}
                  onValueChange={(v) => setDraft({ ...draft, callbackId: v })}>
                  <SelectTrigger data-testid="combo-callback">
                    <SelectValue placeholder={t("comboCallbackPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {cbList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                {/* Token Key 映射 — 默认折叠 */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem
                    value="token-key-mapping"
                    className="rounded-md border px-3">
                    <AccordionTrigger
                      data-testid="combo-token-key-mapping-trigger"
                      className="text-sm font-medium hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Key className="h-3.5 w-3.5" />
                        <span>{t("comboTokenKeyMapping")}</span>
                        {(() => {
                          const n = draft.callbackId
                            ? (cbList.find((c) => c.id === draft.callbackId)
                                ?.tokenKeys?.length ?? 0)
                            : 0
                          return n > 0 ? (
                            <span className="text-xs text-muted-foreground">
                              {t("comboTokenKeyMappingCount")(n)}
                            </span>
                          ) : null
                        })()}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {!draft.callbackId ? (
                        <p className="py-2 text-xs text-muted-foreground">
                          {t("comboSelectCallbackFirst")}
                        </p>
                      ) : (
                        (() => {
                          const cb = cbList.find(
                            (c) => c.id === draft.callbackId
                          )
                          const tokenKeys = cb?.tokenKeys ?? []
                          if (tokenKeys.length === 0) {
                            return (
                              <p className="py-2 text-xs text-muted-foreground">
                                {t("comboNoTokenKeys")}
                              </p>
                            )
                          }
                          return (
                            <div className="space-y-2 py-2">
                              {tokenKeys.map((tokenKey) => {
                                const mapKey = `${draft.callbackId}:${tokenKey}`
                                return (
                                  <div
                                    key={tokenKey}
                                    className="flex items-center gap-2">
                                    <Label className="w-32 truncate text-xs text-muted-foreground">
                                      {tokenKey}
                                    </Label>
                                    <Select
                                      value={
                                        draft.tokenKeyMappings?.[mapKey] ??
                                        draft.casId
                                      }
                                      onValueChange={(v) =>
                                        setDraft({
                                          ...draft,
                                          tokenKeyMappings: {
                                            ...(draft.tokenKeyMappings ?? {}),
                                            [mapKey]: v
                                          }
                                        })
                                      }>
                                      <SelectTrigger
                                        data-testid={`combo-token-map-${tokenKey}`}
                                        className="flex-1">
                                        <SelectValue
                                          placeholder={t(
                                            "comboSelectTokenSource"
                                          )}
                                        />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {casList.map((c) => (
                                          <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )
                              })}
                              <p className="pt-1 text-xs text-muted-foreground">
                                {t("comboTokenKeyDefaultHint")}
                              </p>
                            </div>
                          )
                        })()
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
            {formError && (
              <div
                data-testid="combos-form-error"
                className="text-xs text-destructive">
                {formError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                onClick={saveForm}
                data-testid="combos-form-save"
                size="sm">
                {t("save")}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            {t("loading")}
          </div>
        ) : sortedCombos.length > 0 ? (
          <>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("comboSearchPlaceholder")}
                className="h-8 pl-8 pr-8 text-xs"
                data-testid="combo-table-search"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={t("clearSearch")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {filteredCombos.length > 0 ? (
              <>
                {/* eslint-disable-next-line react/no-unknown-property */}
                <style>{`[data-testid="combos-table-scroll"] > div { overflow: visible !important; }`}</style>
                <div
                  data-testid="combos-table-scroll"
                  className="mb-4 max-h-[60vh] overflow-x-auto overflow-y-auto rounded-md border border-border">
                  <Table className="min-w-[700px] border-separate border-spacing-0">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 top-0 z-20 w-[200px] min-w-[200px] whitespace-nowrap bg-card">
                          {t("comboName")} / {t("comboTag")}
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 max-w-[140px] whitespace-nowrap bg-card">
                          {t("comboCas")}
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 max-w-[140px] whitespace-nowrap bg-card">
                          {t("comboAccount")}
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 max-w-[140px] whitespace-nowrap bg-card">
                          {t("comboCallback")}
                        </TableHead>
                        <TableHead className="sticky right-0 top-0 z-20 w-[80px] min-w-[80px] whitespace-nowrap bg-card text-right">
                          {t("actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCombos.map((combo) => {
                        const cas = casMap.get(combo.casId)
                        const acc = accMap.get(combo.accountId)
                        const cb = cbMap.get(combo.callbackId)
                        return (
                          <TableRow
                            key={combo.id}
                            data-testid={`combos-row-${combo.id}`}>
                            <TableCell className="sticky left-0 z-10 w-[200px] min-w-[200px] whitespace-nowrap bg-card font-medium">
                              <div className="flex flex-col gap-1 overflow-hidden">
                                <div className="flex items-center gap-1">
                                  {combo.pinned && (
                                    <Pin
                                      className="h-3.5 w-3.5 shrink-0 text-primary"
                                      aria-label={t("pinnedAria")}
                                    />
                                  )}
                                  <span className="truncate">{combo.name}</span>
                                </div>
                                {renderTag(combo)}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[140px] truncate text-muted-foreground">
                              {cas ? (
                                cas.name
                              ) : (
                                <span className="text-destructive">
                                  {t("configDeleted")}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[140px] truncate text-muted-foreground">
                              {acc ? (
                                acc.name
                              ) : (
                                <span className="text-destructive">
                                  {t("configDeleted")}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-[140px] truncate text-muted-foreground">
                              {cb ? (
                                cb.name
                              ) : (
                                <span className="text-destructive">
                                  {t("configDeleted")}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="sticky right-0 z-10 w-[80px] min-w-[80px] whitespace-nowrap bg-card text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    data-testid={`combos-row-actions-${combo.id}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => togglePin(combo)}>
                                    {combo.pinned ? (
                                      <PinOff className="mr-2 h-4 w-4" />
                                    ) : (
                                      <Pin className="mr-2 h-4 w-4" />
                                    )}
                                    {combo.pinned ? t("unpin") : t("pin")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCopy(combo)}>
                                    {copiedId === combo.id ? (
                                      <Check className="mr-2 h-4 w-4 text-green-500" />
                                    ) : (
                                      <Copy className="mr-2 h-4 w-4" />
                                    )}
                                    {copiedId === combo.id
                                      ? t("copied")
                                      : t("copy")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openEdit(combo)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t("edit")}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog
                                    open={pendingDeleteId === combo.id}
                                    onOpenChange={(o) =>
                                      !o && setPendingDeleteId(null)
                                    }>
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onSelect={(e) => {
                                        e.preventDefault()
                                        setPendingDeleteId(combo.id)
                                      }}>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t("delete")}
                                    </DropdownMenuItem>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          {t("deleteComboTitle")}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {t("deleteComboDescription")(
                                            combo.name
                                          )}
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
              </>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {t("combosNoMatch")}
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            {t("combosEmpty")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

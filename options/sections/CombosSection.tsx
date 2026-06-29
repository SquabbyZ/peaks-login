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
import { createTimestamp, generateId } from "~/lib/storage"
import { useCombos } from "~/lib/useCombos"
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
  casId: string
  accountId: string
  callbackId: string
  tokenKeyMappings?: Record<string, string>
}

const EMPTY_DRAFT: ComboDraft = {
  name: "",
  casId: "",
  accountId: "",
  callbackId: "",
  tokenKeyMappings: undefined
}

export function CombosSection({ settings }: CombosSectionProps) {
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
      setFormError("请输入组合名称")
      return
    }
    if (!draft.casId || !draft.accountId || !draft.callbackId) {
      setFormError("请选择 CAS / 账号 / 回调")
      return
    }
    const now = createTimestamp()
    const existing = editingId ? combos.find((c) => c.id === editingId) : null
    const next: LoginCombo = {
      id: editingId ?? generateId(),
      name,
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
      name: `${combo.name} (副本)`,
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

  // 搜索过滤: 匹配组合名 / CAS 名 / 账号名 / 回调名
  const filteredCombos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return sortedCombos
    return sortedCombos.filter((combo) => {
      const cas = casMap.get(combo.casId)
      const acc = accMap.get(combo.accountId)
      const cb = cbMap.get(combo.callbackId)
      return (
        combo.name.toLowerCase().includes(q) ||
        (cas?.name ?? "").toLowerCase().includes(q) ||
        (acc?.name ?? "").toLowerCase().includes(q) ||
        (acc?.username ?? "").toLowerCase().includes(q) ||
        (cb?.name ?? "").toLowerCase().includes(q)
      )
    })
  }, [sortedCombos, searchQuery, casMap, accMap, cbMap])

  return (
    <Card id="section-combos" data-testid="section-combos">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            <CardTitle>登录组合</CardTitle>
          </div>
          <Button
            onClick={openCreate}
            disabled={!ready || formOpen}
            size="sm"
            data-testid="combos-new-button">
            <Plus className="mr-2 h-4 w-4" />
            新建组合
          </Button>
        </div>
        <CardDescription>
          把 CAS + 账号 + 回调地址打成一个命名预设, popup 里一键登录。当前{" "}
          {combos.length} 个。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!ready && (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            需要先在"CAS 登录地址"、"账号"、"回调地址"三个 section 中各至少配 1
            项才能新建组合。
          </div>
        )}

        {formOpen && (
          <div
            data-testid="combos-form"
            className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {editingId ? "编辑组合" : "新建组合"}
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelForm}
                data-testid="combos-form-cancel">
                取消
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="combo-name">名称</Label>
                <Input
                  id="combo-name"
                  data-testid="combo-name"
                  maxLength={32}
                  placeholder="如:开发 / 生产 / 测试"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>CAS</Label>
                <Select
                  value={draft.casId || undefined}
                  onValueChange={(v) => setDraft({ ...draft, casId: v })}>
                  <SelectTrigger data-testid="combo-cas">
                    <SelectValue placeholder="选择 CAS" />
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
                <Label>账号</Label>
                <Select
                  value={draft.accountId || undefined}
                  onValueChange={(v) => setDraft({ ...draft, accountId: v })}>
                  <SelectTrigger data-testid="combo-account">
                    <SelectValue placeholder="选择账号" />
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
                <Label>回调</Label>
                <Select
                  value={draft.callbackId || undefined}
                  onValueChange={(v) => setDraft({ ...draft, callbackId: v })}>
                  <SelectTrigger data-testid="combo-callback">
                    <SelectValue placeholder="选择回调" />
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
                        <span>Token Key 映射</span>
                        {draft.callbackId &&
                        cbList.find((c) => c.id === draft.callbackId)?.tokenKeys
                          ?.length ? (
                          <span className="text-xs text-muted-foreground">
                            (
                            {
                              cbList.find((c) => c.id === draft.callbackId)
                                ?.tokenKeys?.length
                            }{" "}
                            个)
                          </span>
                        ) : null}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {!draft.callbackId ? (
                        <p className="py-2 text-xs text-muted-foreground">
                          先选择回调地址
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
                                该回调地址没有 tokenKey
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
                                        <SelectValue placeholder="选择 CAS 来源" />
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
                                未配置时默认用上方选中的 CAS
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
                保存
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
            加载中...
          </div>
        ) : sortedCombos.length > 0 ? (
          <>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索..."
                className="h-8 pl-8 pr-8 text-xs"
                data-testid="combo-table-search"
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
            {filteredCombos.length > 0 ? (
              <>
                {/* eslint-disable-next-line react/no-unknown-property */}
                <style>{`[data-testid="combos-table-scroll"] > div { overflow: visible !important; }`}</style>
                <div
                  data-testid="combos-table-scroll"
                  className="mb-4 max-h-[60vh] overflow-x-auto overflow-y-auto rounded-md border border-border">
                  <Table className="border-separate border-spacing-0">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 z-10 max-w-[160px] whitespace-nowrap bg-card">
                          名称
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 max-w-[140px] whitespace-nowrap bg-card">
                          CAS
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 max-w-[140px] whitespace-nowrap bg-card">
                          账号
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 max-w-[140px] whitespace-nowrap bg-card">
                          回调
                        </TableHead>
                        <TableHead className="sticky top-0 z-10 w-[80px] whitespace-nowrap bg-card text-right">
                          操作
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
                        <TableCell className="max-w-[160px] truncate font-medium">
                          <div className="flex items-center gap-1">
                            {combo.pinned && (
                              <Pin
                                className="h-3.5 w-3.5 shrink-0 text-primary"
                                aria-label="已置顶"
                              />
                            )}
                            <span className="truncate">{combo.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-muted-foreground">
                          {cas ? (
                            cas.name
                          ) : (
                            <span className="text-destructive">已删除</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-muted-foreground">
                          {acc ? (
                            acc.name
                          ) : (
                            <span className="text-destructive">已删除</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[140px] truncate text-muted-foreground">
                          {cb ? (
                            cb.name
                          ) : (
                            <span className="text-destructive">已删除</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
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
                                {combo.pinned ? "取消置顶" : "置顶"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCopy(combo)}>
                                {copiedId === combo.id ? (
                                  <Check className="mr-2 h-4 w-4 text-green-500" />
                                ) : (
                                  <Copy className="mr-2 h-4 w-4" />
                                )}
                                {copiedId === combo.id ? "已复制" : "复制"}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(combo)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                编辑
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
                                  删除
                                </DropdownMenuItem>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      删除登录组合
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确认要删除组合 "{combo.name}"
                                      吗?此操作不可撤销。
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
                    )
                  })}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                没有匹配的组合
              </div>
            )}
          </>
        ) : (
          <div className="py-6 text-center text-xs text-muted-foreground">
            还没有组合。点右上角"新建组合"开始。
          </div>
        )}
      </CardContent>
    </Card>
  )
}

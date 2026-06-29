import {
  Check,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
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
import {
  AccountDialogs,
  type AccountFormData
} from "~/options/dialogs/AccountDialogs"
import type { AccountConfig } from "~/types"

interface AccountSectionProps {
  accounts: AccountConfig[]
  t: (key: string) => string
  onAdd: (data: AccountFormData) => Promise<void> | void
  onEdit: (id: string, data: AccountFormData) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
  onCopy: (config: AccountConfig) => Promise<void> | void
  copiedId: string | null
}

const EMPTY_FORM: AccountFormData = { name: "", username: "", password: "" }
const EMPTY_EDIT_FORM: AccountFormData = {
  name: "",
  username: "",
  password: ""
}

export function AccountSection({
  accounts,
  t,
  onAdd,
  onEdit,
  onDelete,
  onCopy,
  copiedId
}: AccountSectionProps) {
  const [addingOpen, setAddingOpen] = useState(false)
  const [editing, setEditing] = useState<AccountConfig | null>(null)
  const [form, setForm] = useState<AccountFormData>(EMPTY_FORM)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredAccounts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q)
    )
  }, [accounts, searchQuery])

  const openEdit = (acc: AccountConfig) => {
    setEditing(acc)
    setForm({ ...EMPTY_EDIT_FORM, name: acc.name, username: acc.username })
  }

  const handleAdd = async (data: AccountFormData) => {
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
    <Card id="section-account" data-testid="section-account">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>{t("accounts")}</CardTitle>
          </div>
          <Button
            onClick={() => {
              setForm(EMPTY_FORM)
              setAddingOpen(true)
            }}
            size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("addAccount")}
          </Button>
        </div>
        <CardDescription>{t("accountsDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        {accounts.length > 0 && (
          <div className="relative mb-2">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              className="h-8 pl-8 pr-8 text-xs"
              data-testid="account-table-search"
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
        {filteredAccounts.length > 0 ? (
          <div
            data-testid="account-table-scroll"
            className="mb-4 max-h-[60vh] overflow-x-auto overflow-y-auto rounded-md border border-border">
            <Table className="border-separate border-spacing-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10 max-w-[150px] whitespace-nowrap bg-card">
                    {t("accountName")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[150px] whitespace-nowrap bg-card">
                    {t("accountUsername")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 max-w-[150px] whitespace-nowrap bg-card">
                    {t("accountPassword")}
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[150px] whitespace-nowrap bg-card text-right">
                    {t("actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell className="max-w-[150px] truncate font-medium">
                      {acc.name}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {acc.username}
                    </TableCell>
                    <TableCell className="max-w-[150px] text-muted-foreground">
                      {t("passwordEncrypted")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(acc)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onCopy(acc)}>
                            {copiedId === acc.id ? (
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            {t("copy")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog
                            open={pendingDeleteId === acc.id}
                            onOpenChange={(o) =>
                              !o && setPendingDeleteId(null)
                            }>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={(e) => {
                                  e.preventDefault()
                                  setPendingDeleteId(acc.id)
                                }}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t("delete")}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("deleteAccountTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("deleteAccountDescription")} "{acc.name}"
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
        ) : searchQuery ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            没有匹配的账号
          </div>
        ) : null}
      </CardContent>
      <AccountDialogs
        addingOpen={addingOpen}
        onAddingOpenChange={(o) => !o && setAddingOpen(false)}
        editing={editing}
        onEditingOpenChange={(o) => !o && setEditing(null)}
        form={form}
        setForm={setForm}
        onAdd={handleAdd}
        onSaveEdit={handleSaveEdit}
        t={t}
      />
    </Card>
  )
}

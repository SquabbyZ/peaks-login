import { AlertTriangle } from "lucide-react"
import React from "react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { AccountConfig } from "~/types"

export interface AccountFormData {
  name: string
  username: string
  password?: string
}

interface AccountDialogsProps {
  addingOpen: boolean
  onAddingOpenChange: (open: boolean) => void
  editing: AccountConfig | null
  onEditingOpenChange: (open: boolean) => void
  form: AccountFormData
  setForm: (data: AccountFormData) => void
  onAdd: (data: AccountFormData) => Promise<void> | void
  onSaveEdit: () => Promise<void> | void
  t: (key: string) => string
}

export function AccountDialogs({
  addingOpen,
  onAddingOpenChange,
  editing,
  onEditingOpenChange,
  form,
  setForm,
  onAdd,
  onSaveEdit,
  t
}: AccountDialogsProps) {
  return (
    <>
      <Dialog open={addingOpen} onOpenChange={onAddingOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addAccount")}</DialogTitle>
            <DialogDescription>{t("accountsDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-account-name">{t("accountName")}</Label>
              <Input
                id="new-account-name"
                placeholder={t("accountNamePlaceholder")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-account-username">
                {t("accountUsername")}
              </Label>
              <Input
                id="new-account-username"
                placeholder={t("accountUsernamePlaceholder")}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-account-password">
                {t("accountPassword")}
              </Label>
              <Input
                id="new-account-password"
                type="password"
                placeholder={t("accountPasswordPlaceholder")}
                value={form.password ?? ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onAddingOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => onAdd(form)}
              disabled={!form.name || !form.username || !form.password}>
              {t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={onEditingOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editAccountTitle")}</DialogTitle>
            <DialogDescription>{t("editAccountDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-account-name">{t("accountName")}</Label>
              <Input
                id="edit-account-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-account-username">
                {t("accountUsername")}
              </Label>
              <Input
                id="edit-account-username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="rounded-md border border-border bg-muted p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {t("passwordCannotEdit")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("passwordCannotEditDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onEditingOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={onSaveEdit}
              disabled={!form.name || !form.username}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

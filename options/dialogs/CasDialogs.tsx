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
import type { CasConfig } from "~/types"

export interface CasFormData {
  name: string
  url: string
  usernameField: string
  passwordField: string
  tokenResponseKey: string
}

interface CasDialogsProps {
  addingOpen: boolean
  onAddingOpenChange: (open: boolean) => void
  editing: CasConfig | null
  onEditingOpenChange: (open: boolean) => void
  form: CasFormData
  setForm: (data: CasFormData) => void
  onAdd: (data: CasFormData) => Promise<void> | void
  onSaveEdit: () => Promise<void> | void
  t: (key: string) => string
}

export function CasDialogs({
  addingOpen,
  onAddingOpenChange,
  editing,
  onEditingOpenChange,
  form,
  setForm,
  onAdd,
  onSaveEdit,
  t
}: CasDialogsProps) {
  return (
    <>
      <Dialog open={addingOpen} onOpenChange={onAddingOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("addCasAddress")}</DialogTitle>
            <DialogDescription>{t("casLoginDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="new-cas-name">{t("casName")}</Label>
                <Input
                  id="new-cas-name"
                  placeholder={t("casNamePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="new-cas-url">{t("casUrl")}</Label>
                <Input
                  id="new-cas-url"
                  placeholder={t("casUrlPlaceholder")}
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="new-cas-username-field">
                  {t("usernameField")}
                </Label>
                <Input
                  id="new-cas-username-field"
                  placeholder="email"
                  value={form.usernameField}
                  onChange={(e) =>
                    setForm({ ...form, usernameField: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="new-cas-password-field">
                  {t("passwordField")}
                </Label>
                <Input
                  id="new-cas-password-field"
                  placeholder="password"
                  value={form.passwordField}
                  onChange={(e) =>
                    setForm({ ...form, passwordField: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="new-cas-token-response-key">
                  {t("tokenResponseKey")}
                </Label>
                <Input
                  id="new-cas-token-response-key"
                  placeholder={t("tokenResponseKeyPlaceholder")}
                  value={form.tokenResponseKey}
                  onChange={(e) =>
                    setForm({ ...form, tokenResponseKey: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onAddingOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => onAdd(form)}
              disabled={!form.name || !form.url}>
              {t("add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={onEditingOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("editCasTitle")}</DialogTitle>
            <DialogDescription>{t("editCasDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-name">{t("casName")}</Label>
              <Input
                id="edit-cas-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-url">{t("casUrl")}</Label>
              <Input
                id="edit-cas-url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-username-field">
                {t("usernameField")}
              </Label>
              <Input
                id="edit-cas-username-field"
                value={form.usernameField}
                onChange={(e) =>
                  setForm({ ...form, usernameField: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-password-field">
                {t("passwordField")}
              </Label>
              <Input
                id="edit-cas-password-field"
                value={form.passwordField}
                onChange={(e) =>
                  setForm({ ...form, passwordField: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cas-token-response-key">
                {t("tokenResponseKey")}
              </Label>
              <Input
                id="edit-cas-token-response-key"
                value={form.tokenResponseKey}
                onChange={(e) =>
                  setForm({ ...form, tokenResponseKey: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onEditingOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={onSaveEdit} disabled={!form.name || !form.url}>
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

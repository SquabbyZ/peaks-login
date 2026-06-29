import { Eye, EyeOff } from "lucide-react"
import React, { useEffect, useState } from "react"

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
import { TagSingleSelect } from "~/components/ui/tag-picker"
import { decrypt, importKey } from "~/lib/crypto"
import type { AccountConfig, Tag } from "~/types"

export interface AccountFormData {
  name: string
  username: string
  password?: string
  tagId?: string
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
  masterKey: string
  tags: Tag[]
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
  t,
  masterKey,
  tags
}: AccountDialogsProps) {
  const [addShowPassword, setAddShowPassword] = useState(false)
  const [editShowPassword, setEditShowPassword] = useState(false)
  const [decryptedPassword, setDecryptedPassword] = useState<string | null>(
    null
  )
  const [decryptError, setDecryptError] = useState<string | null>(null)

  useEffect(() => {
    if (!editing || !masterKey) {
      setDecryptedPassword(null)
      setDecryptError(null)
      return
    }
    let cancelled = false
    setDecryptedPassword(null)
    setDecryptError(null)
    const load = async () => {
      try {
        const parsed = JSON.parse(editing.encryptedPassword) as {
          encrypted: string
          iv: string
        }
        const key = await importKey(masterKey)
        const plain = await decrypt(parsed, key)
        if (!cancelled) setDecryptedPassword(plain)
      } catch (err) {
        if (!cancelled)
          setDecryptError(err instanceof Error ? err.message : "解密失败")
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [editing, masterKey])

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
              <div className="relative">
                <Input
                  id="new-account-password"
                  type={addShowPassword ? "text" : "password"}
                  placeholder={t("accountPasswordPlaceholder")}
                  value={form.password ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setAddShowPassword(!addShowPassword)}
                  aria-label={addShowPassword ? "隐藏密码" : "显示密码"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  {addShowPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>标签</Label>
              <TagSingleSelect
                tags={tags}
                value={form.tagId}
                onChange={(next) => setForm({ ...form, tagId: next })}
                testId="new-account-tags"
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
              <Label htmlFor="edit-account-password">
                {t("accountPassword")}
              </Label>
              <div className="relative mt-2">
                <Input
                  id="edit-account-password"
                  type={editShowPassword ? "text" : "password"}
                  value={
                    !masterKey
                      ? "请先初始化加密密钥"
                      : decryptError
                        ? "(解密失败)"
                        : editShowPassword && decryptedPassword
                          ? decryptedPassword
                          : "••••••••"
                  }
                  readOnly
                  disabled={!masterKey || !!decryptError}
                  className="pr-10"
                  data-testid="edit-account-password"
                />
                <button
                  type="button"
                  onClick={() => setEditShowPassword(!editShowPassword)}
                  disabled={!masterKey || !!decryptError || !decryptedPassword}
                  aria-label={editShowPassword ? "隐藏密码" : "显示密码"}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50">
                  {editShowPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                密码已加密存储. 出于安全, 编辑时不修改密码.
              </p>
            </div>
            <div className="grid gap-2">
              <Label>标签</Label>
              <TagSingleSelect
                tags={tags}
                value={form.tagId}
                onChange={(next) => setForm({ ...form, tagId: next })}
                testId="edit-account-tags"
              />
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

import { Plus, Shield, Trash2 } from "lucide-react"
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
import { Switch } from "~/components/ui/switch"
import { TagMultiSelect } from "~/components/ui/tag-picker"
import type { CallbackConfig, Tag } from "~/types"

export interface CallbackFormData {
  name: string
  url: string
  tokenKeys: string[]
  enableCors: boolean
  tagIds: string[]
}

interface CallbackDialogsProps {
  addingOpen: boolean
  onAddingOpenChange: (open: boolean) => void
  editing: CallbackConfig | null
  onEditingOpenChange: (open: boolean) => void
  form: CallbackFormData
  setForm: (data: CallbackFormData) => void
  onAdd: (data: CallbackFormData) => Promise<void> | void
  onSaveEdit: () => Promise<void> | void
  t: (key: string) => string
  tags: Tag[]
}

function TokenKeysEditor({
  tokenKeys,
  onChange,
  t
}: {
  tokenKeys: string[]
  onChange: (keys: string[]) => void
  t: (k: string) => string
}) {
  return (
    <div className="space-y-2.5">
      <Label>{t("tokenKeys")}</Label>
      <div className="space-y-2.5">
        {tokenKeys.map((key, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder={t("tokenKeyPlaceholder")}
              value={key}
              onChange={(e) => {
                const next = [...tokenKeys]
                next[index] = e.target.value
                onChange(next)
              }}
            />
            {tokenKeys.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  onChange(tokenKeys.filter((_, i) => i !== index))
                }
                className="shrink-0 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange([...tokenKeys, ""])}>
          <Plus className="mr-1 h-4 w-4" />
          {t("addTokenKey")}
        </Button>
      </div>
    </div>
  )
}

function CorsToggle({
  checked,
  onCheckedChange,
  t
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  t: (k: string) => string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">{t("enableCors")}</Label>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("enableCorsDescription")}
        </p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export function CallbackDialogs({
  addingOpen,
  onAddingOpenChange,
  editing,
  onEditingOpenChange,
  form,
  setForm,
  onAdd,
  onSaveEdit,
  t,
  tags
}: CallbackDialogsProps) {
  return (
    <>
      <Dialog open={addingOpen} onOpenChange={onAddingOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("addCallbackAddress")}</DialogTitle>
            <DialogDescription>{t("callbackDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="space-y-4">
              <div className="space-y-2.5">
                <Label htmlFor="new-callback-name">{t("callbackName")}</Label>
                <Input
                  id="new-callback-name"
                  placeholder={t("callbackNamePlaceholder")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="new-callback-url">{t("callbackUrl")}</Label>
                <Input
                  id="new-callback-url"
                  placeholder={t("callbackUrlPlaceholder")}
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
              <div className="space-y-2.5">
                <Label>标签</Label>
                <TagMultiSelect
                  tags={tags}
                  value={form.tagIds ?? []}
                  onChange={(next) => setForm({ ...form, tagIds: next })}
                  testId="new-callback-tags"
                />
              </div>
            </div>
            <TokenKeysEditor
              tokenKeys={form.tokenKeys}
              onChange={(k) => setForm({ ...form, tokenKeys: k })}
              t={t}
            />
            <CorsToggle
              checked={form.enableCors}
              onCheckedChange={(v) => setForm({ ...form, enableCors: v })}
              t={t}
            />
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
            <DialogTitle>{t("editCallbackTitle")}</DialogTitle>
            <DialogDescription>
              {t("editCallbackDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label htmlFor="edit-callback-name">{t("callbackName")}</Label>
              <Input
                id="edit-callback-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-callback-url">{t("callbackUrl")}</Label>
              <Input
                id="edit-callback-url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>标签</Label>
              <TagMultiSelect
                tags={tags}
                value={form.tagIds ?? []}
                onChange={(next) => setForm({ ...form, tagIds: next })}
                testId="edit-callback-tags"
              />
            </div>
            <TokenKeysEditor
              tokenKeys={form.tokenKeys}
              onChange={(k) => setForm({ ...form, tokenKeys: k })}
              t={t}
            />
            <CorsToggle
              checked={form.enableCors}
              onCheckedChange={(v) => setForm({ ...form, enableCors: v })}
              t={t}
            />
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

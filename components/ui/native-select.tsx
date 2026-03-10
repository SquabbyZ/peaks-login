import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "~/lib/utils"

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  placeholder?: string
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, placeholder, value, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          value={value || ""}
          className={cn(
            "flex h-10 w-full appearance-none items-center justify-between rounded-md border border-input bg-background px-3 py-2 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
      </div>
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export interface NativeSelectOptionProps
  extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const NativeSelectOption = React.forwardRef<
  HTMLOptionElement,
  NativeSelectOptionProps
>(({ className, ...props }, ref) => (
  <option ref={ref} className={cn("", className)} {...props} />
))
NativeSelectOption.displayName = "NativeSelectOption"

export { NativeSelect, NativeSelectOption }

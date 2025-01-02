import { Inbox } from "lucide-react"

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center border rounded-lg bg-muted/10">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
      <p className="text-muted-foreground">
        Patient reviews will appear here once they are submitted.
      </p>
    </div>
  )
}
import { cn } from "@/lib/utils"

type StatusType = "needs_review" | "prescribed" | "denied"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case "needs_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "prescribed":
        return "bg-green-100 text-green-800 border-green-200"
      case "denied":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: StatusType) => {
    switch (status) {
      case "needs_review":
        return "Needs Review"
      case "prescribed":
        return "Prescribed"
      case "denied":
        return "Denied"
      default:
        return status
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusStyles(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}
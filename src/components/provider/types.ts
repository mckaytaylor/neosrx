export interface Review {
  id: string
  user_id: string
  provider_notes: string | null
  approval_status: "Pending" | "Approved" | "Denied"
  created_at: string
  profiles?: {
    first_name: string | null
    last_name: string | null
  }
}
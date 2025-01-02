import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface Review {
  id: string
  user_id: string
  provider_notes: string | null
  approval_status: "Pending" | "Approved" | "Denied" | null
  created_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
    application_status: string | null
  } | null
}

interface ReviewsTableProps {
  reviews: Review[]
  handleStatusUpdate?: (id: string, status: "Approved" | "Denied", notes: string) => void
  showActions?: boolean
  title: string
}

export const ReviewsTable = ({
  reviews,
  handleStatusUpdate,
  showActions = false,
  title,
}: ReviewsTableProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{title} ({reviews.length})</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Application Progress</TableHead>
              <TableHead>Submission Date</TableHead>
              {showActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews?.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  {review.profiles?.first_name} {review.profiles?.last_name}
                </TableCell>
                <TableCell>{review.approval_status || "Unsubmitted"}</TableCell>
                <TableCell>{review.profiles?.application_status || "Not started"}</TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString()}
                </TableCell>
                {showActions && handleStatusUpdate && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleStatusUpdate(review.id, "Approved", "Approved by provider")
                        }
                        variant="default"
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() =>
                          handleStatusUpdate(review.id, "Denied", "Denied by provider")
                        }
                        variant="destructive"
                        size="sm"
                      >
                        Deny
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {reviews?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={showActions ? 5 : 4}
                  className="text-center py-4"
                >
                  No reviews found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
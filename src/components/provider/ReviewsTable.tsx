import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Review } from "./types"

interface ReviewsTableProps {
  reviews: Review[]
  onUpdateStatus: (reviewId: string, status: "Approved" | "Denied", notes: string) => void
}

export const ReviewsTable = ({ reviews, onUpdateStatus }: ReviewsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                {review.profiles?.first_name} {review.profiles?.last_name}
              </TableCell>
              <TableCell>{review.approval_status}</TableCell>
              <TableCell>
                {new Date(review.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {review.approval_status === "Pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        onUpdateStatus(review.id, "Approved", "Approved by provider")
                      }
                      variant="default"
                      size="sm"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() =>
                        onUpdateStatus(review.id, "Denied", "Denied by provider")
                      }
                      variant="destructive"
                      size="sm"
                    >
                      Deny
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
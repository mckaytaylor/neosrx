import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
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
import { Shield, UserMinus, UserPlus } from "lucide-react"

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  provider_role: "admin" | "provider" | null
  email?: string
}

export const UserManagement = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isAdmin, setIsAdmin] = useState(false)

  const { data: currentUserProfile } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (error) throw error
      if (!data) {
        toast({
          title: "Profile not found",
          description: "Your profile could not be found.",
          variant: "destructive",
        })
        return null
      }
      
      setIsAdmin(data.provider_role === "admin")
      return data as Profile
    },
  })

  const { data: profiles } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          provider_role,
          users:auth.users(email)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      return (profilesData || []).map(profile => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        provider_role: profile.provider_role,
        email: profile.users?.email
      })) as Profile[]
    },
    enabled: isAdmin,
  })

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: "admin" | "provider" | null }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ provider_role: role })
        .eq("id", userId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] })
      toast({
        title: "Role updated",
        description: "The user's role has been updated successfully.",
      })
    },
    onError: (error) => {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update the user's role. Please try again.",
        variant: "destructive",
      })
    },
  })

  if (!isAdmin) {
    return (
      <div className="text-center py-4">
        You don't have permission to view this section.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles?.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  {profile.first_name} {profile.last_name}
                </TableCell>
                <TableCell>{profile.email}</TableCell>
                <TableCell>{profile.provider_role || "Patient"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {profile.provider_role ? (
                      <Button
                        onClick={() =>
                          updateRole.mutate({ userId: profile.id, role: null })
                        }
                        variant="destructive"
                        size="sm"
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        Remove Provider
                      </Button>
                    ) : (
                      <Button
                        onClick={() =>
                          updateRole.mutate({ userId: profile.id, role: "provider" })
                        }
                        variant="default"
                        size="sm"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Make Provider
                      </Button>
                    )}
                    {profile.provider_role === "provider" && (
                      <Button
                        onClick={() =>
                          updateRole.mutate({ userId: profile.id, role: "admin" })
                        }
                        variant="outline"
                        size="sm"
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Make Admin
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
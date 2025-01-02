import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-end mb-4">
      <Button variant="outline" onClick={onLogout} className="gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
};
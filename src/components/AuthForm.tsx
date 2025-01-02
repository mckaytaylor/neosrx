import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: { email: string; password: string; firstName?: string; lastName?: string }) => void;
  onToggleMode: () => void;
  disabled?: boolean;
}

export const AuthForm = ({ mode, onSubmit, onToggleMode, disabled }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!email || !password || (mode === "register" && (!firstName || !lastName))) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // If we're in register mode and trying to register with an existing email,
    // suggest logging in instead
    try {
      onSubmit({ email, password, firstName, lastName });
    } catch (error: any) {
      if (error.message.includes("user_already_exists")) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please try logging in instead.",
          variant: "destructive",
        });
        // Automatically switch to login mode
        onToggleMode();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      {mode === "register" && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              disabled={disabled}
            />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={disabled}
        />
        <p className="text-sm text-gray-500">Password must be at least 6 characters long</p>
      </div>
      <Button type="submit" className="w-full" disabled={disabled}>
        {mode === "login" ? "Sign In" : "Create Account"}
      </Button>
      <p className="text-center text-sm text-gray-600">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={onToggleMode}
          className="text-primary hover:underline"
          disabled={disabled}
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </form>
  );
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: { email: string; password: string; firstName?: string; lastName?: string }) => void;
  onToggleMode: () => void;
  disabled?: boolean;
  onResetPassword: (email: string) => void;
  showResetPassword: boolean;
  onToggleResetPassword: () => void;
}

export const AuthForm = ({ 
  mode, 
  onSubmit, 
  onToggleMode, 
  disabled,
  onResetPassword,
  showResetPassword,
  onToggleResetPassword,
}: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showResetPassword) {
      if (!email) {
        toast({
          title: "Missing Email",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return;
      }
      onResetPassword(email);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!email || !password || (mode === "register" && (!firstName || !lastName))) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate password length and complexity
    if (password.length < 6) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    onSubmit({ email, password, firstName, lastName });
  };

  if (showResetPassword) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={disabled}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={disabled}>
          Send Reset Link
        </Button>
        <p className="text-center text-sm text-gray-600">
          Remember your password?{" "}
          <button
            type="button"
            onClick={onToggleResetPassword}
            className="text-primary hover:underline"
            disabled={disabled}
          >
            Sign in
          </button>
        </p>
      </form>
    );
  }

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
              required
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
              required
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
          required
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
          required
        />
        <p className="text-sm text-gray-500">Password must be at least 6 characters long</p>
      </div>
      <Button type="submit" className="w-full" disabled={disabled}>
        {mode === "login" ? "Sign In" : "Create Account"}
      </Button>
      <div className="space-y-2 text-center text-sm text-gray-600">
        {mode === "login" && (
          <button
            type="button"
            onClick={onToggleResetPassword}
            className="text-primary hover:underline block w-full"
            disabled={disabled}
          >
            Forgot password?
          </button>
        )}
        <p>
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
      </div>
    </form>
  );
};
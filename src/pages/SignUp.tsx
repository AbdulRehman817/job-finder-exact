import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, User, Building2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { storage, BUCKETS, ID } from "@/lib/appwrite";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState<"candidate" | "employer">("candidate");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  avatarFile: null as File | null,
avatarPreview: "",
    agreeTerms: false,
  });
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();


  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      avatarFile: file,
      avatarPreview: URL.createObjectURL(file),
    }));
  };


  const getSignupErrorMessage = (error: any) => {
    if (!error?.message) {
      return "Something went wrong. Please try again.";
    }
    const message = String(error.message).toLowerCase();
    if (message.includes("rate limit") || message.includes("too many")) {
      return "Signup emails are temporarily limited. Please wait a few minutes and try again.";
    }
    if (message.includes("user already registered") || message.includes("already registered")) {
      return "This email is already registered. Try signing in instead.";
    }
    return error.message;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    toast({
      title: "Passwords don't match",
      description: "Please make sure your passwords match.",
      variant: "destructive",
    });
    return;
  }

  if (!formData.agreeTerms) {
    toast({
      title: "Terms required",
      description: "Please agree to the terms and conditions.",
      variant: "destructive",
    });
    return;
  }

  setLoading(true);

  // Pass the avatar file to signUp - it will handle the upload
  const { error } = await signUp(
    formData.email,
    formData.password,
    formData.fullName,
    accountType,
    formData.avatarFile  // This is correct now
  );
  
  if (error) {
    toast({
      title: "Sign up failed",
      description: getSignupErrorMessage(error),
      variant: "destructive",
    });
  } else {
    toast({
      title: "Account created!",
      description: "Welcome to Jobpilot! You are now signed in.",
    });
    navigate(accountType === "employer" ? "/employer-dashboard" : "/dashboard");
  }
  
  setLoading(false);
};

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col justify-center px-8 lg:px-16 py-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-12">
          
        </Link>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create account.</h1>
          <p className="text-muted-foreground mb-8">
            Already have account?{" "}
            <Link to="/signin" className="text-primary hover:underline">
              Log In
            </Link>
          </p>

          {/* Account Type Toggle */}
          <div className="mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
              Create account as a
            </p>
            <div className="grid grid-cols-2 gap-4 p-1 bg-secondary rounded-lg">
              <button
                type="button"
                onClick={() => setAccountType("candidate")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-colors",
                  accountType === "candidate"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="h-4 w-4" />
                Candidate
              </button>
              <button
                type="button"
                onClick={() => setAccountType("employer")}
                className={cn(
                  "flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-colors",
                  accountType === "employer"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="h-4 w-4" />
                Employers
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Picture Section */}
      <div className="flex flex-col items-center gap-3 pb-4 border-b">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                {formData.avatarPreview ? (
                  <img src={formData.avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-primary/50" />
                )}
              </div>
              <label className="cursor-pointer text-sm text-primary hover:underline">
                Upload profile picture
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
            </div>

            <Input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="h-12"
              required
            />

            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="h-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <Checkbox
                checked={formData.agreeTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeTerms: checked as boolean })
                }
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                I've read and agree with your{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Services
                </Link>
              </span>
            </label>

            <Button type="submit" className="w-full h-12 btn-primary" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
          
          </div>


        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block relative bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-900/70" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&h=1600&fit=crop')"
          }}
        />
        <div className="relative bottom-[150pxsi] z-10 h-full flex flex-col justify-end p-12 text-primary-foreground">
          <h2 className="text-4xl font-bold mb-6">
            {accountType === "candidate" 
              ? "Find your dream job with Jobpilot"
              : "Hire the best talent with Jobpilot"}
          </h2>
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">1,75,324</p>
              <p className="text-sm text-primary-foreground/70">Live Job</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                <Building2 className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">97,354</p>
              <p className="text-sm text-primary-foreground/70">Companies</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                <User className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">7,532</p>
              <p className="text-sm text-primary-foreground/70">Candidates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

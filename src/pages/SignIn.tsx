import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSeo } from "@/hooks/useSeo";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  useSeo({
    title: "Sign In",
    description: "Sign in to Hirely to manage your job search and applications.",
    noIndex: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error, role } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate(role === "employer" ? "/employer-dashboard" : "/");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mb-12">
         
        </Link>

        <div className="max-w-md">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Sign in</h1>
          <p className="text-muted-foreground mb-8">
            Don't have account{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Create Account
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <span className="text-sm text-muted-foreground">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forget password
              </Link>
            </div>

            <Button type="submit" className="w-full h-12 btn-primary" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

         

         
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
        <div className="relative z-10 h-full flex flex-col justify-end p-12 text-primary-foreground">
          <h2 className="text-4xl font-bold mb-6">
            Over 1,75,324 candidates
            <br />
            waiting for good employees.
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
                <Briefcase className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">97,354</p>
              <p className="text-sm text-primary-foreground/70">Companies</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">7,532</p>
              <p className="text-sm text-primary-foreground/70">New Jobs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

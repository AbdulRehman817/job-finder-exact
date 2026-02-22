import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Building2,
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Globe,
  Linkedin,
  Facebook,
  Save,
  Edit,
  CheckCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEmployerProfileCompletion } from "@/hooks/useProfileCompletion";
import { useCreateCompany, useMyCompanies } from "@/hooks/useCompanies";
import CompanyProfileForm from "@/components/company/CompanyProfileForm";
import { databases, DATABASE_ID, COLLECTIONS, Query } from "@/lib/appwrite";
import { dispatchFeedbackNudge } from "@/lib/feedbackPrompt";

const RecruiterProfile = () => {
  const { user, profile, loading, refreshProfile, userRole } = useAuth();
  const { toast } = useToast();
  const { data: companies = [] } = useMyCompanies();
  const profileCompletion = useEmployerProfileCompletion();
  const createCompany = useCreateCompany();

  const [saving, setSaving] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    title: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    avatar_url: "",
    linkedin_url: "",
    facebook_url: "",
  });
  const [newCompany, setNewCompany] = useState({
    name: "",
    location: "",
    industry: "",
    website: "",
    description: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        title: profile.title || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        website: profile.website || "",
        avatar_url: profile.avatar_url || "",
        linkedin_url: profile.linkedin_url || "",
        facebook_url: (profile as any).facebook_url || "",
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (userRole === "candidate") {
    return <Navigate to="/profile" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limit bio to 500 characters
    if (name === 'bio' && value.length > 500) {
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Find the user's profile document
      const { documents } = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        [Query.equal('user_id', user.id)]
      );

      if (documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.PROFILES,
          documents[0].$id,
          {
            full_name: formData.full_name,
            title: formData.title,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
            website: formData.website,
            avatar_url: formData.avatar_url,
            linkedin_url: formData.linkedin_url,
            facebook_url: formData.facebook_url,
          }
        );
      }

      await refreshProfile();
      toast({
        title: "Profile updated",
        description: "Your recruiter profile has been successfully updated.",
      });
      dispatchFeedbackNudge({
        source: "recruiter_profile_saved",
        route: "/recruiter-profile",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompany.name) {
      toast({
        title: "Company name required",
        description: "Please enter a company name.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCompany.mutateAsync(newCompany);
      setNewCompany({ name: "", location: "", industry: "", website: "", description: "" });
      toast({
        title: "Company created",
        description: "Your company profile has been created.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to create company",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const company = companies[0];

  return (
    <Layout>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Recruiter Profile</h1>
              <div className="text-sm text-muted-foreground">
                <Link to="/" className="hover:text-primary">Home</Link>
                <span className="mx-2">/</span>
                <Link to="/employer-dashboard" className="hover:text-primary">Dashboard</Link>
                <span className="mx-2">/</span>
                <span className="text-foreground">Recruiter Profile</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Profile Completion</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={profileCompletion.completionPercentage} className="h-2 w-24" />
                  <span className="text-sm font-medium">{profileCompletion.completionPercentage}%</span>
                </div>
              </div>
              {profileCompletion.isComplete && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              )}
              <Link to="/post-job">
                <Button className="btn-primary" disabled={!profileCompletion.isComplete}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Post a Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Section */}
           

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Abdul Rehman"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Senior Recruiter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+92 300 123 4567"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Lahore, Pakistan"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="bio">Bio</Label>
                    <span className="text-xs text-muted-foreground">{formData.bio.length}/500</span>
                  </div>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell candidates what you look for..."
                    className="min-h-[120px]"
                    maxLength={500}
                  />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                
                {/* <div className="space-y-2">
                  <Label htmlFor="facebook_url" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/username"
                  />
                </div> */}
                   <div className="space-y-2">
                  <Label htmlFor="facebook_url" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook_url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/username"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="btn-primary" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Company Profile</h2>
                  <p className="text-sm text-muted-foreground">
                    This information is shown to candidates on your job posts.
                  </p>
                </div>
              </div>
              {company && (
                <Button variant="outline" onClick={() => setEditingCompany(company)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            {company ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Company</p>
                  <p className="font-medium text-foreground">{company.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Industry</p>
                  <p className="font-medium text-foreground">{company.industry || "Not set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{company.location || "Not set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Website</p>
                  <p className="font-medium text-foreground">{company.website || "Not set"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Description</p>
                  <p className="font-medium text-foreground">{company.description || "Not set"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Add your company details so candidates can learn about your team.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name *</Label>
                    <Input
                      value={newCompany.name}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={newCompany.location}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g. Technology"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                      value={newCompany.website}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newCompany.description}
                    onChange={(e) => setNewCompany((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="What does your company do?"
                  />
                </div>
                <Button onClick={handleCreateCompany} disabled={createCompany.isPending}>
                  {createCompany.isPending ? "Creating..." : "Create Company"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {editingCompany && (
        <CompanyProfileForm
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
        />
      )}
    </Layout>
  );
};

export default RecruiterProfile;

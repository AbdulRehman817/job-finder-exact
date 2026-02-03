import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Building2, Mail, Save, Linkedin, Github, Globe } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ProfileCompletionBanner from "@/components/profile/ProfileCompletionBanner";
import CompanyProfileForm from "@/components/company/CompanyProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { useMyCompanies, useCreateCompany } from "@/hooks/useCompanies";
import { useEmployerProfileCompletion } from "@/hooks/useProfileCompletion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RecruiterProfile = () => {
  const { user, profile, loading, userRole, refreshProfile } = useAuth();
  const { data: companies = [] } = useMyCompanies();
  const createCompany = useCreateCompany();
  const profileCompletion = useEmployerProfileCompletion();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    title: "",
    phone: "",
    location: "",
    website: "",
    linkedin_url: "",
    github_url: "",
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
        website: profile.website || "",
        linkedin_url: profile.linkedin_url || "",
        github_url: (profile as any).github_url || "",
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          title: formData.title,
          phone: formData.phone,
          location: formData.location,
          website: formData.website,
          linkedin_url: formData.linkedin_url,
          github_url: formData.github_url,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: "Profile updated",
        description: "Your recruiter profile has been saved.",
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

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCompany.mutateAsync(newCompany);
      setNewCompany({ name: "", location: "", industry: "", website: "", description: "" });
      toast({
        title: "Company profile created",
        description: "You can now edit company details anytime.",
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
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Recruiter Profile</h1>
              <p className="text-muted-foreground mt-2">
                Keep your recruiter and company information up to date so candidates can trust your listings.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/employer-dashboard" className="hover:text-primary">Dashboard</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <ProfileCompletionBanner
          isComplete={profileCompletion.isComplete}
          missingFields={profileCompletion.missingFields}
          completionPercentage={profileCompletion.completionPercentage}
          type="employer"
        />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Recruiter Details</h2>
                  <p className="text-sm text-muted-foreground">This information appears on your job postings.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Jane Recruiter"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Role / Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Senior Talent Partner"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 555 123 4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
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
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github_url" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Label>
                  <Input
                    id="github_url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleInputChange}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" className="btn-primary" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Recruiter Profile"}
                </Button>
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Company Profile</h3>
                  <p className="text-xs text-muted-foreground">
                    Keep your company details current.
                  </p>
                </div>
              </div>

              {company ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-foreground">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.location || "Location not set"}</p>
                  </div>
                  <Button variant="outline" onClick={() => setCompanyModalOpen(true)}>
                    Edit Company Profile
                  </Button>
                </>
              ) : (
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Company name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_location">Location</Label>
                    <Input
                      id="company_location"
                      value={newCompany.location}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_industry">Industry</Label>
                    <Input
                      id="company_industry"
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, industry: e.target.value }))}
                      placeholder="e.g., SaaS, Fintech"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_website">Website</Label>
                    <Input
                      id="company_website"
                      value={newCompany.website}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, website: e.target.value }))}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_description">Description</Label>
                    <Textarea
                      id="company_description"
                      value={newCompany.description}
                      onChange={(e) => setNewCompany((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell candidates about your company"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={createCompany.isPending} className="w-full">
                    {createCompany.isPending ? "Creating..." : "Create Company Profile"}
                  </Button>
                </form>
              )}
            </div>

            {company && (
              <CompanyProfileForm
                company={company}
                open={companyModalOpen}
                onOpenChange={setCompanyModalOpen}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecruiterProfile;

import { Link } from "react-router-dom";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import CompanyCard from "@/components/companies/CompanyCard";
import { topCompanies } from "@/data/mockData";

const Employers = () => {
  // Extended company list for the page
  const companies = [
    ...topCompanies,
    { id: "7", name: "Twitter", logo: "🐦", location: "San Francisco, USA", openPositions: 5, featured: true },
    { id: "8", name: "Slack", logo: "💬", location: "San Francisco, USA", openPositions: 2 },
    { id: "9", name: "Spotify", logo: "🎵", location: "Stockholm, Sweden", openPositions: 4, featured: true },
    { id: "10", name: "Airbnb", logo: "🏠", location: "San Francisco, USA", openPositions: 6 },
    { id: "11", name: "Pinterest", logo: "📌", location: "San Francisco, USA", openPositions: 3 },
    { id: "12", name: "LinkedIn", logo: "💼", location: "Sunnyvale, USA", openPositions: 8, featured: true },
  ];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Find Employers</h1>
          <div className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Find Employers</span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by: Job title, Position, Keyword..."
                className="pl-10 h-12"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="City, state or zip code"
                className="pl-10 h-12"
              />
            </div>
            <Button className="h-12 px-8 btn-primary">Find Job</Button>
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Employers;

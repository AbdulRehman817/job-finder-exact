import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Company } from "@/types";
import { Button } from "@/components/ui/button";

interface CompanyCardProps {
  company: Company;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  return (
    <div className="company-card">
      <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4 text-3xl">
        {company.logo}
      </div>
      
      <h3 className="font-semibold text-foreground mb-1">{company.name}</h3>
      
      {company.featured && (
        <span className="badge-featured inline-block mb-2">Featured</span>
      )}
      
      <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4">
        <MapPin className="h-3.5 w-3.5" />
        <span>{company.location}</span>
      </div>
      
      <Link to={`/employer/${company.id}`}>
        <Button variant="outline" className="w-full btn-outline-primary">
          Open Position ({company.openPositions})
        </Button>
      </Link>
    </div>
  );
};

export default CompanyCard;

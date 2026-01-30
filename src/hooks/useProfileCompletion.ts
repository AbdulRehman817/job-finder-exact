import { useAuth } from "@/contexts/AuthContext";
import { useMyCompanies } from "@/hooks/useCompanies";

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

export const useCandidateProfileCompletion = (): ProfileCompletionStatus => {
  const { profile } = useAuth();

  const requiredFields = [
    { key: "full_name", label: "Full Name" },
    { key: "title", label: "Professional Title" },
    { key: "location", label: "Location" },
    { key: "bio", label: "Bio" },
    { key: "skills", label: "Skills" },
    { key: "resume_url", label: "Resume" },
  ];

  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    const value = profile?.[field.key as keyof typeof profile];
    if (!value || (Array.isArray(value) && value.length === 0)) {
      missingFields.push(field.label);
    }
  });

  const completedCount = requiredFields.length - missingFields.length;
  const completionPercentage = Math.round((completedCount / requiredFields.length) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  };
};

export const useEmployerProfileCompletion = (): ProfileCompletionStatus & { hasCompany: boolean } => {
  const { profile } = useAuth();
  const { data: companies = [] } = useMyCompanies();

  const hasCompany = companies.length > 0;
  const company = companies[0];

  const requiredProfileFields = [
    { key: "full_name", label: "Full Name" },
  ];

  const requiredCompanyFields = [
    { key: "name", label: "Company Name" },
    { key: "description", label: "Company Description" },
    { key: "industry", label: "Industry" },
    { key: "location", label: "Company Location" },
  ];

  const missingFields: string[] = [];

  // Check profile fields
  requiredProfileFields.forEach((field) => {
    const value = profile?.[field.key as keyof typeof profile];
    if (!value) {
      missingFields.push(field.label);
    }
  });

  // Check company fields
  if (!hasCompany) {
    missingFields.push("Company Profile");
  } else {
    requiredCompanyFields.forEach((field) => {
      const value = company?.[field.key as keyof typeof company];
      if (!value) {
        missingFields.push(field.label);
      }
    });
  }

  const totalFields = requiredProfileFields.length + requiredCompanyFields.length;
  const completedCount = totalFields - missingFields.length;
  const completionPercentage = Math.round((completedCount / totalFields) * 100);

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
    hasCompany,
  };
};

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  salary: string;
  currency?: "USD" | "PKR";
  type: "full-time" | "part-time" | "internship" | "remote" | "contract";
  featured?: boolean;
  description?: string;
  postedDate: string;
  expiryDate?: string;
  benefits?: string[];
  requirements?: string[];
  responsibilities?: string[];
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  location: string;
  openPositions: number;
  featured?: boolean;
  industry?: string;
  description?: string;
  website?: string;
  founded?: string;
  size?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  openPositions: number;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  avatar: string;
  skills?: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  content: string;
}

export const jobTypes = {
  "full-time": { label: "Full Time", className: "badge-fulltime" },
  "part-time": { label: "Part Time", className: "badge-parttime" },
  "internship": { label: "Internship", className: "badge-internship" },
  "remote": { label: "Remote", className: "badge-remote" },
  "contract": { label: "Contract", className: "badge-contract" },
};

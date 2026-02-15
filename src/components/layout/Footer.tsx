import { Link } from "react-router-dom";
import { Briefcase, Phone, MapPin, Facebook, Youtube, Instagram, Twitter } from "lucide-react";
import logo from "@/../public/logo.png";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1 relative sm:bottom-[25px]">
             <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={logo}
              alt="Hirely Logo"
              className="h-20 sm:h-20 w-auto object-contain"
            />
            <span className="text-lg sm:text-xl ml-[-65px] font-bold text-foreground">
              Hirely
            </span>
          </Link>
            <div className="space-y-3 text-sm text-primary-foreground/70">
          
              
            </div>
          </div>

          {/* Quick Link */}
          <div>
            <h4 className="font-semibold mb-4">Quick Link</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link></li>
              <li>
                {/* <Link to="/contact" className="hover:text-primary-foreground transition-colors flex items-center gap-1"> */}
                <span className="text-primary">→</span> 
                Contact
                {/* </Link> */}
                </li>
              <li>
                {/* <Link to="/blog" className="hover:text-primary-foreground transition-colors"> */}
                Blog
                {/* </Link> */}
                </li>
            </ul>
          </div>

          {/* Candidate */}
          <div>
            <h4 className="font-semibold mb-4">Candidate</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/find-jobs" className="hover:text-primary-foreground transition-colors">Browse Jobs</Link></li>
              <li>
                {/* <Link to="/employers" className="hover:text-primary-foreground transition-colors"> */}
              Browse Employers
              {/* </Link> */}
              </li>
              <li>
                {/* <Link to="/dashboard" className="hover:text-primary-foreground transition-colors"> */}
                Candidate Dashboard
                {/* </Link> */}
                </li>
              <li>
                {/* <Link to="/saved-jobs" className="hover:text-primary-foreground transition-colors"> */}
                Saved Jobs
                {/* </Link> */}
                </li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h4 className="font-semibold mb-4">Employers</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                {/* <Link to="/post-job" className="hover:text-primary-foreground transition-colors"> */}
                Post a Job
              {/* </Link> */}
              </li>
              <li>
                {/* <Link to="/candidates" className="hover:text-primary-foreground transition-colors"> */}
                Browse Candidates
                {/* </Link> */}
                </li>
              <li>
                {/* <Link to="/employer-dashboard" className="hover:text-primary-foreground transition-colors"> */}
                Employers Dashboard
                {/* </Link> */}
                </li>
              <li>
                {/* <Link to="/applications" className="hover:text-primary-foreground transition-colors"> */}
                Applications
                {/* </Link> */}
                </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/faqs" className="hover:text-primary-foreground transition-colors">Faqs</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary-foreground transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/70">
            (c) 2026 Hirely - Job Portal. All rights Reserved
          </p>
         
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram } from "lucide-react";
import logo from "@/../public/logo.png";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-5">
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
            <p className="text-slate-400 leading-relaxed max-w-xs text-sm">
              Connecting talent with opportunity. The most trusted platform for finding your next career move.
            </p>
            <div className="flex gap-2">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-md bg-slate-800/80 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-slate-400 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-5">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Candidates */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-5">Candidates</h4>
            <ul className="space-y-3">
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Companies</Link></li>
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-5">Employers</h4>
            <ul className="space-y-3">
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400 mb-5">Support</h4>
            <ul className="space-y-3">
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</Link></li>
              <li><Link to="" className="text-sm text-slate-400 hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Hirely Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

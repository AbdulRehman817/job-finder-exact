import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Mail } from "lucide-react";
import logo from "@/../public/logo.png";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-7 space-y-5">
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

            <p className="text-slate-400 leading-relaxed max-w-xl text-sm sm:text-base">
              Connecting talent with opportunity. The most trusted platform for finding your next career move.
            </p>

            <div className="pt-2">
              <h4 className="font-semibold text-2xl text-white mb-4">Follow us</h4>
              <div className="flex gap-3">
                {[Twitter, Facebook, Instagram].map((Icon, i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-md bg-slate-800/80 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer text-slate-300 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="lg:col-span-5 lg:pl-10 lg:text-right">
            <h4 className="font-semibold text-3xl text-white mb-6">Contact Us</h4>
            <ul className="space-y-5 text-base">
              <li>
                <a
                  href="mailto:support@hirely.com"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4" />
                 abdulrehmanbey1718@gmail.com
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact Page
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors">
                  About Hirely
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>� 2026 Hirely Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

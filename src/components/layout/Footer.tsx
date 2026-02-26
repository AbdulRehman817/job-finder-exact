import { Link } from "react-router-dom";
import { Linkedin, Mail } from "lucide-react";
import BrandLogo from "./BrandLogo";

const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/BZ6TwCE0esh89aw3KAnGnx";
const LINKEDIN_URL = "https://www.linkedin.com/company/hirely";

const WhatsAppIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.52 3.48A11.84 11.84 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.16 1.58 5.98L0 24l6.25-1.64a11.9 11.9 0 0 0 5.69 1.45h.01c6.58 0 11.93-5.35 11.93-11.93 0-3.19-1.24-6.18-3.36-8.4zM11.94 21.8h-.01a9.89 9.89 0 0 1-5.04-1.38l-.36-.22-3.71.98.99-3.62-.24-.37a9.9 9.9 0 0 1-1.52-5.26c0-5.45 4.44-9.88 9.9-9.88a9.8 9.8 0 0 1 7 2.91 9.82 9.82 0 0 1 2.9 6.99c0 5.46-4.44 9.89-9.9 9.89zm5.43-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.46-.15-.66.15-.19.3-.75.97-.91 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.46-.89-.79-1.49-1.76-1.66-2.06-.18-.3-.02-.46.13-.61.13-.12.3-.34.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.43 0 1.42 1.05 2.8 1.19 3 .15.2 2.04 3.12 4.95 4.37.69.3 1.24.48 1.66.62.7.22 1.33.19 1.83.12.56-.08 1.76-.72 2-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
    </svg>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-14 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand */}
           <div className="lg:col-span-7 space-y-0">
            <Link to="/" className="flex items-center gap-2 shrink-0 ">
              <BrandLogo
                className="gap-3"
                imageWrapperClassName="h-12 w-12 rounded-xl"
                textClassName="text-2xl font-bold text-white"
              />
            </Link>

            <p className="mb-[6px] text-slate-400 leading-relaxed max-w-xl text-sm sm:text-base ">
              Connecting talent with opportunity. The most trusted platform for finding your next career move.
            </p>

          
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href={WHATSAPP_COMMUNITY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 hover:text-white transition-colors"
                aria-label="Join our WhatsApp community"
              >
                <WhatsAppIcon className="h-4 w-4 text-green-400" />
              
              </a>

              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 hover:text-white transition-colors"
                aria-label="Visit our LinkedIn page"
              >
                <Linkedin className="h-4 w-4 text-sky-400" />
                
              </a>
            </div>
          
          </div>

          {/* Contact */}
          <div className="lg:col-span-5 lg:pl-10 lg:text-right">
            <h4 className="font-semibold text-md text-white mb-6">Contact Us</h4>
            <ul className="space-y-5 text-base">
              <li>
                <a
                  href="mailto: hirely.contact@gmail.com"
                  className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <Mail className="h-3 w-4" />
                 hirely.contact@gmail.com
                </a>
              </li>
            
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors text-md">
                  About Hirelypk
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>� 2026 Hirelypk Inc. All rights reserved.</p>
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


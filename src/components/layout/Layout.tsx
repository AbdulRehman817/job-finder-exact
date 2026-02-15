import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import UserReviewPopup from "@/components/feedback/UserReviewPopup";

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

const Layout = ({ children, hideFooter = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <UserReviewPopup />
    </div>
  );
};

export default Layout;

import Layout from "@/components/layout/Layout";
import { useSeo } from "@/hooks/useSeo";

const Contact = () => {
  useSeo({
    title: "Contact",
    description: "Contact Hirely for support and feedback.",
  });

  return (
    <Layout>
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl text-center mx-auto">
            <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">Contact</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">Get in touch</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Email us at{" "}
              <a href="mailto:abdulrehmanbey1718@gmail.com" className="text-primary hover:underline">
                abdulrehmanbey1718@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;

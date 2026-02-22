import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, Code2, ShieldCheck, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";

const About = () => {
  useSeo({
    title: "About Hirely",
    description:
      "Hirely is a manually curated job board where each listing is reviewed and posted directly by me.",
  });

  const highlights = [
    {
      icon: BriefcaseBusiness,
      title: "Manual Job Posting",
      description:
"Every job listing is personally collected and posted to maintain quality. Hirely is not an open employer posting portal."
    },
    {
      icon: Users,
      title: "Candidate-Focused Platform",
      description:
        "The website is built for job seekers to browse trusted opportunities in one clean place.",
    },
    {
      icon: ShieldCheck,
      title: "Verified Apply Flow",
      description:
        "Each post links you to the official company application page so you can apply directly.",
    },
  ];

  return (
    <Layout >
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl text-center mx-auto">
            <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">About Hirely</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              A manually managed job board
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
             Hirely helps job seekers find opportunities faster. Every job is added and maintained by us, keeping the platform focused on quality roles.

            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl text-center mx-auto mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-3">How This Website Works</h2>
            <p className="text-muted-foreground">
              The process is simple: I publish jobs manually, and you apply through official company links.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    
{/* 
      <section className="py-16 bg-secondary/40">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to explore opportunities?</h2>
            <p className="text-muted-foreground mb-8">
              Browse the latest manually posted jobs and apply directly through company pages.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/find-jobs">
                <Button size="lg" className="btn-primary px-8 h-12">
                  Browse Jobs
                </Button>
              </Link>
            
            </div>
          </div>
        </div>
      </section> */}
    </Layout>
  );
};

export default About;

import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, ShieldCheck, Users, Sparkles, Zap, Globe } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";

const About = () => {
  useSeo({
    title: "About Hirelypk",
    description:
      "Hirelypk is a premium, manually curated job board connecting high-caliber talent with top-tier opportunities.",
  });

  const highlights = [
    {
      icon: BriefcaseBusiness,
      title: "Premium Curation",
      description:
        "Every listing undergoes a rigorous review process. We select only the roles that matter for your career growth.",
      accent: "text-sky-600",
      bg: "bg-sky-50 dark:bg-sky-900/20",
      border: "border-sky-200/60 dark:border-sky-800/30",
    },
    {
      icon: Users,
      title: "Expert Network",
      description:
        "Join an exclusive ecosystem of industry leaders and ambitious professionals looking for their next major challenge.",
      accent: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-900/20",
      border: "border-violet-200/60 dark:border-violet-800/30",
    },
    {
      icon: ShieldCheck,
      title: "Direct Access",
      description:
        "Skip the noise. We provide direct, verified paths to official application portals for maximum transparency.",
      accent: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200/60 dark:border-emerald-800/30",
    },
  ];

  const stats = [
    { value: "500+", label: "Active Listings" },
    { value: "200+", label: "Partner Companies" },
    { value: "10k+", label: "Job Seekers" },
    { value: "98%", label: "Verified Roles" },
  ];

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-28 pb-20 lg:pt-40 lg:pb-28 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
        {/* Background */}
      
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/6 px-4 py-1.5 mb-7">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase text-primary">
                The Future of Search
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground mb-7 tracking-tight leading-[1.08]">
              Elevating the{" "}
              <span className="relative inline-block">
                <em className="not-italic text-primary">Standard</em>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 220 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 7C55 2 120 2 218 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary/30"
                  />
                </svg>
              </span>{" "}
              of Recruitment
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
              Hirelypk is more than a job board. It's a high-performance engine designed to bridge
              the gap between world-class talent and visionary companies.
            </p>

        
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
    

      {/* ── Methodology ── */}
      <section className="py-24 bg-background relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs font-bold tracking-widest uppercase text-primary mb-3">How We Work</p>
            <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight">Our Methodology</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Precision-engineered for clarity, efficiency, and professional integrity.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {highlights.map((item, i) => (
              <article
                key={item.title}
                className="group relative rounded-2xl border border-border bg-card p-7 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Step number */}
                <span className="absolute top-5 right-6 text-4xl font-black text-border/30 leading-none select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div
                  className={`h-12 w-12 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className={`h-6 w-6 ${item.accent}`} />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission statement ── */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl bg-card border border-border p-10 md:p-14 relative overflow-hidden">
              {/* Decorative blob */}
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

              <div className="relative grid md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Our Mission</p>
                  <h2 className="text-3xl font-bold text-foreground leading-snug mb-5">
                    Built for people who take their careers seriously.
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    We believe finding the right job shouldn't feel like searching for a needle in a haystack.
                    Hirelypk strips away the clutter and connects you directly to opportunities worth your time.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Zap, text: "Fast, distraction-free browsing experience" },
                    { icon: ShieldCheck, text: "Every listing manually verified by our team" },
                    { icon: Globe, text: "Opportunities from companies across Pakistan and beyond" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
    
    </Layout>
  );
};

export default About;
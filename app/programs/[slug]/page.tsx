import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ClipboardList, ExternalLink, LineChart, ShieldCheck } from "lucide-react";
import { fetchGovernmentProgramBySlug } from "@/lib/government-programs";
import ProgramsPlatformHeader from "@/components/programs/programs-platform-header";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await fetchGovernmentProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:4rem_4rem] bg-slate-50 dark:bg-slate-950">
      <ProgramsPlatformHeader
        contextLabel="Program Execution Detail"
        backHref="/"
        backLabel="Back to Home"
        navLinks={[
          { label: "All Programs", href: "/programs" },
          { label: "Dashboard", href: "/government" },
          { label: "Updates", href: "/blog" },
          { label: "Help", href: "/contact" },
        ]}
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-primary font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to all programs
          </Link>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 text-xs rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-0.5">
                <ShieldCheck className="w-3 h-3" />
                Active Program
              </span>
              <span className="inline-flex items-center gap-1 text-xs rounded-full border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-muted-foreground">
                Integrated with Pragati
              </span>
            </div>

            <div className="text-3xl mb-3">{program.icon}</div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{program.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{program.shortDescription}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mt-4">{program.ministry}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-900">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Eligibility Rules</p>
                <p className="font-semibold text-sm mt-1">{program.eligibility.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-900">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Implementation Steps</p>
                <p className="font-semibold text-sm mt-1">{program.implementationChecklist.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 bg-slate-50 dark:bg-slate-900">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Monitoring KPIs</p>
                <p className="font-semibold text-sm mt-1">{program.keyMetrics.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Practical Use in Pragati
              </h2>
              <p className="text-sm text-muted-foreground mt-2">{program.practicalUse}</p>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Eligibility
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {program.eligibility.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Implementation Checklist
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {program.implementationChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Required Data
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-5">
                {program.requiredData.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Key Metrics to Track</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {program.keyMetrics.map((metric) => (
                <div key={metric} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-800/40">
                  {metric}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
            <h2 className="text-lg font-semibold">Official Links</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {program.officialLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {link.label}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

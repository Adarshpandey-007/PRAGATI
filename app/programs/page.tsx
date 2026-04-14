import Link from "next/link";
import { ArrowRight, BookOpen, Landmark, ShieldCheck } from "lucide-react";
import { fetchGovernmentPrograms } from "@/lib/government-programs";
import ProgramsPlatformHeader from "@/components/programs/programs-platform-header";

const PROGRAM_TONES: Record<string, string> = {
  "mid-day-meal-scheme": "from-orange-500 to-amber-500",
  "national-education-policy-2020": "from-blue-500 to-cyan-500",
  "pm-shri-scheme": "from-emerald-500 to-teal-500",
  "diksha-platform": "from-violet-500 to-fuchsia-500",
  "samagra-portal": "from-rose-500 to-red-500",
  "e-pathshala-resources": "from-sky-500 to-indigo-500",
};

export default async function ProgramsPage() {
  const programs = await fetchGovernmentPrograms();

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-[size:4rem_4rem] bg-slate-50 dark:bg-slate-950">
      <ProgramsPlatformHeader
        contextLabel="Education Programs Command Center"
        backHref="/"
        backLabel="Back to Home"
        navLinks={[
          { label: "Dashboard", href: "/government" },
          { label: "Programs", href: "/programs" },
          { label: "Updates", href: "/blog" },
          { label: "Help", href: "/contact" },
        ]}
      />

      <div className="px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-8 sm:pb-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md p-5 sm:p-7 shadow-sm">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Landmark className="w-4 h-4" />
              Government Programs
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">Government Programs and Schemes</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
              Practical playbooks integrated with Pragati attendance operations for policy alignment, compliance monitoring,
              and school-level execution.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900">
                <p className="text-xs text-muted-foreground">Total Programs</p>
                <p className="font-semibold mt-0.5">{programs.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900">
                <p className="text-xs text-muted-foreground">Coverage</p>
                <p className="font-semibold mt-0.5">Nutrition, Policy, Digital, Governance</p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900">
                <p className="text-xs text-muted-foreground">Execution Focus</p>
                <p className="font-semibold mt-0.5">Practical Implementation + Metrics</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {programs.map((program) => (
              <Link
                key={program.slug}
                href={`/programs/${program.slug}`}
                className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className={`h-1.5 w-full rounded-full mb-4 bg-gradient-to-r ${PROGRAM_TONES[program.slug] || "from-primary to-primary"}`} />

                <div className="flex items-start justify-between gap-3">
                  <div className="text-2xl">{program.icon}</div>
                  <span className="inline-flex items-center gap-1 text-[11px] rounded-full px-2 py-0.5 border border-slate-200 dark:border-slate-700 text-muted-foreground">
                    <ShieldCheck className="w-3 h-3" />
                    Active
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-3">{program.title}</h2>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{program.shortDescription}</p>

                <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2 border border-slate-200 dark:border-slate-700">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Nodal Body</p>
                  <p className="text-xs font-medium mt-0.5">{program.ministry}</p>
                </div>

                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Open Detailed Module
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex items-center gap-3">
            <div className="rounded-lg p-2 bg-primary/10 text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="text-sm text-muted-foreground">
              Each module includes eligibility, implementation checklist, required data, and measurable KPIs for field execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

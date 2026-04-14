import { toBackendUrl } from "@/lib/config";

export type GovernmentProgram = {
  slug: string;
  icon: string;
  title: string;
  shortDescription: string;
  ministry: string;
  practicalUse: string;
  eligibility: string[];
  implementationChecklist: string[];
  requiredData: string[];
  keyMetrics: string[];
  officialLinks: Array<{ label: string; url: string }>;
};

export const GOVERNMENT_PROGRAMS: GovernmentProgram[] = [
  {
    slug: "mid-day-meal-scheme",
    icon: "🍽️",
    title: "Mid-Day Meal Scheme",
    shortDescription: "Nutrition support for all enrolled students.",
    ministry: "Ministry of Education and Department of School Education & Literacy",
    practicalUse:
      "Use this module to track meal-day attendance consistency, identify low-turnout days, and trigger school-level nutrition compliance checks.",
    eligibility: [
      "All children in classes I to VIII in government and government-aided schools",
      "Schools mapped under approved district meal implementation units",
      "Students with active school enrollment records",
    ],
    implementationChecklist: [
      "Confirm enrolled student base per school",
      "Track daily attendance and compare with meal uptake records",
      "Flag schools with persistent mismatch between attendance and meal numbers",
      "Run monthly compliance review and escalation report",
    ],
    requiredData: [
      "School-wise enrolled students",
      "Daily attendance records",
      "Meal distribution count",
      "Date-wise compliance status",
    ],
    keyMetrics: [
      "Attendance-to-meal coverage ratio",
      "School compliance percentage",
      "High-risk schools with repeated mismatch",
      "Monthly district nutrition attendance trend",
    ],
    officialLinks: [
      { label: "PM POSHAN Overview", url: "https://pmposhan.education.gov.in/" },
      { label: "MoE School Education", url: "https://www.education.gov.in/" },
    ],
  },
  {
    slug: "national-education-policy-2020",
    icon: "📚",
    title: "National Education Policy 2020",
    shortDescription: "Implementation of NEP 2020 guidelines.",
    ministry: "Ministry of Education",
    practicalUse:
      "Map attendance stability, retention patterns, and school participation metrics to NEP-aligned quality and access improvement goals.",
    eligibility: [
      "All schools implementing NEP 2020 aligned reforms",
      "State and district education authorities running transformation programs",
      "Institutions tracking foundational and secondary progression",
    ],
    implementationChecklist: [
      "Define NEP-linked attendance quality benchmarks",
      "Monitor grade-transition and attendance continuity",
      "Track school-level intervention impact quarterly",
      "Publish district-level NEP compliance dashboard",
    ],
    requiredData: [
      "Grade-wise attendance trend",
      "Transition and retention records",
      "Intervention execution logs",
      "District and school performance snapshots",
    ],
    keyMetrics: [
      "Average attendance by grade band",
      "Retention trend index",
      "Intervention impact score",
      "District-level implementation coverage",
    ],
    officialLinks: [
      { label: "NEP 2020 Document", url: "https://www.education.gov.in/nep/about-nep" },
      { label: "Ministry of Education", url: "https://www.education.gov.in/" },
    ],
  },
  {
    slug: "pm-shri-scheme",
    icon: "🏫",
    title: "PM Shri Scheme",
    shortDescription: "Pradhan Mantri Schools for Rising India.",
    ministry: "Ministry of Education",
    practicalUse:
      "Use attendance and infrastructure-linked school performance to identify PM SHRI model school readiness and monitor outcomes.",
    eligibility: [
      "Schools shortlisted by state and union territory PM SHRI criteria",
      "Institutions meeting baseline performance and infrastructure standards",
      "Schools willing to adopt model school practices",
    ],
    implementationChecklist: [
      "Validate school baseline metrics",
      "Measure attendance consistency before and after intervention",
      "Track teacher and student engagement signals",
      "Publish school-level model readiness report",
    ],
    requiredData: [
      "School attendance and engagement data",
      "Infrastructure readiness indicators",
      "Teacher participation records",
      "Outcome comparison baseline vs current",
    ],
    keyMetrics: [
      "Model school readiness score",
      "Attendance improvement delta",
      "Teacher participation rate",
      "Student engagement trend",
    ],
    officialLinks: [
      { label: "PM SHRI Portal", url: "https://pmshrischools.education.gov.in/" },
      { label: "Scheme Information", url: "https://www.education.gov.in/" },
    ],
  },
  {
    slug: "diksha-platform",
    icon: "💻",
    title: "DIKSHA Platform",
    shortDescription: "Digital Infrastructure for Knowledge Sharing.",
    ministry: "Ministry of Education and NCERT",
    practicalUse:
      "Correlate attendance consistency with digital learning adoption by tracking DIKSHA usage periods and participation behavior.",
    eligibility: [
      "Teachers and students with DIKSHA access",
      "Schools running blended-learning workflows",
      "Districts with digital content integration targets",
    ],
    implementationChecklist: [
      "Map schools to DIKSHA-enabled cohorts",
      "Track attendance trend during DIKSHA usage windows",
      "Identify low-adoption and low-attendance overlap",
      "Launch targeted teacher enablement actions",
    ],
    requiredData: [
      "School and class attendance records",
      "DIKSHA usage events and sessions",
      "Teacher enablement status",
      "Digital content participation indicators",
    ],
    keyMetrics: [
      "Digital adoption coverage",
      "Attendance uplift in DIKSHA-active schools",
      "Teacher enablement completion",
      "Low-adoption risk index",
    ],
    officialLinks: [
      { label: "DIKSHA", url: "https://diksha.gov.in/" },
      { label: "NCERT", url: "https://ncert.nic.in/" },
    ],
  },
  {
    slug: "samagra-portal",
    icon: "📊",
    title: "SAMAGRA Portal",
    shortDescription: "Student and academic management integration.",
    ministry: "State and District School Education Departments",
    practicalUse:
      "Use SAMAGRA-aligned student lifecycle records for identity continuity, migration tracking, and attendance compliance monitoring.",
    eligibility: [
      "Schools onboarded to state student information systems",
      "District authorities using unified student IDs",
      "Institutions maintaining longitudinal student records",
    ],
    implementationChecklist: [
      "Ensure student ID mapping with attendance records",
      "Monitor migration and transfer continuity",
      "Detect duplicate or broken student identities",
      "Generate monthly data-quality and compliance reports",
    ],
    requiredData: [
      "Student master records",
      "Attendance logs tied to student ID",
      "Transfer and migration events",
      "Data quality validation outcomes",
    ],
    keyMetrics: [
      "Student identity match rate",
      "Transfer continuity score",
      "Data quality error rate",
      "Attendance compliance by student segment",
    ],
    officialLinks: [
      { label: "Samagra Shiksha", url: "https://samagra.education.gov.in/" },
      { label: "School Education", url: "https://www.education.gov.in/" },
    ],
  },
  {
    slug: "e-pathshala-resources",
    icon: "🎓",
    title: "e-Pathshala Resources",
    shortDescription: "Digital learning content access for schools.",
    ministry: "NCERT",
    practicalUse:
      "Track engagement with e-Pathshala resources alongside attendance patterns to identify content-impact opportunities and support gaps.",
    eligibility: [
      "Schools and learners with digital resource access",
      "Teachers using NCERT digital content in class planning",
      "District-level blended-learning initiatives",
    ],
    implementationChecklist: [
      "Map content usage by grade and school",
      "Compare usage periods with attendance trend",
      "Identify grades requiring additional content support",
      "Publish quarterly content-impact review",
    ],
    requiredData: [
      "School-wise attendance data",
      "Resource usage frequency",
      "Grade-wise digital access indicators",
      "Teacher content integration logs",
    ],
    keyMetrics: [
      "Resource usage coverage",
      "Attendance trend during high usage periods",
      "Grade-level content gap index",
      "Teacher digital integration ratio",
    ],
    officialLinks: [
      { label: "e-Pathshala", url: "https://epathshala.nic.in/" },
      { label: "NCERT Digital", url: "https://ncert.nic.in/" },
    ],
  },
];

export const GOVERNMENT_PROGRAMS_BY_SLUG = Object.fromEntries(
  GOVERNMENT_PROGRAMS.map((program) => [program.slug, program])
) as Record<string, GovernmentProgram>;

function isProgramLike(value: unknown): value is GovernmentProgram {
  const item = value as GovernmentProgram;
  return Boolean(item && item.slug && item.title && item.shortDescription);
}

export async function fetchGovernmentPrograms(): Promise<GovernmentProgram[]> {
  try {
    const response = await fetch(toBackendUrl("/api/programs"), { cache: "no-store" });
    if (!response.ok) return GOVERNMENT_PROGRAMS;
    const data = await response.json();
    if (!Array.isArray(data)) return GOVERNMENT_PROGRAMS;
    const normalized = data.filter(isProgramLike) as GovernmentProgram[];
    return normalized.length > 0 ? normalized : GOVERNMENT_PROGRAMS;
  } catch {
    return GOVERNMENT_PROGRAMS;
  }
}

export async function fetchGovernmentProgramBySlug(slug: string): Promise<GovernmentProgram | null> {
  try {
    const response = await fetch(toBackendUrl(`/api/programs/${slug}`), { cache: "no-store" });
    if (!response.ok) {
      return GOVERNMENT_PROGRAMS_BY_SLUG[slug] || null;
    }
    const data = await response.json();
    if (isProgramLike(data)) return data;
    return GOVERNMENT_PROGRAMS_BY_SLUG[slug] || null;
  } catch {
    return GOVERNMENT_PROGRAMS_BY_SLUG[slug] || null;
  }
}

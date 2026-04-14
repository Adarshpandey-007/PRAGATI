"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { getBackendUrl } from "@/lib/config";
import { clearAuthSession, getAuthSession, UserRole } from "@/lib/auth-storage";
import type { GovernmentProgram } from "@/lib/government-programs";
import { useLanguage } from "@/app/context/LanguageContext";

type ProgramFormState = {
  slug: string;
  icon: string;
  title: string;
  shortDescription: string;
  ministry: string;
  practicalUse: string;
  eligibilityText: string;
  implementationChecklistText: string;
  requiredDataText: string;
  keyMetricsText: string;
  officialLinksText: string;
};

type Props = {
  allowedRoles: UserRole[];
  loginPath: string;
  dashboardPath: string;
  heading: string;
  subheading: string;
  showPlatformHeader?: boolean;
  navLinks?: Array<{ label: string; href: string }>;
  platformTagline?: string;
};

const backendUrl = getBackendUrl();

const EMPTY_FORM: ProgramFormState = {
  slug: "",
  icon: "📘",
  title: "",
  shortDescription: "",
  ministry: "",
  practicalUse: "",
  eligibilityText: "",
  implementationChecklistText: "",
  requiredDataText: "",
  keyMetricsText: "",
  officialLinksText: "",
};

function listToText(list: string[]): string {
  return list.join("\n");
}

function linksToText(links: Array<{ label: string; url: string }>): string {
  return links.map((link) => `${link.label} | ${link.url}`).join("\n");
}

function textToList(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function textToLinks(text: string): Array<{ label: string; url: string }> {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.split("|").map((part) => part.trim());
      return { label: label || "Official Link", url: url || "" };
    })
    .filter((item) => item.url);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toForm(program: GovernmentProgram): ProgramFormState {
  return {
    slug: program.slug,
    icon: program.icon || "📘",
    title: program.title,
    shortDescription: program.shortDescription,
    ministry: program.ministry,
    practicalUse: program.practicalUse,
    eligibilityText: listToText(program.eligibility),
    implementationChecklistText: listToText(program.implementationChecklist),
    requiredDataText: listToText(program.requiredData),
    keyMetricsText: listToText(program.keyMetrics),
    officialLinksText: linksToText(program.officialLinks),
  };
}

function toPayload(form: ProgramFormState): GovernmentProgram {
  return {
    slug: form.slug.trim(),
    icon: form.icon.trim() || "📘",
    title: form.title.trim(),
    shortDescription: form.shortDescription.trim(),
    ministry: form.ministry.trim(),
    practicalUse: form.practicalUse.trim(),
    eligibility: textToList(form.eligibilityText),
    implementationChecklist: textToList(form.implementationChecklistText),
    requiredData: textToList(form.requiredDataText),
    keyMetrics: textToList(form.keyMetricsText),
    officialLinks: textToLinks(form.officialLinksText),
  };
}

export default function ProgramsManagement({
  allowedRoles,
  loginPath,
  dashboardPath,
  heading,
  subheading,
  showPlatformHeader = false,
  navLinks = [],
  platformTagline = "Built for SIH 2026 • MoE & Govt. of Punjab • PRAGATI Portal",
}: Props) {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [programs, setPrograms] = useState<GovernmentProgram[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProgramFormState>(EMPTY_FORM);

  const token = useMemo(() => getAuthSession()?.token || "", []);

  const authHeaders = () => ({
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  });

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/programs`, {
        headers: token ? authHeaders() : { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }
      const data = await response.json();
      setPrograms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getAuthSession();
    if (!session || !allowedRoles.includes(session.role)) {
      router.push(loginPath);
      return;
    }
    fetchPrograms();
  }, [allowedRoles, loginPath, router]);

  const startCreate = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const startEdit = (program: GovernmentProgram) => {
    setEditingSlug(program.slug);
    setForm(toForm(program));
    setError(null);
  };

  const handleDelete = async (program: GovernmentProgram) => {
    if (!window.confirm(`Delete ${program.title}?`)) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/programs/${program.slug}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.message || "Failed to delete program");
      }
      if (editingSlug === program.slug) {
        startCreate();
      }
      await fetchPrograms();
    } catch (err: any) {
      setError(err.message || "Failed to delete program");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const effectiveSlug = form.slug.trim() || slugify(form.title);
    const payload = toPayload({ ...form, slug: effectiveSlug });

    try {
      const response = await fetch(`${backendUrl}/api/programs${editingSlug ? `/${editingSlug}` : ""}`, {
        method: editingSlug ? "PATCH" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(body.message || "Failed to save program");
      }
      setEditingSlug(null);
      setForm(EMPTY_FORM);
      await fetchPrograms();
    } catch (err: any) {
      setError(err.message || "Failed to save program");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    router.push(loginPath);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
      {showPlatformHeader && (
        <>
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 text-xs sm:text-sm shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-bold">
                  IN
                </div>
                <span className="font-semibold hidden sm:inline">GOVERNMENT OF INDIA</span>
                <span className="font-semibold sm:hidden">GOI</span>
              </div>
              <span className="text-[10px] sm:text-xs font-medium">{platformTagline}</span>
            </div>
          </div>

          <header className="fixed top-10 sm:top-12 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => router.push(dashboardPath)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  Back to Home
                </button>
                <div className="hidden md:flex items-center gap-2">
                  {navLinks.map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => router.push(item.href)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 px-1 py-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded-full transition ${
                    language === "en"
                      ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white font-medium"
                      : "text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-2 py-0.5 rounded-full transition ${
                    language === "hi"
                      ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white font-medium"
                      : "text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Hindi
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("pa")}
                  className={`px-2 py-0.5 rounded-full transition ${
                    language === "pa"
                      ? "bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white font-medium"
                      : "text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Punjabi
                </button>
              </div>
            </div>
          </header>
        </>
      )}

      <div className={`max-w-7xl mx-auto space-y-5 ${showPlatformHeader ? "pt-28 sm:pt-32" : ""}`}>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-900/80 p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide font-semibold text-primary">Program Governance</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">{heading}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subheading}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push(dashboardPath)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm"
            >
              Back to Dashboard
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Existing Programs</h2>
              <button
                type="button"
                onClick={startCreate}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                New
              </button>
            </div>

            <div className="space-y-2 max-h-[65vh] overflow-auto pr-1">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading programs...</p>
              ) : programs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No programs found.</p>
              ) : (
                programs.map((program) => (
                  <div key={program.slug} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{program.icon} {program.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">/{program.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(program)}
                          className="p-1.5 rounded border border-slate-200 dark:border-slate-700"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(program)}
                          disabled={saving}
                          className="p-1.5 rounded border border-red-200 dark:border-red-900/40 text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{editingSlug ? "Edit Program" : "Create Program"}</h2>
              {editingSlug && (
                <button
                  type="button"
                  onClick={startCreate}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Program title"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                required
              />
              <input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                placeholder="slug (auto if left blank)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
              <input
                value={form.icon}
                onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder="Icon (emoji)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
              <input
                value={form.ministry}
                onChange={(e) => setForm((prev) => ({ ...prev, ministry: e.target.value }))}
                placeholder="Nodal ministry"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                required
              />
            </div>

            <textarea
              value={form.shortDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="Short description"
              rows={2}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              required
            />

            <textarea
              value={form.practicalUse}
              onChange={(e) => setForm((prev) => ({ ...prev, practicalUse: e.target.value }))}
              placeholder="Practical use"
              rows={3}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              required
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <textarea
                value={form.eligibilityText}
                onChange={(e) => setForm((prev) => ({ ...prev, eligibilityText: e.target.value }))}
                placeholder="Eligibility (one line per item)"
                rows={6}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
              <textarea
                value={form.implementationChecklistText}
                onChange={(e) => setForm((prev) => ({ ...prev, implementationChecklistText: e.target.value }))}
                placeholder="Implementation checklist (one line per item)"
                rows={6}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
              <textarea
                value={form.requiredDataText}
                onChange={(e) => setForm((prev) => ({ ...prev, requiredDataText: e.target.value }))}
                placeholder="Required data (one line per item)"
                rows={6}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
              <textarea
                value={form.keyMetricsText}
                onChange={(e) => setForm((prev) => ({ ...prev, keyMetricsText: e.target.value }))}
                placeholder="Key metrics (one line per item)"
                rows={6}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              />
            </div>

            <textarea
              value={form.officialLinksText}
              onChange={(e) => setForm((prev) => ({ ...prev, officialLinksText: e.target.value }))}
              placeholder="Official links (one per line: Label | https://example.com)"
              rows={4}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-70"
              >
                {editingSlug ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {saving ? "Saving..." : editingSlug ? "Save Changes" : "Create Program"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

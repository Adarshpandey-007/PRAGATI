"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Building2, Mail, Phone, ShieldCheck, User, CheckCircle2 } from "lucide-react";

export default function ApplyForApiPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950">
      {/* Government Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 text-xs sm:text-sm shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-semibold">🇮🇳</div>
            <span className="font-semibold tracking-wide">GOVERNMENT OF INDIA</span>
          </div>
          <Link
            href="/get-api"
            className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition text-xs font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to APIs
          </Link>
        </div>
      </div>

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-full px-4 py-1.5 mb-3 text-[11px] font-semibold text-primary uppercase tracking-wide">
              <ShieldCheck className="w-3 h-3" />
              API Access Request
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Apply for Pragati API Token
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Individuals, Schools, Corporates and Government Organizations can request secure access to
              Pragati APIs for Mid-Day Meal schemes, school integrations and research initiatives.
            </p>
          </div>

          {/* Info banner */}
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/15 px-4 py-3 text-xs sm:text-sm text-primary/90 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">Compliance & Data Protection</span>
            </div>
            <p className="text-[11px] sm:text-xs text-primary/90">
              All applications are reviewed by the Pragati team. Approved partners receive environment-specific
              API tokens and documentation. Data usage must comply with Government of India guidelines for
              Mid-Day Meal and Education programmes.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 sm:p-6 space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Applicant Type</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/70 px-3 py-2 cursor-pointer">
                    <input type="radio" name="applicantType" value="Individual" className="h-3 w-3" defaultChecked />
                    <span>Individual / Researcher</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/70 px-3 py-2 cursor-pointer">
                    <input type="radio" name="applicantType" value="School" className="h-3 w-3" />
                    <span>School / Institution</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/70 px-3 py-2 cursor-pointer col-span-2">
                    <input type="radio" name="applicantType" value="Corporate" className="h-3 w-3" />
                    <span>Corporate / NGO / Startup</span>
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/70 px-3 py-2 cursor-pointer col-span-2">
                    <input type="radio" name="applicantType" value="Government" className="h-3 w-3" />
                    <span>Government Department / PSU</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Primary Scheme / Usage</label>
                <select
                  name="scheme"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  defaultValue="Mid-Day Meal"
                >
                  <option>Mid-Day Meal Monitoring</option>
                  <option>School Attendance &amp; Learning Outcomes</option>
                  <option>CSR / Corporate Partnership</option>
                  <option>Research / Analytics</option>
                  <option>Other Government Scheme</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Organization / School Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <input
                    name="organization"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. Government High School, Bengaluru"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Official Email ID</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="name@organization.gov.in"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Contact Person</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    name="contactPerson"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Full name"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. +91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Proposed Use of Pragati APIs</label>
              <textarea
                name="useCase"
                required
                rows={4}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Describe how you plan to use Pragati APIs for Mid-Day Meal or other education programmes."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Preferred Environment</label>
                <select
                  name="environment"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  defaultValue="Sandbox"
                >
                  <option>Sandbox (recommended for testing)</option>
                  <option>Production (live schools / beneficiaries)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-200">Expected Daily API Calls</label>
                <select
                  name="volume"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-800 px-3 py-2 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  defaultValue="0-10k"
                >
                  <option>0 - 10,000</option>
                  <option>10,000 - 50,000</option>
                  <option>50,000 - 1,00,000</option>
                  <option>Above 1,00,000</option>
                </select>
              </div>
            </div>

            <div className="flex items-start gap-2 text-[11px] sm:text-xs text-muted-foreground">
              <input type="checkbox" name="terms" required className="mt-0.5 h-3 w-3" />
              <p>
                I confirm that the information provided is accurate and that our usage of Pragati APIs will comply
                with applicable data protection, student privacy and Government of India guidelines.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Link
                href="/get-api"
                className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to API Documentation
              </Link>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-primary/90 transition"
              >
                Submit Application
              </button>
            </div>

            {submitted && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] sm:text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 mt-0.5" />
                <p>
                  Thank you for your interest in Pragati APIs. Your request has been recorded. Our team will
                  contact you on the provided email with next steps and token details.
                </p>
              </div>
            )}
          </form>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 py-6 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[11px] text-muted-foreground">
            &copy; 2025 Pragati - Government of India. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export function ApkQRCode({ apkUrl, size = 120 }: { apkUrl: string; size?: number }) {
  // Build full URL for QR code so it works when scanned externally
  const fullUrl = typeof window !== "undefined" 
    ? `${window.location.origin}${apkUrl}` 
    : apkUrl;

  const downloadName = apkUrl.includes("student") ? "pragati-student-app.apk" : "pragati-teacher-app.apk";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
        <QRCodeCanvas value={fullUrl} size={size} />
      </div>
      <a
        href={apkUrl}
        download={downloadName}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download App
      </a>
    </div>
  );
}

"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-slate-100 p-6">
          <WifiOff className="h-12 w-12 text-slate-400" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          You&apos;re Offline
        </h1>
        <p className="max-w-sm text-sm text-slate-500">
          No internet connection detected. Your data is saved locally and will
          sync automatically when you&apos;re back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

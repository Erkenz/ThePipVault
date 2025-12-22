"use client";

import { Loader2 } from "lucide-react";

export const LoadingCard = ({ title }: { title?: string }) => {
  return (
    <div className="bg-pip-card border border-pip-border rounded-xl p-6 h-full flex flex-col items-center justify-center min-h-50 animate-pulse">
      <Loader2 className="text-pip-gold animate-spin mb-2" size={32} />
      <p className="text-pip-muted text-sm font-medium uppercase tracking-widest">
        {title ? `Loading ${title}...` : "Loading Data..."}
      </p>
    </div>
  );
};
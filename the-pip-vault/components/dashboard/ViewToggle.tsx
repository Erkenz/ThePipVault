"use client";

import { useSettings } from "@/context/SettingsContext";
import { DollarSign, BarChart2, Percent } from "lucide-react";

export default function ViewToggle() {
    const { viewMode, setViewMode } = useSettings();

    return (
        <div className="flex items-center bg-pip-dark border border-pip-border rounded-full p-1">
            <button
                onClick={() => setViewMode('pips')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'pips'
                    ? 'bg-pip-gold text-pip-dark shadow-sm'
                    : 'text-pip-muted hover:text-white'
                    }`}
            >
                <BarChart2 size={14} />
                PIPS
            </button>
            <button
                onClick={() => setViewMode('currency')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'currency'
                    ? 'bg-pip-green text-white shadow-sm'
                    : 'text-pip-muted hover:text-white'
                    }`}
            >
                <DollarSign size={14} />
                PNL
            </button>
            <button
                onClick={() => setViewMode('percentage')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'percentage'
                    ? 'bg-pip-text text-pip-dark bg-white shadow-sm'
                    : 'text-pip-muted hover:text-white'
                    }`}
            >
                <Percent size={14} />
                <span className="sr-only sm:not-sr-only">%</span>
            </button>
        </div>
    );
}

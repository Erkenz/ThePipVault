"use client";

import { useSettings } from "@/context/SettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { DollarSign, BarChart2, Percent } from "lucide-react";

export default function ViewToggle() {
    const { viewMode, setViewMode } = useSettings();

    return (
        <div className="flex items-center bg-pip-dark border border-pip-border rounded-full p-1">
            <button
                onClick={() => setViewMode('pips')}
                className={`flex items-center justify-center gap-2 w-8 h-8 rounded-full text-xs font-bold transition-all ${viewMode === 'pips'
                    ? 'bg-pip-gold text-pip-dark shadow-sm'
                    : 'text-pip-muted hover:text-white'
                    }`}
                title="Pips/Points"
            >
                <BarChart2 size={16} />
            </button>
            <button
                onClick={() => setViewMode('currency')}
                className={`flex items-center justify-center gap-2 w-8 h-8 rounded-full text-xs font-bold transition-all ${viewMode === 'currency'
                    ? 'bg-pip-green text-white shadow-sm'
                    : 'text-pip-muted hover:text-white'
                    }`}
                title="PnL ($)"
            >
                <DollarSign size={16} />
            </button>
            <button
                onClick={() => setViewMode('percentage')}
                className={`flex items-center justify-center gap-2 w-8 h-8 rounded-full text-xs font-bold transition-all ${viewMode === 'percentage'
                    ? 'bg-pip-text text-pip-dark bg-white shadow-sm'
                    : 'text-pip-muted hover:text-white'
                    }`}
                title="Percentage"
            >
                <Percent size={16} />
            </button>
        </div>
    );
}

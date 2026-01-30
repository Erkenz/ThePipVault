"use client";

import { useState } from 'react';
import { Plus, BookOpen, Filter } from 'lucide-react';
import TradeList from '../../components/journal/TradeList';
import AddTradeModal from '../../components/modals/AddTradeModal';
import { cn } from "@/lib/utils";

export default function JournalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground flex items-center gap-3">
            Trade Journal
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Detailed ledger of your trading activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Placeholder Filter Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-border/50 rounded-xl text-sm font-semibold hover:bg-muted/50 transition-colors bg-card/30 backdrop-blur-sm">
            <Filter size={16} />
            <span>Filter</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>New Trade</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative min-h-[500px]">
        <TradeList />
      </div>

      {/* Modal */}
      <AddTradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
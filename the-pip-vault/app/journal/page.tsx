"use client";

import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import TradeList from '../../components/journal/TradeList';
import AddTradeModal from '../../components/modals/AddTradeModal';

export default function JournalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Header section - Matcht met je Dashboard styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-pip-text flex items-center gap-3">
            <BookOpen className="text-pip-gold" size={32} />
            Journal
          </h1>
          <p className="text-pip-muted text-sm mt-1">
            Review and manage your trading performance.
          </p>
        </div>

        {/* Action Button - In jouw Gold/Dark style */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-pip-gold/10"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>New Trade</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className=" rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Hier wordt je TradeList geladen. Zorg dat TradeList ook de 'pip-' classes gebruikt voor tabelstyling */}
        <TradeList />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddTradeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
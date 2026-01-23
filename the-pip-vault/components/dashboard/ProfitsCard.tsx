import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProfitCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  valueColor?: string;
}

const ProfitCard = ({ title, value, subValue, icon: Icon, trend, valueColor }: ProfitCardProps) => {
  return (
    <div className="bg-pip-card border border-pip-border p-6 rounded-xl shadow-sm hover:border-pip-gold/30 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-pip-muted text-xs font-semibold uppercase tracking-wider">
            {title}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${valueColor ? valueColor : 'text-pip-text'}`}>
              {value}
            </span>
            {subValue && (
              <span className="text-xs text-pip-muted">
                {subValue}
              </span>
            )}
          </div>
        </div>

        <div className={`p-3 rounded-lg bg-pip-dark border border-pip-border 
          ${trend === 'up' ? 'text-pip-green' : trend === 'down' ? 'text-pip-red' : 'text-pip-gold'}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

export default ProfitCard;
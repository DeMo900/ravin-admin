import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  count: number | null;
  loading: boolean;
  icon: LucideIcon;
  description: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  loading,
  icon: Icon,
  description,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-card border border-neutral-dark rounded-lg p-5 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-neutral hover:bg-surface-hover' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-montserrat uppercase font-semibold text-neutral tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-md bg-secondary border border-neutral-dark flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
      </div>

      <div>
        <div className="text-3xl font-montserrat font-bold text-white mb-1">
          {loading ? (
            <span className="text-neutral text-xl font-normal">Loading...</span>
          ) : (
            count ?? 0
          )}
        </div>
        <p className="text-xs text-neutral-light">{description}</p>
      </div>
    </div>
  );
};

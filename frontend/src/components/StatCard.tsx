import { type ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  className?: string;
}

const StatCard = ({ icon, value, label, className = "" }: StatCardProps) => (
  <div
    className={`bg-base-200 rounded-2xl border border-base-300 p-3 sm:p-4 lg:p-6 flex flex-col items-start shadow-xl shadow-base-300 min-h-[100px] sm:min-h-[120px] ${className}`}
  >
    <span className="text-lg sm:text-xl lg:text-2xl mb-2 flex items-center w-full">
      <span className="inline-block mr-2 text-base sm:text-lg lg:text-xl">{icon}</span>
      <span className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{value}</span>
    </span>
    <span className="text-neutral-500 text-xs sm:text-sm text-left">{label}</span>
  </div>
);

export default StatCard;

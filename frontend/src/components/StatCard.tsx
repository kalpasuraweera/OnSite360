import { type ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  className?: string;
}

const StatCard = ({ icon, value, label, className = "" }: StatCardProps) => (
  <div
    className={`bg-base-200 rounded-2xl border border-base-300 p-6 flex flex-col items-start shadow-xl shadow-base-300 ${className}`}
  >
    <span className="text-2xl mb-2">
      <span className="inline-block mr-2">{icon}</span>
      <span className="text-2xl font-bold">{value}</span>
    </span>
    <span className="text-neutral-500 text-sm">{label}</span>
  </div>
);

export default StatCard;

import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  helper?: string;
  trend?: {
    value: string;
    label: string;
    positive?: boolean;
  };
  icon?: ReactNode;
}

export function StatCard({ title, value, helper, trend, icon }: StatCardProps) {
  const hasIcon = Boolean(icon);

  return (
    <div className="app-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          {title}
        </p>
        {hasIcon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            {icon}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-semibold text-slate-900">{value}</p>
        {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
      </div>
      {trend && (
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
            trend.positive ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          <span>{trend.value}</span>
          <span className="text-slate-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

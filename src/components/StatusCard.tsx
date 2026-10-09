import type { ReactNode } from "react";

interface StatusCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isWarning?: boolean;
}

export function StatusCard({ title, icon, children, isWarning }: StatusCardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${
        isWarning ? "border-red-200" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-600">{title}</h3>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isWarning ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

import { LayoutDashboard, Gauge, History, Bell, Sprout } from "lucide-react";
import type { View } from "@/types";

const NAV_ITEMS: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "sensors", label: "Sensors", icon: Gauge },
  { id: "history", label: "History", icon: History },
  { id: "alerts", label: "Alerts", icon: Bell },
];

interface SidebarProps {
  current: View;
  onNavigate: (view: View) => void;
  alertCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ current, onNavigate, alertCount, mobileOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onCloseMobile} />}

      <aside
        className={`fixed z-40 flex h-full w-64 flex-col bg-emerald-900 text-emerald-50 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-emerald-800 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
            <Sprout className="h-6 w-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">InHouse Farming</h1>
            <p className="text-xs text-emerald-300/80">Monitoring System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/20 text-emerald-200"
                    : "text-emerald-300 hover:bg-emerald-800/50 hover:text-emerald-100"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.id === "alerts" && alertCount > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-emerald-800 px-6 py-4">
          <p className="text-xs text-emerald-400/70">Arduino USB Serial</p>
          <p className="text-xs text-emerald-400/70">9600 baud &middot; Web Serial API</p>
        </div>
      </aside>
    </>
  );
}

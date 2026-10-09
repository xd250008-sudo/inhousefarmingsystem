import { Menu, Usb, Plug, PlugZap } from "lucide-react";
import type { ConnectionStatus } from "@/types";

interface ConnectionBarProps {
  status: ConnectionStatus;
  supported: boolean;
  errorMsg: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onToggleMobileNav: () => void;
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; dot: string }> = {
  disconnected: { label: "Disconnected", color: "text-gray-500", dot: "bg-gray-400" },
  connecting: { label: "Connecting…", color: "text-amber-600", dot: "bg-amber-400 animate-pulse" },
  connected: { label: "Connected", color: "text-emerald-600", dot: "bg-emerald-500" },
  error: { label: "Error", color: "text-red-600", dot: "bg-red-500" },
};

export function ConnectionBar({
  status,
  supported,
  errorMsg,
  onConnect,
  onDisconnect,
  onToggleMobileNav,
}: ConnectionBarProps) {
  const cfg = STATUS_CONFIG[status];
  const isConnected = status === "connected";

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={onToggleMobileNav}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Usb className="h-5 w-5 text-emerald-600" />
          <span className="text-sm font-semibold text-gray-700">Arduino Connection</span>
        </div>

        <div className="ml-2 flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
          <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>

        {!supported && (
          <span className="hidden text-xs text-amber-600 sm:inline">
            Web Serial requires Chrome or Edge
          </span>
        )}

        {errorMsg && <span className="hidden text-xs text-red-500 sm:inline">{errorMsg}</span>}

        <div className="ml-auto flex gap-2">
          {!isConnected ? (
            <button
              onClick={onConnect}
              disabled={!supported || status === "connecting"}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlugZap className="h-4 w-4" />
              Connect Arduino
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-600"
            >
              <Plug className="h-4 w-4" />
              Disconnect
            </button>
          )}
        </div>
      </div>
      {errorMsg && (
        <div className="border-t border-red-100 bg-red-50 px-4 py-2 sm:px-6">
          <p className="text-xs text-red-600">{errorMsg}</p>
        </div>
      )}
    </header>
  );
}

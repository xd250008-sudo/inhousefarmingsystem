import type { SensorReading } from "@/types";

interface LineChartProps {
  readings: SensorReading[];
  dataKey: "soil_moisture_pct" | "water_level_pct";
  label: string;
  unit: string;
  color: string;
}

const WIDTH = 760;
const HEIGHT = 240;
const PADDING = { top: 20, right: 20, bottom: 36, left: 44 };

export function LineChart({ readings, dataKey, label, unit, color }: LineChartProps) {
  const data = [...readings].reverse(); // chronological order
  const values = data.map((r) => r[dataKey]);
  const maxVal = Math.max(100, ...values, 1);
  const chartW = WIDTH - PADDING.left - PADDING.right;
  const chartH = HEIGHT - PADDING.top - PADDING.bottom;

  const points = data.map((r, i) => {
    const x = data.length > 1 ? PADDING.left + (i / (data.length - 1)) * chartW : PADDING.left + chartW / 2;
    const y = PADDING.top + chartH - (r[dataKey] / maxVal) * chartH;
    return { x, y, value: r[dataKey] };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = points.length > 0
    ? `M ${points[0].x.toFixed(1)} ${(PADDING.top + chartH).toFixed(1)} ` +
      points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
      ` L ${points[points.length - 1].x.toFixed(1)} ${(PADDING.top + chartH).toFixed(1)} Z`
    : "";

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">
        {label} <span className="text-gray-400">({unit})</span>
      </h3>
      {data.length === 0 ? (
        <div className="flex h-[240px] items-center justify-center text-sm text-gray-400">
          No history data yet. Connect your Arduino and readings will appear here.
        </div>
      ) : (
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridLines.map((g) => {
            const y = PADDING.top + chartH - (g / maxVal) * chartH;
            return (
              <g key={g}>
                <line x1={PADDING.left} y1={y} x2={WIDTH - PADDING.right} y2={y} stroke="#f0fdf4" strokeWidth="1" />
                <text x={PADDING.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">
                  {g}
                </text>
              </g>
            );
          })}

          {data.length > 1 && <path d={areaD} fill={`url(#grad-${dataKey})`} />}
          {data.length > 0 && (
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          )}

          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
          ))}

          {data.length > 0 && (
            <>
              <text x={PADDING.left} y={HEIGHT - 8} fontSize="11" fill="#9ca3af">
                {new Date(data[0].recorded_at).toLocaleTimeString()}
              </text>
              <text x={WIDTH - PADDING.right} y={HEIGHT - 8} fontSize="11" fill="#9ca3af" textAnchor="end">
                {new Date(data[data.length - 1].recorded_at).toLocaleTimeString()}
              </text>
            </>
          )}
        </svg>
      )}
    </div>
  );
}

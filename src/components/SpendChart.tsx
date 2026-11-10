import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

export interface SpendChartPoint {
  day: string;
  actualSpend: number | null;
  projectedSpend: number;
  budgetLimit: number;
}

interface SpendChartProps {
  data: SpendChartPoint[];
  budget: number;
}

/**
 * Monthly spend trajectory chart. Lives in its own module so the heavy
 * recharts library (~360 kB) is NOT part of the Dashboard page chunk:
 * DashboardPage lazy-loads this component, so the page shell (metrics,
 * provider breakdown, logs) renders first and the chart follows once its
 * chunk arrives. Rendered output is identical to before.
 */
export const SpendChart: React.FC<SpendChartProps> = ({ data, budget }) => {
  return (
    <div className="mt-6 h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="day" stroke="#71717a" fontSize={10} tickLine={false} />
          <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={(val) => `$${val}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              borderColor: "#3f3f46",
              borderRadius: "0.75rem",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          />
          <ReferenceLine
            y={budget}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            label={{ value: `Limit $${budget}`, fill: "#f43f5e", fontSize: 10, position: "top" }}
          />
          <Area
            type="monotone"
            dataKey="actualSpend"
            name="Actual Spend"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#actualGradient)"
          />
          <Area
            type="monotone"
            dataKey="projectedSpend"
            name="Projected Spend"
            stroke="#8b5cf6"
            strokeDasharray="4 4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#projectedGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

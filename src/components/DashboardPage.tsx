import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  PlusCircle,
  Clock,
  Filter,
  ArrowUpRight,
  TrendingDown,
  Database,
  ExternalLink,
} from "lucide-react";
import { UsageRecord } from "../types";
import {
  getUsageLogs,
  getMonthlyBudget,
  setMonthlyBudget,
  getStoredApiKeys,
  isSupabaseConfigured,
} from "../lib/supabase";
import { AI_MODELS_CATALOG, PROVIDER_METAS } from "../lib/ai-providers";

interface DashboardPageProps {
  onNavigateToApis?: () => void;
  onNavigateToTokenCounter?: () => void;
  onOpenSchemaModal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToApis,
  onNavigateToTokenCounter,
  onOpenSchemaModal,
}) => {
  const [logs, setLogs] = useState<UsageRecord[]>([]);
  const [budget, setBudget] = useState<number>(50.0);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState("50.00");
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>("all");
  const [connectedKeysCount, setConnectedKeysCount] = useState(0);

  // Load data on mount
  useEffect(() => {
    setLogs(getUsageLogs());
    setBudget(getMonthlyBudget());
    setTempBudget(getMonthlyBudget().toFixed(2));
    setConnectedKeysCount(getStoredApiKeys().length);
  }, []);

  // Today's spend calculation (records logged in the last 24h / today)
  const todaySpend = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return logs
      .filter((r) => new Date(r.loggedAt) >= startOfToday)
      .reduce((sum, r) => sum + r.costUSD, 0);
  }, [logs]);

  // This month's spend calculation
  const thisMonthSpend = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return logs
      .filter((r) => new Date(r.loggedAt) >= startOfMonth)
      .reduce((sum, r) => sum + r.costUSD, 0);
  }, [logs]);

  // Total tokens consumed
  const totalTokensConsumed = useMemo(() => {
    return logs.reduce((sum, r) => sum + r.totalTokens, 0);
  }, [logs]);

  // Burn rate and End-of-Month projected spend
  const projection = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Average daily burn rate based on actual days passed
    const dailyAverage = currentDay > 0 ? thisMonthSpend / Math.max(1, currentDay) : thisMonthSpend;
    const projectedTotal = dailyAverage * daysInMonth;
    const isExceedingBudget = projectedTotal > budget;

    return {
      dailyAverage,
      projectedTotal,
      isExceedingBudget,
      remainingDays: daysInMonth - currentDay,
      percentOfBudget: (thisMonthSpend / Math.max(0.01, budget)) * 100,
    };
  }, [thisMonthSpend, budget]);

  // Chart Data: 30-day Cumulative Burn Rate & Projection Curve
  const burnRateChartData = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const dailyRate = projection.dailyAverage;
    const data = [];
    let runningActual = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const daySpend = logs
        .filter((record) => {
          const date = new Date(record.loggedAt);
          return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === day;
        })
        .reduce((sum, record) => sum + record.costUSD, 0);
      runningActual += daySpend;
      const isPast = day <= currentDay;
      const projected = isPast ? runningActual : thisMonthSpend + dailyRate * (day - currentDay);

      data.push({
        day: `Day ${day}`,
        actualSpend: isPast ? Number(runningActual.toFixed(2)) : null,
        projectedSpend: Number(projected.toFixed(2)),
        budgetLimit: budget,
      });
    }
    return data;
  }, [projection.dailyAverage, budget]);

  // Spend breakdown by provider for BarChart
  const providerSpendBreakdown = useMemo(() => {
    const map: Record<string, { provider: string; cost: number; tokens: number }> = {};

    logs.forEach((r) => {
      if (!map[r.provider]) {
        map[r.provider] = { provider: r.provider, cost: 0, tokens: 0 };
      }
      map[r.provider].cost += r.costUSD;
      map[r.provider].tokens += r.totalTokens;
    });

    return Object.values(map)
      .map((item) => ({
        provider: item.provider.toUpperCase(),
        cost: Number(item.cost.toFixed(3)),
        tokens: item.tokens,
      }))
      .sort((a, b) => b.cost - a.cost);
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    if (selectedProviderFilter === "all") return logs;
    return logs.filter((r) => r.provider === selectedProviderFilter);
  }, [logs, selectedProviderFilter]);

  // Handle Save Budget
  const handleSaveBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      setBudget(val);
      setMonthlyBudget(val);
    }
    setIsEditingBudget(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white font-mono flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-cyan-400" />
              <span>Real-Time Spend & Telemetry</span>
            </h1>
            <Badge
              variant="outline"
              className={`text-xs font-mono ${
                isSupabaseConfigured
                  ? "border-emerald-500/40 text-emerald-400"
                  : "border-cyan-500/40 text-cyan-300"
              }`}
            >
              {isSupabaseConfigured ? "Supabase Live Connected" : "Local Encrypted Store"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Real data aggregated from your encrypted API keys and imported usage logs.
            Track daily burn, token throughput, and AI model cost distribution.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onNavigateToTokenCounter && (
            <Button
              onClick={onNavigateToTokenCounter}
              variant="outline"
              size="sm"
              className="text-xs font-mono border-zinc-800 hover:border-zinc-700 cursor-pointer"
            >
              <span>Token Comparator →</span>
            </Button>
          )}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Spend */}
        <Card className="p-5 border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>TODAY'S SPEND</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              ${todaySpend.toFixed(3)}
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              Live
            </span>
          </div>
          <p className="mt-2 text-[11px] font-mono text-zinc-500">
            Across OpenAI, Claude, DeepSeek & Gemini calls
          </p>
        </Card>

        {/* This Month Spend vs Budget */}
        <Card className="p-5 border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>THIS MONTH SPEND</span>
            {isEditingBudget ? (
              <div className="flex items-center gap-1">
                <Input
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="w-16 h-6 text-xs p-1 bg-zinc-950 border-zinc-700 font-mono"
                />
                <button
                  onClick={handleSaveBudget}
                  className="text-[10px] text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingBudget(true)}
                className="text-[11px] text-zinc-500 hover:text-cyan-400 underline font-mono cursor-pointer"
                title="Edit monthly budget"
              >
                Limit: ${budget.toFixed(0)}
              </button>
            )}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              ${thisMonthSpend.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-zinc-400">/ ${budget.toFixed(0)}</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                projection.percentOfBudget > 90
                  ? "bg-rose-500"
                  : projection.percentOfBudget > 75
                  ? "bg-amber-500"
                  : "bg-cyan-500"
              }`}
              style={{ width: `${Math.min(100, projection.percentOfBudget)}%` }}
            />
          </div>
        </Card>

        {/* Total Tokens Consumed */}
        <Card className="p-5 border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>TOTAL TOKENS TRACKED</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold font-mono text-white">
              {totalTokensConsumed.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-[11px] font-mono text-zinc-500">
            Input & Completion tokens combined
          </p>
        </Card>

        {/* API Keys Vault Counter */}
        <Card className="p-5 border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>API KEYS IN VAULT</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-white">
              {connectedKeysCount}/2
            </span>
            {onNavigateToApis && (
              <button
                onClick={onNavigateToApis}
                className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] font-mono text-zinc-500">
            {connectedKeysCount >= 2 ? "Free Tier limit reached" : "1 slot available"}
          </p>
        </Card>
      </div>

      {/* Prediction Graph & Provider Breakdown */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Prediction Graph (8 cols) */}
        <Card className="lg:col-span-8 p-6 border-zinc-800 bg-zinc-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-zinc-800">
            <div>
              <CardTitle className="text-base font-mono flex items-center gap-2">
                <span>Monthly Spend Trajectory & Prediction</span>
                <Badge variant="outline" className="text-[10px] font-mono border-cyan-500/30 text-cyan-300">
                  ML Burn-Rate Forecasting
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs font-mono mt-1">
                Projected end-of-month spend: <strong className="text-white">${projection.projectedTotal.toFixed(2)}</strong>{" "}
                at current ${projection.dailyAverage.toFixed(2)}/day burn rate.
              </CardDescription>
            </div>

            {projection.isExceedingBudget ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Exceeding Budget by ${(projection.projectedTotal - budget).toFixed(2)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>On track under ${budget.toFixed(0)} budget</span>
              </div>
            )}
          </div>

          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burnRateChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
        </Card>

        {/* Provider Spend Breakdown (4 cols) */}
        <Card className="lg:col-span-4 p-6 border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base font-mono">Cost by AI Provider</CardTitle>
            <CardDescription className="text-xs font-mono mt-1">
              Distribution of spend across connected models
            </CardDescription>

            <div className="mt-5 space-y-4">
              {providerSpendBreakdown.map((item) => {
                const pct = thisMonthSpend > 0 ? (item.cost / thisMonthSpend) * 100 : 0;
                return (
                  <div key={item.provider} className="font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-300 mb-1">
                      <span className="font-bold">{item.provider}</span>
                      <span className="text-white font-bold">${item.cost.toFixed(3)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                        style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-0.5 block">
                      {item.tokens.toLocaleString()} tokens ({pct.toFixed(1)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>Tip: Using DeepSeek V3 or Gemini 2.0 Flash lowers aggregate costs by up to 90%.</span>
          </div>
        </Card>
      </div>

      {/* Live Usage Logs Feed */}
      <div className="mt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
            <span>Live Usage Stream</span>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {filteredLogs.length} events
            </span>
          </h2>

          {/* Provider Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap font-mono text-xs">
            {["all", "openai", "anthropic", "google", "deepseek", "meta"].map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProviderFilter(prov)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  selectedProviderFilter === prov
                    ? "bg-cyan-500 text-zinc-950 font-bold"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {prov}
              </button>
            ))}
          </div>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 text-[11px]">
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-3 font-semibold">Model</th>
                  <th className="py-3 px-3 font-semibold">Provider</th>
                  <th className="py-3 px-3 font-semibold text-right">Tokens (Prompt + Comp)</th>
                  <th className="py-3 px-3 font-semibold text-right">Latency</th>
                  <th className="py-3 px-4 font-semibold text-right">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredLogs.map((log) => {
                  const dateStr = new Date(log.loggedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 text-zinc-400">{dateStr}</td>
                      <td className="py-3 px-3 font-bold text-white">{log.modelId}</td>
                      <td className="py-3 px-3 text-zinc-300 capitalize">{log.provider}</td>
                      <td className="py-3 px-3 text-right text-zinc-300">
                        {log.totalTokens.toLocaleString()}
                        <span className="text-[10px] text-zinc-500 block">
                          ({log.promptTokens} in / {log.completionTokens} out)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-zinc-400">
                        {log.latencyMs ? `${log.latencyMs}ms` : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        ${log.costUSD < 0.001 ? log.costUSD.toFixed(5) : log.costUSD.toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

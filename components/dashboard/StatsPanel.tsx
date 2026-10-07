'use client';

import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RouteResult } from '@/types';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Battery,
  CheckCircle2,
  Clock,
  MapPin,
  Route,
  XCircle,
} from 'lucide-react';

function StatRow({
  label,
  value,
  icon: Icon,
  color = 'text-slate-300',
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-slate-500 flex items-center gap-1.5">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <span className={`text-xs font-mono ${color}`}>{value}</span>
    </div>
  );
}

function RouteCard({
  result,
  label,
}: {
  result: RouteResult;
  label: string;
}) {
  return (
    <div className="bg-muted border border-border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{label}</span>
        {result.isFeasible ? (
          <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Feasible
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Infeasible
          </Badge>
        )}
      </div>

      <StatRow
        label="Distance"
        value={`${result.totalDistance.toFixed(2)} km`}
        icon={Route}
        color={result.isFeasible ? 'text-cyan-400' : 'text-red-400'}
      />
      <StatRow
        label="Battery Used"
        value={`${result.batteryStatus.percentUsed.toFixed(1)}%`}
        icon={Battery}
        color={
          result.batteryStatus.percentUsed > 90
            ? 'text-red-400'
            : result.batteryStatus.percentUsed > 70
              ? 'text-amber-400'
              : 'text-emerald-400'
        }
      />
      <StatRow
        label="Battery Remaining"
        value={`${result.batteryStatus.remaining.toFixed(2)} km`}
        icon={Battery}
      />
      <StatRow
        label="Exec Time"
        value={`${result.executionTimeMs.toFixed(3)} ms`}
        icon={Clock}
        color="text-purple-400"
      />
      <StatRow
        label="States Evaluated"
        value={result.statesEvaluated.toLocaleString()}
        icon={Activity}
      />

      {/* Route sequence */}
      <div className="pt-2 border-t border-slate-800">
        <div className="text-[10px] text-slate-500 mb-1.5">Route</div>
        <div className="flex flex-wrap items-center gap-1">
          {result.route.map((nodeId, i) => (
            <span key={i} className="flex items-center gap-0.5">
              <span
                className={`text-[10px] font-mono px-1 py-0.5 rounded ${
                  nodeId === 'DOCK'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                {nodeId}
              </span>
              {i < result.route.length - 1 && (
                <ArrowRight className="w-2.5 h-2.5 text-slate-600" />
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StatsPanel() {
  const { state } = useStore();
  const { results, selectedBuildingIds, battery } = state;

  const selectedCount = selectedBuildingIds.size;
  const hasDP = results.dp !== null;
  const hasGreedy = results.greedy !== null;
  const hasBoth = hasDP && hasGreedy;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-5">
          {/* Overview */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Overview
            </h3>
            <div className="space-y-0.5">
              <StatRow
                label="Deliveries"
                value={String(selectedCount)}
                icon={MapPin}
                color="text-cyan-400"
              />
              <StatRow
                label="Battery Capacity"
                value={`${battery.maxRange} km`}
                icon={Battery}
              />
              <StatRow
                label="Possible States"
                value={
                  selectedCount > 0
                    ? `2^${selectedCount} × ${selectedCount} = ${(
                        Math.pow(2, selectedCount) * selectedCount
                      ).toLocaleString()}`
                    : '—'
                }
                icon={Activity}
              />
            </div>
          </section>

          <Separator className="bg-border" />

          {/* DP Result */}
          {hasDP && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Dynamic Programming (Optimal)
              </h3>
              <RouteCard result={results.dp!} label="DP Bitmask" />
            </section>
          )}

          {/* Greedy Result */}
          {hasGreedy && (
            <>
              <Separator className="bg-border" />
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Greedy Nearest Neighbor
                </h3>
                <RouteCard result={results.greedy!} label="Greedy NN" />
              </section>
            </>
          )}

          {/* 2-Opt Result */}
          {results.twoOpt && (
            <>
              <Separator className="bg-border" />
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  2-Opt Local Search
                </h3>
                <RouteCard result={results.twoOpt!} label="2-Opt" />
              </section>
            </>
          )}

          {/* Random Result */}
          {results.random && (
            <>
              <Separator className="bg-border" />
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Random Search
                </h3>
                <RouteCard result={results.random!} label="Random Search" />
              </section>
            </>
          )}

          {/* Multi-Algorithm Comparison */}
          {(hasDP || hasGreedy || results.twoOpt || results.random) && (
            <>
              <Separator className="bg-border" />
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Comparison
                </h3>
                <div className="bg-muted border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="border-b border-border bg-background/50">
                        <th className="px-2 py-2 text-left text-muted-foreground font-medium">Algo</th>
                        <th className="px-2 py-2 text-right text-muted-foreground font-medium">Dist (km)</th>
                        <th className="px-2 py-2 text-right text-muted-foreground font-medium">Battery %</th>
                        <th className="px-2 py-2 text-right text-muted-foreground font-medium">Time (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'dp', label: 'DP', data: results.dp, color: 'text-cyan-500' },
                        { key: 'greedy', label: 'Greedy', data: results.greedy, color: 'text-pink-500' },
                        { key: 'twoOpt', label: '2-Opt', data: results.twoOpt, color: 'text-emerald-500' },
                        { key: 'random', label: 'Random', data: results.random, color: 'text-amber-500' }
                      ].filter(item => item.data).map((item, i) => (
                        <tr key={item.key} className="border-b border-border/50 last:border-0">
                          <td className={`px-2 py-2 font-medium ${item.color}`}>
                            {item.label}
                          </td>
                          <td className="px-2 py-2 text-right font-mono text-foreground">
                            {item.data!.totalDistance.toFixed(2)}
                          </td>
                          <td className={`px-2 py-2 text-right font-mono ${item.data!.batteryStatus.percentUsed > 90 ? 'text-destructive' : 'text-foreground'}`}>
                            {item.data!.batteryStatus.percentUsed.toFixed(1)}%
                          </td>
                          <td className="px-2 py-2 text-right font-mono text-muted-foreground">
                            {item.data!.executionTimeMs.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {hasDP && hasGreedy && (
                  <div className="mt-3 p-2 bg-cyan-500/10 rounded text-[10px] text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    <strong>Insight:</strong> DP Bitmask saved{' '}
                    <span className="font-mono font-bold">
                      {(results.greedy!.totalDistance - results.dp!.totalDistance).toFixed(2)} km
                    </span>{' '}
                    compared to Greedy ({(
                      ((results.greedy!.totalDistance - results.dp!.totalDistance) /
                        results.greedy!.totalDistance) *
                      100
                    ).toFixed(1)}% improvement).
                  </div>
                )}
              </section>
            </>
          )}

          {/* Empty state */}
          {!hasDP && !hasGreedy && (
            <div className="text-center py-8 text-slate-600">
              <Route className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">
                Select delivery locations and run optimization to see results.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}



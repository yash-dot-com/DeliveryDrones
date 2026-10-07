'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Timer,
} from 'lucide-react';

export function AlgorithmPanel() {
  const { state, runExperiment } = useStore();
  const { results, experiments, selectedBuildingIds } = state;
  const [showExplanation, setShowExplanation] = useState(false);

  const n = selectedBuildingIds.size;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-5">
        {/* Algorithm explanation (collapsible) */}
        <section>
          <button
            className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 hover:text-slate-300 transition-colors"
            onClick={() => setShowExplanation(!showExplanation)}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              How the Algorithm Works
            </span>
            {showExplanation ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showExplanation && (
            <div className="bg-muted rounded-lg p-4 text-xs text-muted-foreground space-y-4 border border-border">
              {/* DP Bitmask */}
              <div>
                <h4 className="font-semibold text-foreground mb-1 text-cyan-500">
                  1. Dynamic Programming (DP Bitmask)
                </h4>
                <p className="mb-2">
                  Finds the mathematically <strong>optimal</strong> shortest route by remembering previously calculated shorter paths.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>State:</strong> <code className="text-primary bg-background border border-border px-1 rounded">dp[mask][current]</code></li>
                  <li><strong>Bitmask:</strong> A binary number where each bit represents a delivery (1 = visited, 0 = unvisited).</li>
                  <li><strong>Complexity:</strong> Time <code className="text-[10px]">O(2^n × n²)</code>. Perfect for small <code className="text-[10px]">n</code>, but crashes if <code className="text-[10px]">n &gt; 20</code>.</li>
                </ul>
              </div>

              {/* Greedy */}
              <div>
                <h4 className="font-semibold text-foreground mb-1 text-pink-500">
                  2. Greedy Nearest Neighbor
                </h4>
                <p className="mb-2">
                  A fast heuristic that simply goes to the <strong>closest unvisited node</strong> at each step.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>How it works:</strong> Starting from the dock, it scans all remaining deliveries, picks the closest one, and repeats.</li>
                  <li><strong>Pros/Cons:</strong> Extremely fast, but often gets "trapped" into taking long jumps at the end.</li>
                  <li><strong>Complexity:</strong> Time <code className="text-[10px]">O(n²)</code>.</li>
                </ul>
              </div>

              {/* 2-Opt */}
              <div>
                <h4 className="font-semibold text-foreground mb-1 text-emerald-500">
                  3. 2-Opt Local Search
                </h4>
                <p className="mb-2">
                  An optimization technique that takes an existing route (like Greedy) and <strong>untangles it</strong>.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>How it works:</strong> It repeatedly selects two edges in the route and swaps them if it results in a shorter total distance.</li>
                  <li><strong>Pros/Cons:</strong> Usually finds a near-optimal solution quickly by removing crossed paths.</li>
                  <li><strong>Complexity:</strong> Time <code className="text-[10px]">O(n³)</code> per iteration.</li>
                </ul>
              </div>

              {/* Random */}
              <div>
                <h4 className="font-semibold text-foreground mb-1 text-amber-500">
                  4. Random Search (Monte Carlo)
                </h4>
                <p className="mb-2">
                  Generates many random routes and keeps the best one it finds.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>How it works:</strong> Shuffles the order of delivery nodes 1000 times, calculates the total distance for each, and returns the minimum.</li>
                  <li><strong>Pros/Cons:</strong> Good for demonstration, but highly unreliable for larger graphs.</li>
                  <li><strong>Complexity:</strong> Time <code className="text-[10px]">O(k × n)</code> where k is the number of random shuffles.</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        <Separator className="bg-border" />

        {/* Performance Experiment */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5" />
            Performance Experiments
          </h3>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => runExperiment(8)}
              >
                <Timer className="w-3 h-3" />
                Run (1–8 deliveries)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-xs"
                onClick={() => runExperiment(12)}
              >
                <Timer className="w-3 h-3" />
                Run (1–12)
              </Button>
            </div>

            {experiments.length > 0 && (
              <div className="bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900">
                      <th className="px-2 py-1.5 text-left text-slate-500 font-medium">
                        N
                      </th>
                      <th className="px-2 py-1.5 text-right text-slate-500 font-medium">
                        DP Time
                      </th>
                      <th className="px-2 py-1.5 text-right text-slate-500 font-medium">
                        Greedy
                      </th>
                      <th className="px-2 py-1.5 text-right text-slate-500 font-medium">
                        DP Dist
                      </th>
                      <th className="px-2 py-1.5 text-right text-slate-500 font-medium">
                        Greedy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiments.map((exp, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-800/50 last:border-0"
                      >
                        <td className="px-2 py-1.5 font-mono text-cyan-400">
                          {exp.deliveryCount}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-purple-400">
                          {exp.dpTime < 1
                            ? `${(exp.dpTime * 1000).toFixed(0)}μs`
                            : `${exp.dpTime.toFixed(1)}ms`}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-green-400">
                          {exp.greedyTime < 1
                            ? `${(exp.greedyTime * 1000).toFixed(0)}μs`
                            : `${exp.greedyTime.toFixed(1)}ms`}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-slate-300">
                          {exp.dpDistance.toFixed(1)}
                        </td>
                        <td className="px-2 py-1.5 text-right font-mono text-slate-400">
                          {exp.greedyDistance.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* DP Stats from current result */}
        {results.dp && (
          <>
            <Separator className="bg-border" />
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Current DP Analysis
              </h3>
              <div className="bg-muted rounded-lg p-3 space-y-1 text-xs border border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery nodes (n)</span>
                  <span className="font-mono text-cyan-400">{n}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Possible states</span>
                  <span className="font-mono text-slate-300">
                    {(Math.pow(2, n) * n).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">States evaluated</span>
                  <span className="font-mono text-purple-400">
                    {results.dp.statesEvaluated.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Optimal cost</span>
                  <span className="font-mono text-emerald-400">
                    {results.dp.totalDistance.toFixed(2)} km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Execution time</span>
                  <span className="font-mono text-purple-400">
                    {results.dp.executionTimeMs.toFixed(3)} ms
                  </span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
      </ScrollArea>
    </div>
  );
}

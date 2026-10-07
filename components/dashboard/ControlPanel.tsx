'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity,
  Battery,
  Building2,
  Crosshair,
  Dice5,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';

export function ControlPanel() {
  const {
    state,
    generateNewCity,
    clearSelection,
    selectRandom,
    setBattery,
    runOptimization,
    runComparisonBoth,
    setSimulation,
    setAnimationSpeed,
  } = useStore();

  const {
    city,
    selectedBuildingIds,
    battery,
    results,
    simulation,
    animationSpeed,
  } = state;

  const selectedCount = selectedBuildingIds.size;
  const hasResults = results.dp !== null || results.greedy !== null;

  const activeRoute = results.dp || results.greedy || results.twoOpt || results.random;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-5">
          {/* City Controls */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              City
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={generateNewCity}
              >
                <Dice5 className="w-3.5 h-3.5" />
                Generate New City
              </Button>
              <div className="text-xs text-slate-500">
                Seed: {state.seed} · {city.buildings.length} buildings
              </div>
            </div>
          </section>

          <Separator className="bg-border" />

          {/* Battery */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Battery className="w-3.5 h-3.5" />
              Battery Capacity
            </h3>
            <div className="space-y-3">
              <Slider
                value={[battery.maxRange]}
                onValueChange={(v: any) => setBattery(Array.isArray(v) ? v[0] : v)}
                min={10}
                max={200}
                step={5}
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Range</span>
                <span className="font-mono text-primary">{battery.maxRange} km</span>
              </div>
            </div>
          </section>

          <Separator className="bg-border" />

          {/* Delivery Selection */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              Delivery Locations
              <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                {selectedCount}
              </Badge>
            </h3>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => selectRandom(4)}
                >
                  <Dice5 className="w-3 h-3" />
                  Random 4
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={clearSelection}
                  disabled={selectedCount === 0}
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </Button>
              </div>

              {/* Selected buildings list */}
              {selectedCount > 0 && (
                <div className="bg-muted rounded-lg p-2 space-y-1">
                  {Array.from(selectedBuildingIds).map((id) => (
                    <div
                      key={id}
                      className="flex items-center gap-2 text-xs px-2 py-1 rounded bg-background border border-border"
                    >
                      <Crosshair className="w-3 h-3 text-primary" />
                      <span className="font-mono">{id}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedCount === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  Click buildings in the 3D view to select delivery locations.
                </p>
              )}
            </div>
          </section>

          <Separator className="bg-border" />

          {/* Optimization */}
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Optimization
            </h3>
            <div className="space-y-2">
              <Button
                size="sm"
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={runOptimization}
                disabled={selectedCount === 0 || simulation === 'computing'}
              >
                <Zap className="w-3.5 h-3.5" />
                Find Optimal Route (DP)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={runComparisonBoth}
                disabled={selectedCount === 0 || simulation === 'computing'}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Run All Algorithms
              </Button>
            </div>
          </section>

          {/* Active Flight Info */}
          {activeRoute && (
            <>
              <Separator className="bg-border" />
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" />
                  Flight Info
                </h3>
                <div className="bg-muted rounded-lg p-3 space-y-2 border border-border">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Total Flight Distance</span>
                    <span className="font-mono font-semibold text-primary">{activeRoute.totalDistance.toFixed(2)} km</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Battery Used</span>
                    <span className={`font-mono font-semibold ${activeRoute.batteryStatus.percentUsed > 90 ? 'text-destructive' : 'text-primary'}`}>
                      {activeRoute.batteryStatus.percentUsed.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Animation Controls */}
          {hasResults && (
            <>
              <Separator className="bg-border" />
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" />
                  Animation
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {simulation === 'playing' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => setSimulation('paused')}
                      >
                        <Pause className="w-3.5 h-3.5" />
                        Pause
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5"
                        onClick={() => setSimulation('playing')}
                      >
                        <Play className="w-3.5 h-3.5" />
                        {simulation === 'completed' ? 'Replay' : 'Play'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setSimulation('ready')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Speed</span>
                      <span className="font-mono text-muted-foreground">{animationSpeed}x</span>
                    </div>
                    <Slider
                      value={[animationSpeed]}
                      onValueChange={(v: any) => setAnimationSpeed(Array.isArray(v) ? v[0] : v)}
                      min={0.5}
                      max={5}
                      step={0.5}
                    />
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

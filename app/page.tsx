'use client';

import dynamic from 'next/dynamic';
import { StoreProvider } from '@/lib/store';
import { ControlPanel } from '@/components/dashboard/ControlPanel';
import { StatsPanel } from '@/components/dashboard/StatsPanel';
import { AlgorithmPanel } from '@/components/dashboard/AlgorithmPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WelcomeModal } from '@/components/ui/WelcomeModal';
import {
  BarChart3,
  Cpu,
  Plane,
} from 'lucide-react';

// Dynamic import for Three.js — client-side only
const CityScene = dynamic(
  () =>
    import('@/components/city/CityScene').then((mod) => ({
      default: mod.CityScene,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0f1a]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading 3D Scene...</p>
        </div>
      </div>
    ),
  }
);

function Dashboard() {
  return (
    <div className="flex flex-col h-screen overflow-hidden relative bg-slate-50 dark:bg-[#0a0f1a]">
      {/* Background — 3D View */}
      <div className="absolute inset-0">
        <CityScene />
      </div>

      <WelcomeModal />

      {/* Floating Header / Info */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-50 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-sm pointer-events-auto">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Plane className="w-3 h-3 text-white" />
          </div>
          <h1 className="text-xs font-semibold tracking-tight text-foreground">
            Drone Delivery Route Optimizer
          </h1>
          <div className="w-1 h-4 bg-border mx-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              System Ready
            </span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-50">
        <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border text-[10px] text-muted-foreground shadow-sm pointer-events-auto">
          Pan: Click + Drag · Zoom: Scroll · Select: Click Building
        </div>
      </div>

      {/* Left Panel — Controls */}
      <aside className="absolute top-4 bottom-4 left-4 w-72 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl flex flex-col overflow-hidden z-50">
        <ControlPanel />
      </aside>

      {/* Right Panel — Stats & Algorithm */}
      <aside className="absolute top-4 bottom-4 right-4 w-80 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl flex flex-col overflow-hidden z-50">
        <Tabs defaultValue="stats" className="h-full flex flex-col">
          <TabsList className="flex-shrink-0 w-full rounded-none border-b border-border bg-transparent h-auto p-0">
            <TabsTrigger
              value="stats"
              className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5 text-xs text-muted-foreground data-[state=active]:text-foreground"
            >
              <BarChart3 className="w-3 h-3" />
              Results
            </TabsTrigger>
            <TabsTrigger
              value="algorithm"
              className="flex-1 gap-1.5 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-2.5 text-xs text-muted-foreground data-[state=active]:text-foreground"
            >
              <Cpu className="w-3 h-3" />
              Algorithm
            </TabsTrigger>
          </TabsList>
          <TabsContent value="stats" className="flex-1 overflow-hidden m-0 p-0">
            <StatsPanel />
          </TabsContent>
          <TabsContent
            value="algorithm"
            className="flex-1 overflow-hidden m-0 p-0"
          >
            <AlgorithmPanel />
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <Dashboard />
    </StoreProvider>
  );
}

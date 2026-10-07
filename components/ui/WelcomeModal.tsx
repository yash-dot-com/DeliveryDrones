'use client';

import { useState, useEffect } from 'react';
import { Plane, MousePointerClick, Cpu, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal on first load. You can also add localStorage logic here if you want it to appear strictly once per user.
    const hasSeenModal = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenWelcomeModal', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
        
        {/* Apple-style gradient blob in background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/30 rounded-full blur-3xl" />

        <div className="relative p-8">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg mb-6 mx-auto">
            <Plane className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-center text-slate-900 dark:text-white mb-2">
            Welcome to FlytBase
          </h2>
          <p className="text-sm text-center text-slate-600 dark:text-slate-400 mb-8">
            Experience advanced drone delivery route optimization in an interactive 3D city.
          </p>

          <div className="space-y-6 mb-8">
            <div className="flex gap-4 items-start">
              <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <MousePointerClick className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Select Destinations</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Click on the 3D buildings to add them to your delivery queue. The docking station is in the center.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Run Algorithms</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Compare Dynamic Programming, Greedy, 2-Opt, and Random search to find the most efficient path.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Watch it Fly</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Sit back and watch the simulation as multiple drones navigate the city in real-time.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleClose} 
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-semibold text-sm transition-all"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}

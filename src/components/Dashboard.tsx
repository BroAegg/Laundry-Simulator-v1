'use client';

import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Clock, DollarSign, Package, Store, DoorClosed, PlusCircle, RotateCcw, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  onSpawnCustomer?: () => void;
  nextCustomerIn?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSpawnCustomer, nextCustomerIn = 0 }) => {
  const currentDay = useGameStore((state) => state.currentDay);
  const cash = useGameStore((state) => state.cash);
  const soapStock = useGameStore((state) => state.soapStock);
  const isOpen = useGameStore((state) => state.isOpen);
  const currentGameTime = useGameStore((state) => state.currentGameTime);
  const notification = useGameStore((state) => state.notification);
  const currentCustomer = useGameStore((state) => state.currentCustomer);

  const bukaToko = useGameStore((state) => state.bukaToko);
  const tutupToko = useGameStore((state) => state.tutupToko);
  const beliSabun = useGameStore((state) => state.beliSabun);
  const resetGame = useGameStore((state) => state.resetGame);

  const [hours] = currentGameTime.split(':').map(Number);
  const isAfterClosing = hours >= 18;

  return (
    <div className="absolute top-0 left-0 right-0 z-40 p-3 pointer-events-none select-none">
      {/* Top HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 max-w-full">
        {/* Left: Toko Brand & Day */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-900 border-2 border-yellow-400 rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-white">
            <span className="font-extrabold tracking-wider text-yellow-300 text-sm md:text-base drop-shadow">
              🧺 LONFRI
            </span>
            <span className="bg-yellow-400 text-blue-900 font-black text-xs px-2 py-0.5 rounded-full uppercase">
              v1.0
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-700 text-white px-3 py-1.5 rounded-xl shadow backdrop-blur-sm flex items-center gap-1.5 text-xs md:text-sm font-bold">
            <span className="text-yellow-400">📅</span>
            <span>HARI KE-{currentDay}</span>
          </div>

          <div
            className={`border px-3 py-1.5 rounded-xl shadow backdrop-blur-sm flex items-center gap-1.5 text-xs md:text-sm font-bold transition-colors ${
              isAfterClosing
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-slate-900/90 border-slate-700 text-cyan-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="font-mono tracking-wider">{currentGameTime}</span>
            {isAfterClosing && <span className="text-[10px] text-rose-400 uppercase font-black">(TUTUP)</span>}
          </div>
        </div>

        {/* Center: Live Notification Toast */}
        <div className="pointer-events-auto flex-1 max-w-md mx-2 hidden sm:block">
          <AnimatePresence mode="wait">
            {notification && (
              <motion.div
                key={notification}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-950/85 border border-yellow-500/50 text-yellow-200 text-xs px-3 py-1.5 rounded-lg shadow-md text-center truncate backdrop-blur-sm"
              >
                {notification}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Resources & Actions */}
        <div className="flex items-center gap-2 pointer-events-auto ml-auto">
          {/* Cash Display */}
          <div className="bg-emerald-950/90 border-2 border-emerald-500 text-emerald-300 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 text-xs md:text-sm font-black">
            <DollarSign className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span className="font-mono">Rp{cash.toLocaleString('id-ID')}</span>
          </div>

          {/* Soap Stock with Buy Button */}
          <div
            className={`border-2 rounded-xl px-2.5 py-1.5 shadow-lg flex items-center gap-2 text-xs md:text-sm font-bold backdrop-blur-sm transition-colors ${
              soapStock <= 2
                ? 'bg-red-950/90 border-red-500 text-red-300 animate-bounce'
                : 'bg-slate-900/90 border-amber-500/80 text-amber-300'
            }`}
          >
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-amber-400" />
              <span>
                {soapStock}
                <span className="text-[10px] text-slate-400">/20</span>
              </span>
            </div>

            <button
              onClick={() => beliSabun()}
              title="Beli 10 Sabun (Rp20.000)"
              className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow flex items-center gap-0.5 transition-all"
            >
              <PlusCircle className="w-3 h-3" />
              <span>+10</span>
            </button>
          </div>

          {/* Rolling Door Action Button */}
          {!isOpen ? (
            <button
              onClick={bukaToko}
              disabled={isAfterClosing}
              className={`px-3 py-1.5 rounded-xl font-black text-xs md:text-sm shadow-xl flex items-center gap-1.5 transition-all active:scale-95 border-2 ${
                isAfterClosing
                  ? 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-green-500 border-emerald-300 text-white hover:brightness-110 ring-2 ring-emerald-500/50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>BUKA TOKO</span>
            </button>
          ) : (
            <button
              onClick={tutupToko}
              className="px-3 py-1.5 rounded-xl font-black text-xs md:text-sm shadow-xl flex items-center gap-1.5 transition-all active:scale-95 border-2 bg-gradient-to-r from-rose-700 to-red-600 border-red-300 text-white hover:brightness-110 ring-2 ring-red-500/50"
            >
              <DoorClosed className="w-4 h-4" />
              <span>TUTUP TOKO</span>
            </button>
          )}

          {/* Quick Spawn Helper (Visible when open & idle) */}
          {isOpen && !currentCustomer && !isAfterClosing && onSpawnCustomer && (
            <button
              onClick={onSpawnCustomer}
              title={`Panggil pelanggan langsung (Countdown: ${nextCustomerIn}s)`}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white border border-indigo-400 text-xs px-2.5 py-1.5 rounded-xl shadow font-bold flex items-center gap-1 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Panggil</span>
              <span className="text-[10px] bg-indigo-800 px-1 py-0.2 rounded font-mono">{nextCustomerIn}s</span>
            </button>
          )}

          {/* Reset Progress Helper */}
          <button
            onClick={() => {
              if (window.confirm('Reset seluruh game ke Hari 1 dan uang default Rp100.000?')) {
                resetGame();
              }
            }}
            title="Reset Game"
            className="p-1.5 bg-slate-800/80 hover:bg-rose-900 text-slate-400 hover:text-rose-200 border border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mobile Notification Toast fallback */}
      <div className="pointer-events-auto block sm:hidden mt-2">
        <AnimatePresence mode="wait">
          {notification && (
            <motion.div
              key={notification}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-slate-950/90 border border-yellow-500/60 text-yellow-200 text-[11px] px-2.5 py-1 rounded-md shadow text-center"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowRight, History, CheckCircle2 } from 'lucide-react';

export const ModalEOD: React.FC = () => {
  const isEODModalOpen = useGameStore((state) => state.isEODModalOpen);
  const currentDay = useGameStore((state) => state.currentDay);
  const cash = useGameStore((state) => state.cash);
  const todayIncome = useGameStore((state) => state.todayIncome);
  const todayExpense = useGameStore((state) => state.todayExpense);
  const dailyTransactions = useGameStore((state) => state.dailyTransactions);
  const historyDailyReport = useGameStore((state) => state.historyDailyReport);

  const nextDay = useGameStore((state) => state.nextDay);
  const setEODModalOpen = useGameStore((state) => state.setEODModalOpen);

  if (!isEODModalOpen) return null;

  const netProfit = todayIncome - todayExpense;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-3 border-amber-500/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-4 text-slate-950 text-center shadow-lg relative">
            <span className="inline-block bg-slate-950 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest mb-1">
              End of Day Report
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
              LAPORAN KEUANGAN HARIAN
            </h2>
            <p className="text-xs font-bold text-slate-900">
              Hari ke-{currentDay} telah resmi berakhir (Pukul 18:00 WIB)
            </p>
          </div>

          {/* Content Body */}
          <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Financial Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Card 1: Pendapatan Hari Ini */}
              <div className="bg-emerald-950/60 border border-emerald-600/60 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Pendapatan</span>
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-emerald-300 font-mono">
                    +Rp{todayIncome.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[9px] text-emerald-400/80">
                    {dailyTransactions.length} transaksi
                  </span>
                </div>
              </div>

              {/* Card 2: Pengeluaran Sabun */}
              <div className="bg-rose-950/60 border border-rose-600/60 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-rose-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Beli Sabun</span>
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-rose-300 font-mono">
                    -Rp{todayExpense.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[9px] text-rose-400/80">Restock stok sabun</span>
                </div>
              </div>

              {/* Card 3: Laba Bersih */}
              <div className="bg-blue-950/60 border border-blue-600/60 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-blue-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Laba Bersih</span>
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div
                    className={`text-xs sm:text-sm font-black font-mono ${
                      netProfit >= 0 ? 'text-blue-300' : 'text-rose-400'
                    }`}
                  >
                    {netProfit >= 0 ? '+' : ''}Rp{netProfit.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[9px] text-blue-400/80">Hari ke-{currentDay}</span>
                </div>
              </div>

              {/* Card 4: Saldo Kas Akhir */}
              <div className="bg-amber-950/60 border-2 border-yellow-500 rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-yellow-400 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider">Saldo Kas Akhir</span>
                  <span className="text-xs">💰</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-yellow-300 font-mono">
                    Rp{cash.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[9px] text-yellow-400/80">Dibawa ke Day + 1</span>
                </div>
              </div>
            </div>

            {/* Daily Transactions Breakdown */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
              <h3 className="text-xs font-black uppercase text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Rincian Transaksi Hari Ini ({dailyTransactions.length})</span>
              </h3>

              {dailyTransactions.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-4 text-center">
                  Belum ada transaksi yang diselesaikan hari ini.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {dailyTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-500">{tx.time || tx.id}</span>
                        <span className="font-bold text-slate-200">
                          {tx.customerType === 'anak_kos' ? '🎒 Anak Kos' : '🧺 Ibu-Ibu'}
                        </span>
                        <span
                          className={`text-[9px] uppercase px-1 rounded font-bold ${
                            tx.service === 'express'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-blue-950 text-blue-300 border border-blue-700'
                          }`}
                        >
                          {tx.service}
                        </span>
                        <span className="text-slate-400 text-[11px] font-mono">{tx.weight} kg</span>
                      </div>
                      <div className="font-mono font-black text-emerald-400">
                        +Rp{tx.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History of Previous Days (if any) */}
            {historyDailyReport.length > 1 && (
              <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-2.5 text-xs">
                <h4 className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <History className="w-3 h-3 text-slate-500" />
                  <span>Riwayat Hari Sebelumnya:</span>
                </h4>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {historyDailyReport
                    .filter((r) => r.day !== currentDay)
                    .map((r) => (
                      <div
                        key={r.day}
                        className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-[10px] font-mono whitespace-nowrap"
                      >
                        <span className="text-amber-400 font-bold">Hari {r.day}: </span>
                        <span className="text-emerald-400">+Rp{r.income.toLocaleString('id-ID')} </span>
                        <span className="text-slate-500">| Laba: Rp{r.netProfit.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => setEODModalOpen(false)}
              className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              Tinjau Toko Kembali
            </button>

            <button
              onClick={() => nextDay()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl flex items-center gap-2 border-2 border-green-300 transition-all"
            >
              <span>MULAI HARI BERIKUTNYA (DAY + 1)</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

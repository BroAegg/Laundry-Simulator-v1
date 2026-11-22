'use client';

import React, { useState } from 'react';
import { Viewport } from '@/components/Viewport';
import { Info, HelpCircle, Sparkles, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [showGuide, setShowGuide] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Top Floating Control Pills */}
      <div className="absolute top-2 right-4 z-50 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="bg-slate-900/80 hover:bg-slate-800 text-yellow-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow backdrop-blur transition-all"
          title="Panduan Bermain"
        >
          <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
          <span className="hidden sm:inline">Panduan</span>
        </button>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 p-1.5 rounded-full text-xs shadow backdrop-blur transition-all"
          title={soundEnabled ? 'Suara Aktif' : 'Suara Dimatikan'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
        </button>

        <button
          onClick={toggleFullscreen}
          className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 p-1.5 rounded-full text-xs shadow backdrop-blur transition-all"
          title="Mode Layar Penuh"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Guide / Tutorial Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border-2 border-yellow-400 rounded-2xl max-w-md w-full p-5 shadow-2xl text-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧺</span>
                  <h3 className="font-black text-yellow-400 text-base uppercase">
                    Panduan Kasir &quot;LONFRI&quot;
                  </h3>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
                >
                  ✕ Tutup
                </button>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-black text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded text-[11px]">1</span>
                  <p>
                    <strong>Buka Toko:</strong> Klik tombol hijau <strong>&quot;BUKA TOKO&quot;</strong> di atas untuk menaikkan rolling door besi.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-black text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded text-[11px]">2</span>
                  <p>
                    <strong>Pelanggan Datang:</strong> Anak kos atau Ibu-ibu datang setiap 15-20 detik membawa cucian.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-black text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded text-[11px]">3</span>
                  <p>
                    <strong>Timbang Cucian:</strong> Klik <strong>Timbangan Digital</strong> di atas meja kasir untuk mengukur berat pakaian (kg).
                  </p>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-black text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded text-[11px]">4</span>
                  <p>
                    <strong>Cetak Nota Struk:</strong> Klik <strong>Buku Nota</strong> di meja kasir untuk membuka struk rincian biaya & cetak nota.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-black text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded text-[11px]">5</span>
                  <p>
                    <strong>Terima Pembayaran:</strong> Klik <strong>Laci Kasir</strong> untuk menerima uang tunai & menyelesaikan pesanan (memakai 1 sabun).
                  </p>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-black text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded text-[11px]">6</span>
                  <p>
                    <strong>Restock Sabun & EOD:</strong> Beli sabun di rak (+10 seharga Rp20.000). Saat jam 18:00, klik <strong>&quot;TUTUP TOKO&quot;</strong> untuk evaluasi laba bersih harian!
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowGuide(false)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black px-4 py-1.5 rounded-xl text-xs shadow"
                >
                  Siap Melayani!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Game Responsive 16:9 Viewport */}
      <Viewport />
    </main>
  );
}

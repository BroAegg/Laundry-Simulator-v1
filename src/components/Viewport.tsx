'use client';

import React from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { motion, AnimatePresence } from 'framer-motion';
import { Dashboard } from './Dashboard';
import { Dialogue } from './Dialogue';
import { CashierTable } from './CashierTable';
import { ModalReceipt } from './ModalReceipt';
import { ModalEOD } from './ModalEOD';

export const Viewport: React.FC = () => {
  const isOpen = useGameStore((state) => state.isOpen);
  const currentCustomer = useGameStore((state) => state.currentCustomer);
  const currentGameTime = useGameStore((state) => state.currentGameTime);

  // Game loop hook (clock and customer spawner)
  const { nextCustomerIn, triggerNextCustomerNow } = useGameLoop();

  // Time-of-day lighting effect
  const [hours] = currentGameTime.split(':').map(Number);
  const isSunset = hours >= 16 && hours < 18;
  const isNight = hours >= 18;

  // Resolve customer sprite: switches to idle (tanpa cucian) once laundry is weighed!
  const getCustomerSprite = () => {
    if (!currentCustomer) return null;
    const isCarrying = currentCustomer.status === 'MASUK' || currentCustomer.status === 'MENUNGGU';
    if (isCarrying) {
      return currentCustomer.spriteBawaUrl || '/assets/characters/anak-kos-bawa.png';
    } else {
      return currentCustomer.spriteIdleUrl || '/assets/characters/anak-kos-idle.png';
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-slate-950 p-0 sm:p-2 md:p-4 select-none">
      {/* 
        ======================================================================
        RESPONSIVE 16:9 CONTAINER LOCK
        ======================================================================
      */}
      <div className="relative w-full max-w-[1280px] aspect-[16/9] max-h-[96vh] overflow-hidden bg-slate-900 shadow-2xl sm:rounded-2xl border border-slate-800">
        
        {/* ==================================================================
            LAYER z-0: JALAN RAYA OUTDOOR (Layer 1 Jalan.jpg)
            Latar paling belakang di luar toko
        ================================================================== */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/props/Layer 1 Jalan.jpg"
            alt="Layer 1 Jalan Raya"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Time-of-day atmospheric tint on street */}
          <div
            className={`absolute inset-0 transition-colors duration-1000 ${
              isNight
                ? 'bg-indigo-950/45 mix-blend-multiply'
                : isSunset
                ? 'bg-amber-600/30 mix-blend-color-burn'
                : 'bg-transparent'
            }`}
          />
        </div>

        {/* ==================================================================
            LAYER z-10: PELANGGAN DI LUAR TOKO / DI BELAKANG MEJA KASIR
            Pelanggan berjalan di luar toko, berdiri di belakang meja kasir
            (Tubuh bagian bawah tertutup meja kasir di Layer 20)
        ================================================================== */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <AnimatePresence>
            {currentCustomer && (
              <motion.div
                key={currentCustomer.id}
                initial={{ x: '-160%', opacity: 0 }}
                animate={{
                  x: currentCustomer.status === 'KELUAR' ? '-160%' : '0%',
                  opacity: 1,
                }}
                exit={{ x: '-160%', opacity: 0 }}
                transition={{
                  duration: currentCustomer.status === 'KELUAR' ? 1.8 : 2.0,
                  ease: 'easeInOut',
                }}
                className="absolute bottom-[24%] left-[55%] -translate-x-1/2 h-[55%] w-auto flex flex-col items-center justify-end"
              >
                {/* Character Bobbing Animation */}
                <motion.div
                  animate={{
                    y:
                      currentCustomer.status === 'MASUK' || currentCustomer.status === 'KELUAR'
                        ? [0, -6, 0]
                        : [0, -2, 0],
                  }}
                  transition={{
                    duration:
                      currentCustomer.status === 'MASUK' || currentCustomer.status === 'KELUAR'
                        ? 0.35
                        : 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative flex flex-col items-center select-none h-full justify-end"
                >
                  {/* Single Clean Character Sprite */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCustomerSprite() || '/assets/characters/anak-kos-bawa.png'}
                    alt={currentCustomer.name}
                    className="h-full w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==================================================================
            LAYER z-20: TOKO LAUNDRY INTERIOR (layer-3-toko-clean.png)
            Meja Kasir, Lantai Toko, dan Rak Sabun berada di DEPAN pelanggan.
            Pintu masuk terbuka berlubang tembus ke jalan & pelanggan di z-10!
        ================================================================== */}
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/props/layer-3-toko-clean.png"
            alt="Toko Laundry Interior"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* Toko Tutup (Rolling Door Besi Menutup Saat Toko Tutup) */}
          <motion.div
            initial={false}
            animate={{
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto',
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/props/Toko Tutup.jpg"
              alt="Toko Laundry Tutup"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Time-of-day atmospheric tint inside shop */}
          <div
            className={`absolute inset-0 transition-colors duration-1000 ${
              isNight
                ? 'bg-indigo-950/40 mix-blend-multiply'
                : isSunset
                ? 'bg-amber-600/20 mix-blend-color-burn'
                : 'bg-transparent'
            }`}
          />
        </div>

        {/* ==================================================================
            LAYER z-30: INTERACTIVE HOTSPOTS DI ATAS GAMBAR ASLI
            (Rak Sabun, Timbangan Digital, Buku Nota, Laci Kas)
        ================================================================== */}
        <CashierTable />

        {/* ==================================================================
            LAYER z-40: OVERLAYS UI/HUD, DIALOGUE, & MODALS
        ================================================================== */}
        {/* Balon Dialog Pelanggan (Melayang rapi di atas kepala) */}
        <Dialogue customer={currentCustomer} />

        <Dashboard
          onSpawnCustomer={triggerNextCustomerNow}
          nextCustomerIn={nextCustomerIn}
        />

        <ModalReceipt />
        <ModalEOD />
      </div>
    </div>
  );
};

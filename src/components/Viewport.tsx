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
            LAYER z-0 & z-20: TOKO LAUNDRY BACKGROUND ASSETS
            Menggunakan artwork asli Toko Buka.jpg & Toko Tutup.jpg
        ================================================================== */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Toko Buka (Pintu rolling door terbuka) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/props/Toko Buka.jpg"
            alt="Toko Laundry Buka"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Toko Tutup (Pintu rolling door besi tertutup) */}
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
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
            />
          </motion.div>

          {/* Time-of-day atmospheric tint */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${
              isNight
                ? 'bg-indigo-950/40 mix-blend-multiply'
                : isSunset
                ? 'bg-amber-600/25 mix-blend-color-burn'
                : 'bg-transparent'
            }`}
          />
        </div>

        {/* ==================================================================
            LAYER z-10: SPRITE PELANGGAN (BERDIRI TEPAT DI DEPAN MEJA KASIR)
            Koordinat x: 45%..55%, kaki menyentuh lantai (bottom: 0)
        ================================================================== */}
        <div className="absolute inset-0 z-10 pointer-events-none">
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
                className="absolute bottom-0 left-[44%] sm:left-[46%] -translate-x-1/2 h-[60%] sm:h-[68%] md:h-[72%] w-auto flex flex-col items-center justify-end z-10"
              >
                {/* Character Sprite with Bob Animation */}
                <motion.div
                  animate={{
                    y:
                      currentCustomer.status === 'MASUK' || currentCustomer.status === 'KELUAR'
                        ? [0, -8, 0]
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
                  {/* Clean Single Character Sprite (Bawa Cucian / Tanpa Cucian) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCustomerSprite() || '/assets/characters/anak-kos-bawa.png'}
                    alt={currentCustomer.name}
                    className="h-full w-auto object-contain drop-shadow-[0_10px_16px_rgba(0,0,0,0.6)]"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dialogue Balon Percakapan Pelanggan */}
          <Dialogue customer={currentCustomer} />
        </div>

        {/* ==================================================================
            LAYER z-30: INTERACTIVE HOTSPOTS DI ATAS GAMBAR ASLI
            (Rak Sabun di kiri, Timbangan Digital di meja, Buku Nota, Laci Kas)
        ================================================================== */}
        <CashierTable />

        {/* ==================================================================
            LAYER z-40: OVERLAYS UI/HUD & MODAL UI (STRUK / EOD)
        ================================================================== */}
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

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

  // Resolve customer sprite URL
  const getCustomerSprite = () => {
    if (!currentCustomer) return null;
    if (currentCustomer.spriteUrl) return currentCustomer.spriteUrl;
    switch (currentCustomer.type) {
      case 'anak_kos':
        return '/assets/characters/sprite-anak-kos-clean.png';
      case 'ibu_ibu':
        return '/assets/characters/sprite-ibu-hamil-clean.png';
      case 'pegawai_bumn':
        return '/assets/characters/sprite-pegawai-bumn-clean.png';
      default:
        return '/assets/characters/sprite-anak-kos-clean.png';
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
            Yang sudah memuat Rak Sabun lengkap di kiri, Meja Kasir di kanan,
            Timbangan Digital, dan Buku Nota di atas meja!
        ================================================================== */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Toko Buka (Rolling Door Terbuka ke Jalan) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/props/Toko Buka.jpg"
            alt="Toko Laundry Buka"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Toko Tutup (Rolling Door Besi Tertutup) dengan animasi transisi */}
          <motion.div
            initial={false}
            animate={{
              opacity: isOpen ? 0 : 1,
              pointerEvents: isOpen ? 'none' : 'auto',
            }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
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
            LAYER z-10: SPRITE PELANGGAN (Anak Kos / Ibu Hamil / Pegawai BUMN)
            Berjalan menuju depan meja kasir (koordinat x: ~38%)
        ================================================================== */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence>
            {currentCustomer && (
              <motion.div
                key={currentCustomer.id}
                initial={{ x: '-120%', opacity: 0 }}
                animate={{
                  x: currentCustomer.status === 'KELUAR' ? '-120%' : '140%',
                  opacity: 1,
                }}
                exit={{ x: '-120%', opacity: 0 }}
                transition={{
                  duration: currentCustomer.status === 'KELUAR' ? 2.0 : 2.2,
                  ease: 'easeInOut',
                }}
                className="absolute bottom-[2%] left-0 w-[180px] sm:w-[230px] md:w-[270px] h-[340px] sm:h-[400px] md:h-[460px] flex flex-col items-center justify-end z-10"
              >
                {/* Character Sprite with Walk / Idle Bob */}
                <motion.div
                  animate={{
                    y:
                      currentCustomer.status === 'MASUK' || currentCustomer.status === 'KELUAR'
                        ? [0, -10, 0]
                        : [0, -3, 0],
                  }}
                  transition={{
                    duration:
                      currentCustomer.status === 'MASUK' || currentCustomer.status === 'KELUAR'
                        ? 0.38
                        : 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative flex flex-col items-center select-none h-full justify-end"
                >
                  {/* High-Res Transparent Character Artwork */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getCustomerSprite() || '/assets/characters/sprite-anak-kos-clean.png'}
                    alt={currentCustomer.name}
                    className="h-full w-auto max-h-[95%] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.65)]"
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

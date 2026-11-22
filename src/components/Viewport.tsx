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
            LAYER z-0: JALAN RAYA (Layer 1 Jalan.jpg)
            Latar paling belakang yang terlihat menembus pintu ruko
        ================================================================== */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Base Road Image from User Props */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/props/Layer 1 Jalan.jpg"
            alt="Layer 1 Jalan Raya"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Time-of-day atmospheric tint */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-1000 ${
              isNight
                ? 'bg-indigo-950/45 mix-blend-multiply'
                : isSunset
                ? 'bg-amber-600/30 mix-blend-color-burn'
                : 'bg-transparent'
            }`}
          />

          {/* Passing casual street motorbikes / ambiance */}
          <motion.div
            animate={{ x: ['120%', '-30%'] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[22%] left-0 z-0 opacity-80 pointer-events-none"
          >
            <div className="flex items-center gap-1 bg-blue-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow border border-blue-400">
              🛵 Honda Vario 160
            </div>
          </motion.div>
        </div>

        {/* ==================================================================
            LAYER z-10: SPRITE PELANGGAN (Anak Kos / Ibu Hamil / Pegawai BUMN)
            Berjalan dari kiri menuju meja kasir
        ================================================================== */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence>
            {currentCustomer && (
              <motion.div
                key={currentCustomer.id}
                initial={{ x: '-120%', opacity: 0 }}
                animate={{
                  x: currentCustomer.status === 'KELUAR' ? '-120%' : '110%',
                  opacity: 1,
                }}
                exit={{ x: '-120%', opacity: 0 }}
                transition={{
                  duration: currentCustomer.status === 'KELUAR' ? 2.2 : 2.4,
                  ease: 'easeInOut',
                }}
                className="absolute bottom-[8%] left-0 w-[180px] sm:w-[220px] md:w-[260px] h-[300px] sm:h-[360px] md:h-[400px] flex flex-col items-center justify-end z-10"
              >
                {/* Character Sprite with Walk / Idle Bob */}
                <motion.div
                  animate={{
                    y:
                      currentCustomer.status === 'MASUK' || currentCustomer.status === 'KELUAR'
                        ? [0, -8, 0]
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
                    className="h-full w-auto max-h-[92%] object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.6)]"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dialogue Balon Percakapan */}
          <Dialogue customer={currentCustomer} />
        </div>

        {/* ==================================================================
            LAYER z-20: RUKO TOKO LAUNDRY & ROLLING DOOR BESI
            Layer 3 Toko Laundry dengan green-screen tembus jalan + Rolling Door
        ================================================================== */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Toko Laundry Structure (Layer 3 Clean dengan Doorway Transparan) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/props/layer-3-toko-clean.png"
            alt="Layer 3 Toko Laundry"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
          />

          {/* Upper Rolling Door Shutter Roll Frame */}
          <div className="absolute top-0 left-0 right-0 h-8 sm:h-10 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-b-2 border-zinc-700 shadow-lg flex items-center justify-between px-6 z-25 opacity-95">
            <span className="text-[9px] font-black tracking-widest text-zinc-400 font-mono">
              LONFRI AUTOMATIC SHUTTER
            </span>
            <div className="flex gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'}`} />
              <span className="text-[8px] font-bold text-zinc-300 uppercase">
                {isOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>

          {/* 
            ANIMATED ROLLING DOOR (Pintu Geser Besi)
            Menggunakan asset rolling door yang diekstrak dari Toko Tutup.jpg
            Naik-turun secara mulus dengan Framer Motion
          */}
          <motion.div
            animate={{
              y: isOpen ? '-98%' : '0%',
            }}
            transition={{
              type: 'spring',
              stiffness: 65,
              damping: 17,
            }}
            className="absolute top-8 sm:top-10 left-0 right-0 bottom-0 z-22 flex flex-col justify-between overflow-hidden shadow-2xl pointer-events-none"
          >
            {/* Real Rolling Door Texture from User Assets */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/props/rolling-door-clean.png"
              alt="Rolling Door Tutup"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />

            {/* Closed Sign Plaque at Bottom of Door */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950/90 border-2 border-zinc-700 px-6 py-2 rounded-xl shadow-2xl flex flex-col items-center">
              <div className="bg-rose-600 text-white font-black text-xs sm:text-sm px-4 py-0.5 rounded shadow tracking-widest uppercase border border-rose-400">
                TOKO TUTUP
              </div>
              <span className="text-[9px] text-zinc-300 font-bold mt-1">
                Klik tombol &apos;BUKA TOKO&apos; di atas untuk melayani pelanggan
              </span>
            </div>
          </motion.div>
        </div>

        {/* ==================================================================
            LAYER z-30: DETAIL PEGAWAI, RAK SABUN, TIMBANGAN DIGITAL, & MEJA KASIR
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

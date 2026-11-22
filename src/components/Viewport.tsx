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
import { ShoppingBag } from 'lucide-react';

export const Viewport: React.FC = () => {
  const isOpen = useGameStore((state) => state.isOpen);
  const currentCustomer = useGameStore((state) => state.currentCustomer);
  const currentGameTime = useGameStore((state) => state.currentGameTime);

  // Hook into the game loop
  const { nextCustomerIn, triggerNextCustomerNow } = useGameLoop();

  // Time-based lighting effect (08:00 is morning sun, 12:00 is bright day, 17:00-18:00 is sunset golden hour)
  const [hours] = currentGameTime.split(':').map(Number);
  const isSunset = hours >= 16;
  const isNight = hours >= 18;

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-slate-950 p-0 sm:p-2 md:p-4 select-none">
      {/* 
        ======================================================================
        RESPONSIVE 16:9 CONTAINER LOCK
        ======================================================================
      */}
      <div className="relative w-full max-w-[1280px] aspect-[16/9] max-h-[96vh] overflow-hidden bg-slate-900 shadow-2xl sm:rounded-2xl border border-slate-800">
        
        {/* ==================================================================
            LAYER z-0: JALAN RAYA & LATAR BELAKANG (public/assets/bg/bg-road.png)
        ================================================================== */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Sky Gradient with Time-of-Day transition */}
          <div
            className={`absolute inset-0 transition-colors duration-1000 ${
              isNight
                ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-amber-950'
                : isSunset
                ? 'bg-gradient-to-b from-orange-400 via-amber-200 to-sky-300'
                : 'bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-100'
            }`}
          />

          {/* Road / Outdoor Background Image fallback with CSS stylized scenery */}
          <div className="absolute inset-0 bg-[url('/assets/bg/bg-road.png')] bg-cover bg-bottom opacity-90" />

          {/* City Silhouettes & Outdoor Street Details */}
          <div className="absolute bottom-[20%] left-0 right-0 h-[35%] pointer-events-none opacity-40">
            {/* Buildings Skyline */}
            <div className="w-full h-full flex items-end justify-between px-6 gap-3">
              <div className="w-24 h-48 bg-slate-700/60 rounded-t" />
              <div className="w-16 h-36 bg-slate-600/60 rounded-t" />
              <div className="w-32 h-56 bg-slate-800/60 rounded-t" />
              <div className="w-20 h-40 bg-slate-700/60 rounded-t" />
              <div className="w-28 h-52 bg-slate-600/60 rounded-t" />
            </div>
          </div>

          {/* Outdoor Asphalt Road */}
          <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-gradient-to-t from-zinc-800 via-zinc-700 to-zinc-600 border-t-4 border-zinc-500">
            {/* Road Markings */}
            <div className="absolute top-1/2 left-0 right-0 h-2 flex justify-around opacity-60">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-16 h-2 bg-yellow-400 rounded-sm" />
              ))}
            </div>

            {/* Sidewalk Curb */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 border-b border-slate-500" />
          </div>

          {/* Distant passing motorbikes/cars for casual street vibe */}
          <motion.div
            animate={{ x: ['110%', '-20%'] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-[16%] left-0 z-0 opacity-75 pointer-events-none"
          >
            <div className="flex items-center gap-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow">
              🛵 Honda Beat
            </div>
          </motion.div>
        </div>

        {/* ==================================================================
            LAYER z-10: SPRITE PELANGGAN (Anak Kos / Ibu-ibu)
            Animasikan dengan Framer Motion dari kiri menuju meja kasir
        ================================================================== */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <AnimatePresence>
            {currentCustomer && (
              <motion.div
                key={currentCustomer.id}
                initial={{ x: '-120%', opacity: 0 }}
                animate={{
                  x: currentCustomer.status === 'KELUAR' ? '-120%' : '180%',
                  opacity: 1,
                }}
                exit={{ x: '-120%', opacity: 0 }}
                transition={{
                  duration: currentCustomer.status === 'KELUAR' ? 2.2 : 2.4,
                  ease: 'easeInOut',
                }}
                className="absolute bottom-[10%] left-0 w-[140px] sm:w-[170px] h-[260px] sm:h-[300px] flex flex-col items-center justify-end"
              >
                {/* Customer Character Sprite */}
                <motion.div
                  animate={{
                    y: currentCustomer.status === 'MASUK' || currentCustomer.status === 'KELUAR' ? [0, -6, 0] : [0, -2, 0],
                  }}
                  transition={{
                    duration: currentCustomer.status === 'MASUK' || currentCustomer.status === 'KELUAR' ? 0.4 : 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative flex flex-col items-center select-none"
                >
                  {/* Customer Type 1: ANAK KOS */}
                  {currentCustomer.type === 'anak_kos' ? (
                    <div className="relative flex flex-col items-center">
                      {/* Head & Cap/Hair */}
                      <div className="relative w-14 sm:w-16 h-14 sm:h-16 bg-amber-200 rounded-full border-2 border-slate-900 shadow-md overflow-hidden flex flex-col items-center">
                        {/* Trendy Cap or Hair */}
                        <div className="absolute top-0 w-full h-7 bg-red-600 rounded-t-full border-b border-red-800">
                          {/* Cap visor */}
                          <div className="absolute bottom-0 -right-2 w-7 h-2 bg-red-700 rounded-r-full" />
                        </div>
                        {/* Eyes */}
                        <div className="absolute top-8 flex gap-2.5">
                          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                        </div>
                        {/* College student glasses */}
                        <div className="absolute top-7 flex gap-1">
                          <div className="w-3.5 h-3.5 border-2 border-slate-800 rounded-full" />
                          <div className="w-1 h-0.5 bg-slate-800 self-center" />
                          <div className="w-3.5 h-3.5 border-2 border-slate-800 rounded-full" />
                        </div>
                      </div>

                      {/* Body & Hoodie/T-Shirt */}
                      <div className="relative w-22 sm:w-26 h-24 sm:h-28 bg-emerald-600 rounded-t-2xl border-2 border-slate-900 shadow flex flex-col items-center pt-2">
                        {/* College backpack straps */}
                        <div className="absolute left-2 top-0 w-2 h-full bg-slate-800/60 rounded" />
                        <div className="absolute right-2 top-0 w-2 h-full bg-slate-800/60 rounded" />
                        <span className="text-[7px] font-black text-emerald-200 bg-emerald-800/80 px-1 rounded mt-3">
                          KAMPUS
                        </span>
                      </div>

                      {/* Jeans & Sneakers */}
                      <div className="flex gap-2 -mt-1">
                        <div className="w-4 h-16 bg-blue-800 border-x border-slate-900" />
                        <div className="w-4 h-16 bg-blue-800 border-x border-slate-900" />
                      </div>
                      <div className="flex gap-4 -mt-1">
                        <div className="w-6 h-3 bg-white rounded-b-md border border-slate-900" />
                        <div className="w-6 h-3 bg-white rounded-b-md border border-slate-900" />
                      </div>

                      {/* Big Laundry Bag held in hand (if entering) */}
                      {currentCustomer.status === 'MASUK' && (
                        <div className="absolute -right-5 bottom-12 w-12 h-14 bg-blue-500 rounded-2xl border-2 border-slate-900 shadow-lg flex items-center justify-center text-white">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Customer Type 2: IBU-IBU RUMAH TANGGA */
                    <div className="relative flex flex-col items-center">
                      {/* Head & Hair with Roll Rambut / Sanggul */}
                      <div className="relative w-15 sm:w-17 h-15 sm:h-17 bg-amber-200 rounded-full border-2 border-slate-900 shadow-md overflow-hidden flex flex-col items-center">
                        {/* Hair Rollers / Daster Mom Hair */}
                        <div className="absolute top-0 w-full h-8 bg-slate-900 rounded-t-full flex justify-around px-1 pt-0.5">
                          <div className="w-3 h-3 bg-pink-400 rounded-full border border-pink-600" />
                          <div className="w-3 h-3 bg-pink-400 rounded-full border border-pink-600" />
                          <div className="w-3 h-3 bg-pink-400 rounded-full border border-pink-600" />
                        </div>
                        {/* Eyes */}
                        <div className="absolute top-9 flex gap-3">
                          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                        </div>
                        {/* Friendly Smile */}
                        <div className="absolute top-12 w-3.5 h-1.5 border-b-2 border-rose-600 rounded-full" />
                      </div>

                      {/* Body & Floral Daster Batik */}
                      <div className="relative w-26 sm:w-30 h-28 sm:h-32 bg-gradient-to-b from-purple-600 to-indigo-700 rounded-t-3xl border-2 border-slate-900 shadow flex flex-col items-center pt-2">
                        {/* Batik Floral Dots */}
                        <div className="grid grid-cols-3 gap-2 opacity-50 mt-2">
                          <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-pink-300 rounded-full" />
                          <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                        </div>
                        <span className="text-[7px] font-black text-purple-200 bg-purple-900/80 px-1 rounded mt-4">
                          BATIK DASTER
                        </span>
                      </div>

                      {/* Slippers / Sandal Jepit */}
                      <div className="flex gap-3 -mt-1">
                        <div className="w-6 h-3 bg-teal-400 rounded-b-md border border-slate-900" />
                        <div className="w-6 h-3 bg-teal-400 rounded-b-md border border-slate-900" />
                      </div>

                      {/* Big Laundry Bag held in hand */}
                      {currentCustomer.status === 'MASUK' && (
                        <div className="absolute -right-6 bottom-14 w-14 h-16 bg-purple-400 rounded-2xl border-2 border-slate-900 shadow-lg flex items-center justify-center text-white">
                          <ShoppingBag className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dialogue Balon Percakapan */}
          <Dialogue customer={currentCustomer} />
        </div>

        {/* ==================================================================
            LAYER z-20: RUKO TERBUKA / TERTUTUP & ROLLING DOOR BESI
            Pintu geser besi naik-turun berdasarkan state `isOpen`
        ================================================================== */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Ruko Outer Frame / Walls (Left, Right, Ceiling) */}
          <div className="absolute inset-0 border-[12px] sm:border-[16px] border-amber-950 pointer-events-none" />

          {/* Store Interior Wall & Floor Pattern */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/80 via-slate-900/60 to-slate-950/90 pointer-events-none" />

          {/* Ceramic Tile Lines on Store Floor */}
          <div className="absolute bottom-0 left-0 right-0 h-[36%] bg-gradient-to-t from-slate-900 via-slate-800 to-transparent opacity-70 pointer-events-none">
            <div className="w-full h-full grid grid-cols-8 border-t border-slate-700/60">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border-r border-slate-700/40 h-full" />
              ))}
            </div>
          </div>

          {/* Store Signage Plaque at top */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-blue-700 border-2 border-yellow-400 px-6 py-1 rounded-b-xl shadow-xl flex items-center gap-2">
            <span className="font-black text-yellow-300 text-xs sm:text-sm tracking-widest uppercase drop-shadow">
              🏪 LONFRI LAUNDRY
            </span>
            <span className="text-[10px] text-white font-mono bg-blue-900 px-1.5 py-0.5 rounded">
              KILOAN & SATUAN
            </span>
          </div>

          {/* Upper Rolling Door Enclosure Box (props/rolling-door-roll.png) */}
          <div className="absolute top-0 left-0 right-0 h-9 sm:h-11 bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 border-b-4 border-zinc-950 shadow-2xl flex items-center justify-between px-6 z-25">
            <div className="w-8 h-4 bg-zinc-950 rounded-sm border border-zinc-700" />
            <div className="text-[9px] font-black text-zinc-400 tracking-widest uppercase font-mono">
              ROLLING SHUTTER SYSTEM v1.0
            </div>
            <div className="w-8 h-4 bg-zinc-950 rounded-sm border border-zinc-700" />
          </div>

          {/* 
            ANIMATED ROLLING DOOR (Pintu Geser Besi)
            Slides smoothly down to close store when isOpen === false
            Slides smoothly up when isOpen === true
          */}
          <motion.div
            animate={{
              y: isOpen ? '-96%' : '0%',
            }}
            transition={{
              type: 'spring',
              stiffness: 70,
              damping: 18,
            }}
            className="absolute top-9 sm:top-11 left-0 right-0 bottom-0 bg-gradient-to-b from-zinc-600 via-zinc-500 to-zinc-700 border-b-8 border-zinc-900 shadow-2xl z-22 flex flex-col justify-between overflow-hidden"
          >
            {/* Metal Slats Texture */}
            <div className="w-full h-full flex flex-col justify-between py-1 opacity-90">
              {Array.from({ length: 22 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-2.5 sm:h-3.5 bg-gradient-to-b from-zinc-400 via-zinc-300 to-zinc-500 border-b border-zinc-700 shadow-sm"
                />
              ))}
            </div>

            {/* Bottom Handle & Padlock when closed */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-800 border-2 border-zinc-950 px-6 py-2 rounded-lg shadow-2xl flex flex-col items-center">
              <div className="w-16 h-3 bg-zinc-950 rounded-full mb-1 border border-zinc-600" />
              <div className="bg-rose-600 text-white font-black text-xs sm:text-sm px-3 py-0.5 rounded shadow tracking-widest uppercase border border-rose-400">
                TOKO TUTUP
              </div>
              <span className="text-[9px] text-zinc-400 font-bold mt-1">
                Gunakan tombol &apos;BUKA TOKO&apos; di atas
              </span>
            </div>
          </motion.div>
        </div>

        {/* ==================================================================
            LAYER z-30: DETAIL PEGAWAI, RAK SABUN, TIMBANGAN, & MEJA KASIR
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

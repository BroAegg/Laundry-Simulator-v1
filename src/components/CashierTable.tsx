'use client';

import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, FileText, Coins, ShoppingBag, AlertCircle, Plus, Check } from 'lucide-react';

export const CashierTable: React.FC = () => {
  const currentCustomer = useGameStore((state) => state.currentCustomer);
  const scaleWeight = useGameStore((state) => state.scaleWeight);
  const isWeighing = useGameStore((state) => state.isWeighing);
  const isDrawerOpen = useGameStore((state) => state.isDrawerOpen);
  const soapStock = useGameStore((state) => state.soapStock);

  const timbangPakaian = useGameStore((state) => state.timbangPakaian);
  const beliSabun = useGameStore((state) => state.beliSabun);
  const setDrawerOpen = useGameStore((state) => state.setDrawerOpen);
  const setReceiptModalOpen = useGameStore((state) => state.setReceiptModalOpen);
  const tambahTransaksi = useGameStore((state) => state.tambahTransaksi);
  const kurangiStokSabun = useGameStore((state) => state.kurangiStokSabun);
  const updateCustomerStatus = useGameStore((state) => state.updateCustomerStatus);
  const setNotification = useGameStore((state) => state.setNotification);

  const [scaleSpinning, setScaleSpinning] = useState(false);

  // Handle clicking the digital scale
  const handleScaleClick = () => {
    if (!currentCustomer) {
      setNotification('Timbangan kosong. Tunggu pelanggan datang dengan cucian!');
      return;
    }

    if (currentCustomer.status !== 'MENUNGGU' && currentCustomer.status !== 'DITIMBANG') {
      setNotification(`Pelanggan sedang dalam status: ${currentCustomer.status}`);
      return;
    }

    setScaleSpinning(true);
    setTimeout(() => {
      timbangPakaian();
      setScaleSpinning(false);
    }, 600);
  };

  // Handle clicking the logbook to open receipt modal
  const handleLogbookClick = () => {
    if (!currentCustomer) {
      setNotification('Belum ada transaksi pelanggan saat ini.');
      return;
    }

    if (!currentCustomer.measuredWeight) {
      setNotification('Timbang pakaian terlebih dahulu di timbangan digital!');
      return;
    }

    setReceiptModalOpen(true);
  };

  // Handle clicking the cash drawer to accept payment
  const handleDrawerPayment = () => {
    if (!currentCustomer) {
      setDrawerOpen(!isDrawerOpen);
      return;
    }

    if (currentCustomer.status === 'BAYAR') {
      // Execute payment
      setDrawerOpen(true);

      // Deduct 1 soap stock
      const soapOk = kurangiStokSabun(1);
      if (!soapOk) {
        // soap was 0
        setNotification('⚠️ Sabun habis! Segera beli sabun baru di rak.');
      }

      // Add transaction
      tambahTransaksi({
        customerType: currentCustomer.type,
        service: currentCustomer.service,
        weight: currentCustomer.measuredWeight || currentCustomer.targetWeight,
        price: currentCustomer.price,
      });

      // Update customer status to KELUAR
      updateCustomerStatus('KELUAR');

      // Drawer closes after 1.8s
      setTimeout(() => {
        setDrawerOpen(false);
      }, 1800);
    } else {
      setDrawerOpen(!isDrawerOpen);
    }
  };

  const isScaleClickable = currentCustomer?.status === 'MENUNGGU';
  const isNotaClickable = currentCustomer?.status === 'DITIMBANG';
  const isPaymentClickable = currentCustomer?.status === 'BAYAR';

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30">
      {/* ========================================================
          LEFT SIDE: SOAP SHELF (Rak Sabun & Bahan Cuci)
      ======================================================== */}
      <div className="absolute left-[3%] bottom-[12%] w-[15%] h-[58%] pointer-events-auto flex flex-col justify-end">
        {/* Shelf Structure */}
        <div className="relative w-full h-full bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-3 border-amber-800 rounded-t-xl shadow-2xl p-2 flex flex-col justify-between">
          {/* Shelf Header */}
          <div className="bg-amber-800/90 text-amber-100 text-[10px] sm:text-xs font-black text-center py-1 rounded shadow border border-amber-700 tracking-wider flex items-center justify-center gap-1">
            <span>RAK SABUN</span>
            <span className="bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded-full font-mono text-[9px]">
              {soapStock}/20
            </span>
          </div>

          {/* Shelves Tiers with Soap Bottles */}
          <div className="flex-1 flex flex-col justify-around py-1">
            {/* Tier 1 (Top) */}
            <div className="relative border-b-4 border-amber-950 pb-1 flex justify-center items-end gap-1 px-1 h-[28%]">
              {Array.from({ length: Math.min(6, Math.max(0, soapStock - 14)) }).map((_, i) => (
                <div
                  key={`t1-${i}`}
                  className="w-3 sm:w-4 h-7 sm:h-9 bg-gradient-to-t from-blue-600 via-blue-400 to-cyan-200 rounded-t border border-blue-900 shadow-sm relative group"
                  title="Detergen Cair Wangi"
                >
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full mx-auto -mt-1" />
                </div>
              ))}
            </div>

            {/* Tier 2 (Middle) */}
            <div className="relative border-b-4 border-amber-950 pb-1 flex justify-center items-end gap-1 px-1 h-[28%]">
              {Array.from({ length: Math.min(7, Math.max(0, soapStock - 7)) }).map((_, i) => (
                <div
                  key={`t2-${i}`}
                  className="w-3 sm:w-4 h-7 sm:h-9 bg-gradient-to-t from-pink-600 via-pink-400 to-rose-200 rounded-t border border-pink-900 shadow-sm relative"
                  title="Pewangi Floral"
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full mx-auto -mt-1" />
                </div>
              ))}
            </div>

            {/* Tier 3 (Bottom) */}
            <div className="relative border-b-4 border-amber-950 pb-1 flex justify-center items-end gap-1 px-1 h-[28%]">
              {Array.from({ length: Math.min(7, soapStock) }).map((_, i) => (
                <div
                  key={`t3-${i}`}
                  className="w-3 sm:w-4 h-7 sm:h-9 bg-gradient-to-t from-emerald-600 via-emerald-400 to-teal-200 rounded-t border border-emerald-900 shadow-sm relative"
                  title="Pembersih Noda Ekstra"
                >
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mx-auto -mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Buy Soap Action Button */}
          <button
            onClick={() => beliSabun()}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-slate-950 font-black text-[10px] sm:text-xs py-1.5 rounded-lg shadow-md border border-yellow-300 flex items-center justify-center gap-1 transition-all"
            title="Beli 10 botol sabun seharga Rp20.000"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>BELI (+10) Rp20k</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          CASHIER WORKER (Mas-mas Pegawai Lanyard Biru)
          Positioned behind the counter (right center)
      ======================================================== */}
      <div className="absolute right-[22%] sm:right-[24%] bottom-[24%] w-[130px] sm:w-[160px] h-[220px] sm:h-[260px] flex flex-col items-center justify-end pointer-events-none select-none">
        {/* Worker Avatar & Lanyard */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex flex-col items-center"
        >
          {/* Head & Hair */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-amber-200 rounded-full border-2 border-slate-800 shadow-inner overflow-hidden flex flex-col items-center">
            {/* Hair */}
            <div className="absolute top-0 w-full h-8 bg-slate-900 rounded-t-full" />
            <div className="absolute top-5 left-1 w-3 h-3 bg-slate-900 rounded-full" />
            <div className="absolute top-5 right-1 w-3 h-3 bg-slate-900 rounded-full" />

            {/* Eyes */}
            <div className="absolute top-9 flex gap-3">
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
              <div className="w-2 h-2 bg-slate-900 rounded-full" />
            </div>
            {/* Smile */}
            <div className="absolute top-13 w-4 h-2 border-b-2 border-slate-800 rounded-full" />
          </div>

          {/* Body & Polo Shirt with Blue Lanyard */}
          <div className="relative w-28 sm:w-34 h-28 sm:h-32 bg-slate-100 rounded-t-3xl border-3 border-slate-800 shadow-lg flex flex-col items-center pt-2">
            {/* Collar */}
            <div className="w-8 h-4 border-b-2 border-slate-400 rotate-45 -mt-1 -ml-4" />
            <div className="w-8 h-4 border-b-2 border-slate-400 -rotate-45 -mt-4 ml-4" />

            {/* Blue Lanyard Strap */}
            <div className="absolute top-1 w-12 h-16 border-x-3 border-blue-600 rounded-b-2xl pointer-events-none flex flex-col items-center justify-end">
              {/* ID Badge Card */}
              <div className="w-8 h-10 bg-white border-2 border-blue-600 rounded shadow-md -mb-3 flex flex-col items-center p-0.5">
                <div className="w-4 h-3 bg-blue-500 rounded-sm mb-0.5" />
                <div className="w-5 h-1 bg-slate-400 rounded-full mb-0.5" />
                <span className="text-[6px] font-black text-blue-900">KASIR</span>
              </div>
            </div>

            {/* Store Chest Logo */}
            <div className="absolute right-3 top-4 text-[8px] font-black text-blue-700 bg-blue-100 px-1 rounded border border-blue-300">
              LONFRI
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================
          CASHIER COUNTER (Meja Kasir Utama)
          Extends across right side
      ======================================================== */}
      <div className="absolute right-[3%] bottom-[5%] w-[76%] h-[26%] pointer-events-auto">
        {/* Table Top Surface */}
        <div className="relative w-full h-[32%] bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 border-t-4 border-b-4 border-amber-900 rounded-t-xl shadow-2xl flex items-center justify-around px-4">
          {/* ===================================================
              ITEM 1: DIGITAL SCALE (Timbangan Digital)
          =================================================== */}
          <div className="relative -top-9 sm:-top-11 flex flex-col items-center">
            {/* Scale Click Hint */}
            <AnimatePresence>
              {isScaleClickable && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute -top-7 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-blue-300 animate-bounce whitespace-nowrap"
                >
                  👉 KLIK TIMBANG
                </motion.div>
              )}
            </AnimatePresence>

            {/* Laundry Bag placed on scale when customer waiting */}
            {currentCustomer && currentCustomer.status !== 'KELUAR' && (
              <motion.div
                initial={{ scale: 0, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                className="relative -mb-1 w-14 sm:w-18 h-12 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl border-2 border-slate-900 shadow-md flex items-center justify-center text-white"
              >
                <ShoppingBag className="w-6 sm:w-8 h-6 sm:h-8 opacity-80" />
                <span className="absolute bottom-1 right-1 text-[8px] bg-slate-900/80 text-yellow-300 font-mono px-1 rounded">
                  {currentCustomer.measuredWeight ? `${currentCustomer.measuredWeight}kg` : 'Cucian'}
                </span>
              </motion.div>
            )}

            {/* The Digital Scale Device */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleScaleClick}
              className={`cursor-pointer w-28 sm:w-36 bg-gradient-to-b from-slate-200 to-slate-400 border-3 border-slate-800 rounded-lg p-1.5 shadow-xl flex flex-col items-center transition-all ${
                isScaleClickable ? 'ring-4 ring-blue-400 ring-offset-2 animate-pulse' : ''
              }`}
            >
              {/* Stainless Steel Weighing Platform */}
              <div className="w-full h-3 bg-gradient-to-r from-slate-300 via-slate-100 to-slate-300 border border-slate-500 rounded shadow-inner mb-1" />

              {/* Digital LED Display */}
              <div className="w-full bg-slate-950 border-2 border-slate-700 rounded px-2 py-1 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase">TIMBANGAN</span>
                <div className="font-mono font-black text-emerald-400 text-xs sm:text-sm tracking-wider">
                  {scaleSpinning || isWeighing ? (
                    <span className="animate-spin inline-block">--.-</span>
                  ) : scaleWeight !== null && currentCustomer ? (
                    `${scaleWeight.toFixed(1)} kg`
                  ) : (
                    '0.0 kg'
                  )}
                </div>
              </div>

              {/* Brand Label */}
              <div className="text-[7px] text-slate-600 font-bold tracking-widest mt-0.5">
                SONIX DIGITAL v1
              </div>
            </motion.div>
          </div>

          {/* ===================================================
              ITEM 2: LOGBOOK & RECEIPT CREATOR (Buku Nota)
          =================================================== */}
          <div className="relative -top-6 sm:-top-8 flex flex-col items-center">
            {/* Nota Click Hint */}
            <AnimatePresence>
              {isNotaClickable && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute -top-7 bg-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-yellow-200 animate-bounce whitespace-nowrap"
                >
                  👉 BUAT NOTA
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogbookClick}
              className={`cursor-pointer w-20 sm:w-26 bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-900 rounded-lg p-2 shadow-xl flex flex-col items-center transition-all ${
                isNotaClickable ? 'ring-4 ring-amber-400 ring-offset-2 animate-pulse' : ''
              }`}
            >
              <FileText className="w-6 h-6 text-amber-900 mb-1" />
              <span className="text-[9px] font-black text-amber-950 uppercase tracking-tighter">
                BUKU NOTA
              </span>
              <span className="text-[7px] text-amber-700 font-medium">Klik buka struk</span>
            </motion.div>
          </div>

          {/* ===================================================
              ITEM 3: CASH REGISTER (Laci Uang Kasir)
          =================================================== */}
          <div className="relative -top-6 sm:-top-8 flex flex-col items-center">
            {/* Payment Click Hint */}
            <AnimatePresence>
              {isPaymentClickable && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute -top-7 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-emerald-300 animate-bounce whitespace-nowrap"
                >
                  👉 TERIMA UANG
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDrawerPayment}
              className={`cursor-pointer w-22 sm:w-28 bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-950 rounded-lg p-2 shadow-xl flex flex-col items-center text-white transition-all ${
                isPaymentClickable ? 'ring-4 ring-emerald-400 ring-offset-2 animate-pulse' : ''
              }`}
            >
              <Coins className="w-6 h-6 text-yellow-400 mb-1" />
              <span className="text-[9px] font-black uppercase tracking-tight text-yellow-300">
                LACI KAS
              </span>
              <span className="text-[7px] text-slate-300 font-medium">
                {isDrawerOpen ? 'Terbuka' : 'Tertutup'}
              </span>
            </motion.div>
          </div>
        </div>

        {/* Table Body & Under-counter Animated Drawer */}
        <div className="relative w-full h-[68%] bg-gradient-to-b from-amber-800 via-amber-900 to-amber-950 border-x-4 border-b-4 border-amber-950 p-2 shadow-2xl flex justify-end pr-8">
          {/* Animated Cash Drawer Compartment */}
          <motion.div
            animate={{
              y: isDrawerOpen ? 25 : 0,
              scale: isDrawerOpen ? 1.05 : 1,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-44 sm:w-56 h-12 sm:h-14 bg-gradient-to-b from-zinc-800 to-zinc-950 border-2 border-zinc-900 rounded shadow-2xl p-1.5 flex items-center justify-between"
          >
            {/* Drawer Slots with Banknotes and Coins */}
            <div className="flex-1 flex gap-1 h-full">
              <div className="flex-1 bg-emerald-900/60 border border-emerald-700/70 rounded flex flex-col items-center justify-center p-0.5">
                <span className="text-[7px] font-black text-emerald-400">Rp50k/100k</span>
                <div className="w-full h-1.5 bg-red-400/80 rounded-sm mt-0.5" />
                <div className="w-full h-1.5 bg-blue-400/80 rounded-sm mt-0.5" />
              </div>
              <div className="flex-1 bg-amber-900/60 border border-amber-700/70 rounded flex flex-col items-center justify-center p-0.5">
                <span className="text-[7px] font-black text-amber-400">Rp10k/20k</span>
                <div className="w-full h-1.5 bg-green-500/80 rounded-sm mt-0.5" />
                <div className="w-full h-1.5 bg-purple-500/80 rounded-sm mt-0.5" />
              </div>
              <div className="w-8 bg-zinc-900 border border-zinc-700 rounded flex flex-col items-center justify-center">
                <span className="text-[6px] font-bold text-yellow-300">KOIN</span>
                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-300 shadow-sm" />
              </div>
            </div>

            {/* Keyhole Handle */}
            <div className="ml-1.5 w-3 h-6 bg-zinc-700 rounded-sm flex items-center justify-center border border-zinc-600">
              <div className="w-1 h-2 bg-zinc-950 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

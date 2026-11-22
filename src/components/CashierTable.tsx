'use client';

import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Coins } from 'lucide-react';

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
  const [shelfHovered, setShelfHovered] = useState(false);

  // Handle clicking the digital scale
  const handleScaleClick = () => {
    if (!currentCustomer) {
      setNotification('Timbangan kosong. Tunggu pelanggan datang membawa cucian!');
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
    }, 500);
  };

  // Handle clicking the logbook
  const handleLogbookClick = () => {
    if (!currentCustomer) {
      setNotification('Belum ada transaksi pelanggan saat ini.');
      return;
    }

    if (!currentCustomer.measuredWeight) {
      setNotification('Timbang pakaian terlebih dahulu pada timbangan digital!');
      return;
    }

    setReceiptModalOpen(true);
  };

  // Handle receiving payment
  const handleDrawerPayment = () => {
    if (!currentCustomer) {
      setDrawerOpen(!isDrawerOpen);
      return;
    }

    if (currentCustomer.status === 'BAYAR') {
      setDrawerOpen(true);

      const soapOk = kurangiStokSabun(1);
      if (!soapOk) {
        setNotification('⚠️ Sabun habis! Segera beli sabun baru di rak.');
      }

      tambahTransaksi({
        customerType: currentCustomer.type,
        service: currentCustomer.service,
        weight: currentCustomer.measuredWeight || currentCustomer.targetWeight,
        price: currentCustomer.price,
      });

      updateCustomerStatus('KELUAR');

      setTimeout(() => {
        setDrawerOpen(false);
      }, 1600);
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
          HOTSPOT 1: RAK SABUN (Sisi Kiri Gambar x: 0%..43%, y: 6%..94%)
      ======================================================== */}
      <div
        onMouseEnter={() => setShelfHovered(true)}
        onMouseLeave={() => setShelfHovered(false)}
        className="absolute left-[1%] top-[8%] w-[42%] h-[84%] pointer-events-auto cursor-pointer rounded-2xl transition-all duration-300 hover:bg-yellow-400/5 group p-3"
        title="Rak Sabun & Deterjen Laundry (Klik untuk beli stok)"
      >
        {/* Floating Shelf Status & Restock Tooltip */}
        <div
          className={`transition-all duration-300 ${
            shelfHovered || soapStock <= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}
        >
          <div className="bg-slate-950/95 border-2 border-yellow-400 text-yellow-300 px-3 py-1.5 rounded-xl shadow-2xl backdrop-blur-sm inline-flex items-center gap-2">
            <span className="text-xs font-black tracking-wider uppercase">🧴 RAK SABUN</span>
            <span className="bg-yellow-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full font-mono">
              {soapStock}/20
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                beliSabun();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow border border-emerald-300 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Beli +10 (Rp20k)</span>
            </button>
          </div>
        </div>

        {/* Low soap alert banner if running out */}
        {soapStock <= 2 && (
          <div className="mt-2 bg-rose-950/90 border-2 border-rose-500 text-rose-200 text-xs font-black px-3 py-1.5 rounded-xl shadow-xl animate-bounce self-start backdrop-blur-sm">
            ⚠️ Stok Sabun Menipis ({soapStock} tersisa)! Klik untuk restock.
          </div>
        )}
      </div>

      {/* ========================================================
          HOTSPOT 2: TIMBANGAN DIGITAL (Di Atas Meja Kasir)
          Koordinat gambar asli: left 55%..68%, top 44%..64%
      ======================================================== */}
      {/* 2A. Natural Laundry Basket on scale tray when measured */}
      {currentCustomer && currentCustomer.status !== 'KELUAR' && currentCustomer.status !== 'MASUK' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute left-[58.5%] top-[40%] -translate-x-1/2 z-28 pointer-events-none flex flex-col items-center"
        >
          {/* Subtle laundry bundle sitting on the tray */}
          <div className="w-14 sm:w-16 h-8 bg-gradient-to-t from-sky-600 to-indigo-400 rounded-t-full border-2 border-slate-900 shadow-md flex items-center justify-center">
            <span className="text-[9px] font-black text-white font-mono drop-shadow">
              {currentCustomer.measuredWeight ? `${currentCustomer.measuredWeight}kg` : 'Cucian'}
            </span>
          </div>
        </motion.div>
      )}

      {/* 2B. Clickable Scale Area */}
      <div
        onClick={handleScaleClick}
        className={`absolute left-[54.5%] top-[43%] w-[13.5%] h-[21%] pointer-events-auto cursor-pointer rounded-2xl transition-all duration-300 flex flex-col items-center justify-start pt-1 ${
          isScaleClickable
            ? 'ring-2 ring-emerald-400/90 bg-emerald-400/10 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
            : 'hover:bg-blue-400/5'
        }`}
        title="Timbangan Digital (Klik untuk menimbang cucian)"
      >
        {/* Floating Hint above scale */}
        <AnimatePresence>
          {isScaleClickable && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="-mt-7 bg-emerald-500 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-2xl border-2 border-emerald-200 animate-bounce whitespace-nowrap"
            >
              ⚖️ KLIK TIMBANG
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2C. Precision Digital LED Readout over scale screen */}
      <div
        onClick={handleScaleClick}
        className="absolute left-[56.5%] top-[55.5%] w-[8.2%] h-[4.2%] pointer-events-auto cursor-pointer bg-slate-950 border border-slate-700 rounded px-1 flex items-center justify-center shadow-inner z-32"
      >
        <div className="font-mono font-black text-emerald-400 text-xs sm:text-sm tracking-widest drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]">
          {scaleSpinning || isWeighing ? (
            <span className="animate-spin inline-block">--.-</span>
          ) : scaleWeight !== null && currentCustomer ? (
            `${scaleWeight.toFixed(1)}kg`
          ) : (
            '0.0kg'
          )}
        </div>
      </div>

      {/* ========================================================
          HOTSPOT 3: BUKU NOTA & PULPEN (Di Atas Meja Kasir)
          Koordinat gambar asli: left 71%..82%, top 52%..64%
      ======================================================== */}
      <div
        onClick={handleLogbookClick}
        className={`absolute left-[70.5%] top-[52%] w-[11.5%] h-[13%] pointer-events-auto cursor-pointer rounded-2xl transition-all duration-300 flex flex-col items-center justify-start pt-1 ${
          isNotaClickable
            ? 'ring-2 ring-amber-400/90 bg-amber-400/15 shadow-[0_0_20px_rgba(251,191,36,0.6)]'
            : 'hover:bg-amber-400/5'
        }`}
        title="Buku Catatan Nota Transaksi (Klik untuk cetak struk)"
      >
        {/* Floating Hint above notebook */}
        <AnimatePresence>
          {isNotaClickable && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="-mt-7 bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-2xl border-2 border-yellow-200 animate-bounce whitespace-nowrap"
            >
              📝 BUAT NOTA
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================
          HOTSPOT 4: AREA KASIR / LACI UANG (Bawah Meja Kasir)
          Koordinat gambar asli: left 52%..88%, top 66%..92%
      ======================================================== */}
      <div
        onClick={handleDrawerPayment}
        className={`absolute left-[52%] top-[66%] w-[36%] h-[24%] pointer-events-auto cursor-pointer rounded-2xl transition-all duration-300 flex flex-col items-center justify-center ${
          isPaymentClickable
            ? 'ring-2 ring-emerald-400/90 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.5)]'
            : 'hover:bg-slate-400/5'
        }`}
        title="Meja Kasir & Laci Kas (Klik untuk simpan pembayaran)"
      >
        {/* Payment Action Prompt Button */}
        <AnimatePresence>
          {isPaymentClickable && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-2 animate-bounce"
            >
              <Coins className="w-4 h-4 text-yellow-300" />
              <span>TERIMA UANG (KLIK KASIR)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drawer open notification indicator */}
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950/90 border-2 border-yellow-400 text-yellow-300 text-xs font-mono font-bold px-3 py-1 rounded-xl shadow-lg"
          >
            💰 Kas bertambah + Uang disimpan!
          </motion.div>
        )}
      </div>
    </div>
  );
};

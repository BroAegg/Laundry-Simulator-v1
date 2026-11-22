'use client';

import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

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
    }, 450);
  };

  // Handle clicking the notebook
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
      }, 1500);
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
          HOTSPOT 1: RAK SABUN (Sisi Kiri x: 0%..43%, y: 6%..94%)
          Klik langsung pada rak untuk beli sabun
      ======================================================== */}
      <div
        onClick={() => beliSabun()}
        className="absolute left-[2%] top-[8%] w-[40%] h-[84%] pointer-events-auto cursor-pointer rounded-2xl transition-colors hover:bg-yellow-400/5"
        title="Rak Sabun (Klik untuk beli 10 botol seharga Rp20.000)"
      >
        {/* Warning badge if soap is low */}
        {soapStock <= 2 && (
          <div className="absolute top-2 left-4 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg animate-bounce border border-rose-300">
            ⚠️ Stok Sabun Tinggal {soapStock}! Klik Rak untuk Restock
          </div>
        )}
      </div>

      {/* ========================================================
          HOTSPOT 2: TIMBANGAN DIGITAL (Di Atas Meja Kasir)
          Koordinat: left 55%..68%, top 44%..64%
      ======================================================== */}
      <div
        onClick={handleScaleClick}
        className={`absolute left-[54.5%] top-[43%] w-[13.5%] h-[20%] pointer-events-auto cursor-pointer rounded-xl transition-all flex flex-col items-center justify-start ${
          isScaleClickable ? 'cursor-pointer' : ''
        }`}
        title="Timbangan Digital (Klik untuk menimbang cucian)"
      >
        {/* Clean floating action hint */}
        <AnimatePresence>
          {isScaleClickable && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="-mt-7 bg-emerald-500 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-xl border border-emerald-200 animate-bounce whitespace-nowrap"
            >
              ⚖️ KLIK TIMBANG
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Precision Digital LED Readout over scale screen */}
      <div
        onClick={handleScaleClick}
        className="absolute left-[56.5%] top-[55.5%] w-[8.2%] h-[4.2%] pointer-events-auto cursor-pointer bg-slate-950/95 border border-slate-700 rounded px-1 flex items-center justify-center shadow-inner z-32"
      >
        <div className="font-mono font-black text-emerald-400 text-xs sm:text-sm tracking-widest drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]">
          {scaleSpinning || isWeighing ? (
            <span className="animate-spin inline-block">--.-</span>
          ) : scaleWeight !== null && currentCustomer && currentCustomer.status !== 'MASUK' && currentCustomer.status !== 'MENUNGGU' ? (
            `${scaleWeight.toFixed(1)}kg`
          ) : (
            '0.0kg'
          )}
        </div>
      </div>

      {/* ========================================================
          HOTSPOT 3: BUKU NOTA & PULPEN (Di Atas Meja Kasir)
          Koordinat: left 70.5%..82%, top 52%..64%
      ======================================================== */}
      <div
        onClick={handleLogbookClick}
        className="absolute left-[70.5%] top-[52%] w-[11.5%] h-[13%] pointer-events-auto cursor-pointer rounded-xl transition-all flex flex-col items-center justify-start"
        title="Buku Catatan Nota Transaksi (Klik untuk buat nota)"
      >
        {/* Clean floating action hint */}
        <AnimatePresence>
          {isNotaClickable && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="-mt-7 bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-xl border border-yellow-200 animate-bounce whitespace-nowrap"
            >
              📝 BUAT NOTA
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================
          HOTSPOT 4: AREA KASIR / LACI UANG (Bawah Meja Kasir)
          Koordinat: left 52%..88%, top 66%..92%
      ======================================================== */}
      <div
        onClick={handleDrawerPayment}
        className="absolute left-[52%] top-[66%] w-[36%] h-[24%] pointer-events-auto cursor-pointer rounded-2xl transition-all flex flex-col items-center justify-center"
        title="Meja Kasir & Laci Kas (Klik untuk simpan pembayaran)"
      >
        {/* Payment Action Prompt Button */}
        <AnimatePresence>
          {isPaymentClickable && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-2 animate-bounce"
            >
              <Coins className="w-4 h-4 text-yellow-300" />
              <span>💵 KLIK UNTUK TERIMA UANG</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drawer open notification indicator */}
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
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

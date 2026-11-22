'use client';

import React from 'react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Check, X, Sparkles, AlertTriangle } from 'lucide-react';

export const ModalReceipt: React.FC = () => {
  const isReceiptModalOpen = useGameStore((state) => state.isReceiptModalOpen);
  const setReceiptModalOpen = useGameStore((state) => state.setReceiptModalOpen);
  const currentCustomer = useGameStore((state) => state.currentCustomer);
  const currentGameTime = useGameStore((state) => state.currentGameTime);
  const currentDay = useGameStore((state) => state.currentDay);
  const soapStock = useGameStore((state) => state.soapStock);
  const updateCustomerStatus = useGameStore((state) => state.updateCustomerStatus);
  const setNotification = useGameStore((state) => state.setNotification);

  if (!isReceiptModalOpen || !currentCustomer) return null;

  const weight = currentCustomer.measuredWeight || currentCustomer.targetWeight;
  const isExpress = currentCustomer.service === 'express';
  const ratePerKg = isExpress ? 12000 : 7000;
  const totalPrice = weight * ratePerKg;

  const handlePrintReceipt = () => {
    // Check soap stock warning
    if (soapStock <= 0) {
      setNotification('⚠️ Perhatian: Stok sabun habis! Kamu tetap bisa buat nota tapi jangan lupa beli sabun.');
    }

    // Advance customer status to BAYAR
    updateCustomerStatus('BAYAR');
    setReceiptModalOpen(false);
    setNotification(
      `Nota dicetak! Total Rp${totalPrice.toLocaleString('id-ID')}. Klik Laci Kasir untuk menerima uang.`
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-amber-50 text-slate-800 rounded-xl shadow-2xl border-4 border-amber-900/30 overflow-hidden"
        >
          {/* Top Decorative Receipt Jagged Header */}
          <div className="bg-blue-600 text-white p-3 text-center border-b-2 border-dashed border-slate-300">
            <h2 className="text-lg font-black tracking-widest uppercase flex items-center justify-center gap-1.5">
              <span>🧺 LONFRI LAUNDRY</span>
            </h2>
            <p className="text-[10px] text-blue-100 font-medium">
              Jl. Mawar Melati No. 42 • WhatsApp: 0812-LONFRI-01
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-4 space-y-3 font-mono text-xs">
            {/* Meta Info */}
            <div className="flex justify-between border-b border-dashed border-slate-300 pb-2 text-[11px] text-slate-600">
              <div>
                <p>HARI : #{currentDay}</p>
                <p>JAM  : {currentGameTime} WIB</p>
              </div>
              <div className="text-right">
                <p>KASIR: MAS PEKERJA</p>
                <p>KODE : {currentCustomer.id}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white/80 p-2.5 rounded border border-slate-200 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pelanggan:</span>
                <span className="font-bold text-slate-900">{currentCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tipe Pelanggan:</span>
                <span className="font-bold uppercase">
                  {currentCustomer.type === 'anak_kos' ? 'Anak Kos' : 'Ibu-Ibu Rumah Tangga'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pilihan Layanan:</span>
                <span
                  className={`font-black uppercase px-1 rounded ${
                    isExpress ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {isExpress ? '⚡ Express Kilat' : '✨ Reguler Bersih'}
                </span>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-slate-700">
                <span>Berat Pakaian:</span>
                <span className="font-bold">{weight} kg</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Tarif / kg:</span>
                <span>Rp{ratePerKg.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Detergen & Pewangi:</span>
                <span className="text-emerald-600 font-bold">TERMASUK (1 Unit)</span>
              </div>
            </div>

            {/* Total Price Bar */}
            <div className="border-t-2 border-b-2 border-slate-800 py-2.5 flex justify-between items-center bg-yellow-100/70 px-2 rounded">
              <span className="text-sm font-black text-slate-900 uppercase">TOTAL BAYAR:</span>
              <span className="text-base font-black text-blue-700">
                Rp{totalPrice.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Soap stock warning */}
            {soapStock <= 2 && (
              <div className="text-[10px] text-amber-700 bg-amber-100 p-1.5 rounded flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Stok sabun tersisa {soapStock}. Segera restock!</span>
              </div>
            )}

            <p className="text-center text-[10px] text-slate-500 italic pt-1">
              *** Terima kasih telah mempercayakan pakaian Anda di Lonfri! ***
            </p>
          </div>

          {/* Action Buttons */}
          <div className="p-3 bg-slate-100 border-t border-slate-200 flex gap-2">
            <button
              onClick={() => setReceiptModalOpen(false)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-200 active:scale-95 text-xs font-bold flex items-center justify-center gap-1 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Batal</span>
            </button>
            <button
              onClick={handlePrintReceipt}
              className="flex-[2] px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg active:scale-95 text-xs font-black shadow-lg flex items-center justify-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>CETAK & SERAHKAN NOTA</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

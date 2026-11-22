'use client';

import React from 'react';
import { Customer } from '../types/game';
import { motion } from 'framer-motion';
import { Zap, Sparkles, Scale } from 'lucide-react';

interface DialogueProps {
  customer: Customer | null;
}

export const Dialogue: React.FC<DialogueProps> = ({ customer }) => {
  if (!customer || customer.status === 'MASUK') {
    return null;
  }

  const isExpress = customer.service === 'express';

  const getTypeLabel = () => {
    switch (customer.type) {
      case 'anak_kos':
        return '🎒 Anak Kos';
      case 'ibu_ibu':
        return '🤰 Ibu Hamil';
      case 'pegawai_bumn':
        return '👔 Pegawai BUMN';
      default:
        return 'Pelanggan';
    }
  };

  const getTypeStyle = () => {
    switch (customer.type) {
      case 'anak_kos':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ibu_ibu':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'pegawai_bumn':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 10 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="absolute bottom-[44%] left-[26%] sm:left-[30%] -translate-x-1/2 z-35 max-w-[260px] sm:max-w-[340px] pointer-events-none select-none"
    >
      <div className="relative bg-white/95 border-3 border-slate-800 rounded-2xl p-3 shadow-2xl text-slate-800 backdrop-blur-sm">
        {/* Header with Name & Service Badge */}
        <div className="flex items-center justify-between gap-1.5 border-b border-slate-200 pb-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-slate-900 tracking-tight">
              {customer.name}
            </span>
            <span
              className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border ${getTypeStyle()}`}
            >
              {getTypeLabel()}
            </span>
          </div>

          <div
            className={`flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
              isExpress
                ? 'bg-amber-100 text-amber-800 border border-amber-400 animate-pulse'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {isExpress ? <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-600" /> : <Sparkles className="w-2.5 h-2.5 text-emerald-600" />}
            <span>{customer.service}</span>
          </div>
        </div>

        {/* Spoken Text */}
        <p className="text-xs sm:text-[13px] font-medium leading-snug text-slate-700">
          &ldquo;{customer.dialogue}&rdquo;
        </p>

        {/* Quick Helper hint depending on status */}
        <div className="mt-2 pt-1.5 border-t border-dashed border-slate-200 flex items-center justify-between text-[10px]">
          {customer.status === 'MENUNGGU' && (
            <span className="text-blue-600 font-bold flex items-center gap-1">
              <Scale className="w-3 h-3 text-blue-500 animate-bounce" />
              👉 Klik Timbangan untuk menimbang!
            </span>
          )}
          {customer.status === 'DITIMBANG' && (
            <span className="text-amber-600 font-bold">
              👉 Klik Buku Nota di meja untuk cetak struk!
            </span>
          )}
          {customer.status === 'BAYAR' && (
            <span className="text-emerald-600 font-bold">
              👉 Klik Laci Uang untuk terima pembayaran!
            </span>
          )}
          {customer.status === 'KELUAR' && (
            <span className="text-slate-500 italic">
              👋 Pelanggan pamit meninggalkan toko...
            </span>
          )}

          {customer.measuredWeight && (
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1 rounded">
              {customer.measuredWeight} kg
            </span>
          )}
        </div>

        {/* Speech Bubble Arrow pointing down towards customer */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-800" />
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white" />
      </div>
    </motion.div>
  );
};

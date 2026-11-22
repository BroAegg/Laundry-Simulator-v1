'use client';

import React from 'react';
import { Customer } from '../types/game';
import { motion } from 'framer-motion';
import { Zap, Sparkles } from 'lucide-react';

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
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ibu_ibu':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'pegawai_bumn':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: 8 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="absolute bottom-[66%] left-[45%] -translate-x-1/2 z-40 max-w-[270px] sm:max-w-[320px] pointer-events-none select-none"
    >
      <div className="relative bg-white/98 border-2 border-slate-800 rounded-2xl p-2.5 shadow-2xl text-slate-800 backdrop-blur-md">
        {/* Header with Name & Service Badge */}
        <div className="flex items-center justify-between gap-1 border-b border-slate-200 pb-1 mb-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-extrabold text-[11px] sm:text-xs text-slate-900 truncate">
              {customer.name}
            </span>
            <span
              className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border flex-shrink-0 ${getTypeStyle()}`}
            >
              {getTypeLabel()}
            </span>
          </div>

          <div
            className={`flex items-center gap-0.5 text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
              isExpress
                ? 'bg-amber-100 text-amber-800 border border-amber-400'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {isExpress ? <Zap className="w-2.5 h-2.5 text-amber-600 fill-amber-600" /> : <Sparkles className="w-2.5 h-2.5 text-emerald-600" />}
            <span>{customer.service}</span>
          </div>
        </div>

        {/* Spoken Text */}
        <p className="text-[11px] sm:text-xs font-medium leading-snug text-slate-700">
          &ldquo;{customer.dialogue}&rdquo;
        </p>

        {/* Helper status text */}
        <div className="mt-1 pt-1 border-t border-dashed border-slate-200 flex items-center justify-between text-[9px]">
          {customer.status === 'MENUNGGU' && (
            <span className="text-emerald-700 font-bold">
              👉 Klik Timbangan di meja kasir
            </span>
          )}
          {customer.status === 'DITIMBANG' && (
            <span className="text-amber-700 font-bold">
              👉 Klik Buku Nota di meja untuk cetak struk
            </span>
          )}
          {customer.status === 'BAYAR' && (
            <span className="text-blue-700 font-bold">
              👉 Klik Meja Kasir untuk terima uang
            </span>
          )}
          {customer.status === 'KELUAR' && (
            <span className="text-slate-500 italic">
              👋 Pamit meninggalkan toko...
            </span>
          )}

          {customer.measuredWeight && (
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1 rounded">
              {customer.measuredWeight} kg
            </span>
          )}
        </div>

        {/* Speech Bubble Arrow pointing down towards customer */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800" />
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-white" />
      </div>
    </motion.div>
  );
};

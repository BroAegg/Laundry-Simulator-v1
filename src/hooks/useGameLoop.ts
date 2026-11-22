'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { Customer, CustomerType, ServiceType } from '../types/game';

const ANAK_KOS_NAMES = ['Rian', 'Dimas', 'Bagas', 'Bayu', 'Adit', 'Fajar', 'Rizky'];
const IBU_IBU_NAMES = ['Bu Tejo', 'Bu Siti', 'Bu Ratna', 'Bu Wati', 'Bu Sri', 'Bu Nur', 'Bu Dewi'];

const DIALOGUES = {
  anak_kos: {
    masuk: 'Permisi mas, mau nitip laundry pakaian kuliah nih...',
    menunggu: 'Tolong ditimbang ya mas, pilih layanan reguler aja biar hemat.',
    menungguExpress: 'Mas, tolong pilih yang express ya, besok ada presentasi sidang skripsi!',
    ditimbang: 'Oke, pas banget beratnya. Tolong buatin nota transaksinya ya!',
    bayar: 'Ini uangnya pas ya mas. Nanti kalau sudah selesai saya ambil.',
    selesai: 'Makasih banyak ya mas, sukses terus usahanya!',
  },
  ibu_ibu: {
    masuk: 'Halo mas ganteng, ibu mau cuci sprei sama pakaian anak-anak nih!',
    menunggu: 'Tolong ditimbang hati-hati ya, deterjennya yang wangi semerbak!',
    menungguExpress: 'Mas, bisa kilat express gak ya? Besok sore mau ada arisan keluarga!',
    ditimbang: 'Sip mantap, harganya cocok. Jangan lupa bikinin nota rinciannya ya.',
    bayar: 'Ini uangnya ya mas, uang kembaliannya ambil aja buat uang saku.',
    selesai: 'Matur nuwun ya mas, besok-besok ibu balik langganan lagi ke sini!',
  },
};

export function useGameLoop() {
  const isOpen = useGameStore((state) => state.isOpen);
  const currentGameTime = useGameStore((state) => state.currentGameTime);
  const setGameTime = useGameStore((state) => state.setGameTime);
  const currentCustomer = useGameStore((state) => state.currentCustomer);
  const setCurrentCustomer = useGameStore((state) => state.setCurrentCustomer);
  const updateCustomerStatus = useGameStore((state) => state.updateCustomerStatus);
  const setNotification = useGameStore((state) => state.setNotification);

  const [nextCustomerIn, setNextCustomerIn] = useState<number>(15);
  const isTransitioningRef = useRef<boolean>(false);

  // Generate a random customer
  const spawnCustomer = useCallback(() => {
    const isAnakKos = Math.random() > 0.45;
    const type: CustomerType = isAnakKos ? 'anak_kos' : 'ibu_ibu';
    const names = isAnakKos ? ANAK_KOS_NAMES : IBU_IBU_NAMES;
    const name = names[Math.floor(Math.random() * names.length)];
    const service: ServiceType = Math.random() > 0.35 ? 'reguler' : 'express';
    // Random weight between 2 and 9 kg (inclusive)
    const targetWeight = Math.floor(Math.random() * 8) + 2;
    const dialogues = DIALOGUES[type];
    const initialDialogue = service === 'express' ? dialogues.menungguExpress : dialogues.menunggu;

    const newCustomer: Customer = {
      id: `CUST-${Date.now().toString().slice(-4)}`,
      name,
      type,
      service,
      targetWeight,
      price: 0,
      status: 'MASUK',
      dialogue: initialDialogue,
      hasLaundryBag: true,
      avatarVariant: Math.floor(Math.random() * 3),
    };

    setCurrentCustomer(newCustomer);
    setNotification(`Pelanggan baru datang: ${name} (${type === 'anak_kos' ? 'Anak Kos' : 'Ibu-ibu'})`);

    // Animate walking from entrance to counter (2.5s)
    setTimeout(() => {
      updateCustomerStatus('MENUNGGU');
    }, 2400);
  }, [setCurrentCustomer, updateCustomerStatus, setNotification]);

  // Game Clock Loop: Advances time when shop is open (08:00 - 18:00)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      const [hoursStr, minutesStr] = currentGameTime.split(':');
      let hours = parseInt(hoursStr, 10);
      let minutes = parseInt(minutesStr, 10);

      // Advance by 5 game minutes every 1.2 real seconds
      minutes += 5;
      if (minutes >= 60) {
        hours += 1;
        minutes = 0;
      }

      if (hours >= 18) {
        setGameTime('18:00');
        setNotification('⏰ Pukul 18:00! Jam operasional toko telah selesai. Silakan klik TUTUP TOKO.');
      } else {
        const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        setGameTime(formatted);
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [isOpen, currentGameTime, setGameTime, setNotification]);

  // Customer Spawning Loop: Every 15-20 seconds if open and no active customer
  useEffect(() => {
    if (!isOpen) {
      setNextCustomerIn(15);
      return;
    }

    const [hours] = currentGameTime.split(':').map(Number);
    if (hours >= 18) {
      return; // No more new customers arriving after 18:00
    }

    if (currentCustomer) {
      return; // Already has customer at counter
    }

    const interval = setInterval(() => {
      setNextCustomerIn((prev) => {
        if (prev <= 1) {
          spawnCustomer();
          return Math.floor(Math.random() * 6) + 15; // 15-20 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, currentGameTime, currentCustomer, spawnCustomer]);

  // Handle customer exit transition
  useEffect(() => {
    if (currentCustomer?.status === 'KELUAR' && !isTransitioningRef.current) {
      isTransitioningRef.current = true;
      const timeout = setTimeout(() => {
        setCurrentCustomer(null);
        isTransitioningRef.current = false;
        setNextCustomerIn(Math.floor(Math.random() * 5) + 15);
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [currentCustomer?.status, setCurrentCustomer]);

  // Manual trigger for testing or impatient players
  const triggerNextCustomerNow = useCallback(() => {
    if (!currentCustomer && isOpen) {
      spawnCustomer();
      setNextCustomerIn(15);
    }
  }, [currentCustomer, isOpen, spawnCustomer]);

  return {
    nextCustomerIn,
    triggerNextCustomerNow,
  };
}

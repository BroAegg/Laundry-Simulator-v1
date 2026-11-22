'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { Customer, CustomerType, ServiceType } from '../types/game';

const ANAK_KOS_NAMES = ['Rian', 'Dimas', 'Bagas', 'Bayu', 'Adit', 'Fajar', 'Rizky'];
const IBU_IBU_NAMES = ['Bu Siti (Hamil)', 'Bu Ratna', 'Bu Wati', 'Bu Sri', 'Bu Nur', 'Bu Dewi'];
const PEGAWAI_BUMN_NAMES = ['Pak Hendra (PLN)', 'Pak Satria (Pertamina)', 'Mas Danang (KAI)', 'Pak Fajar (Telkom)', 'Mas Budi (Mandiri)'];

const DIALOGUES = {
  anak_kos: {
    masuk: 'Permisi mas, mau nitip laundry pakaian kuliah nih...',
    menunggu: 'Tolong ditimbang ya mas, pilih layanan reguler aja biar hemat uang saku.',
    menungguExpress: 'Mas, tolong pilih yang express ya, besok ada presentasi sidang skripsi!',
    ditimbang: 'Oke, pas banget beratnya. Tolong buatin nota transaksinya ya!',
    bayar: 'Ini uangnya pas ya mas. Nanti kalau sudah selesai saya ambil.',
    selesai: 'Makasih banyak ya mas, sukses terus usahanya!',
  },
  ibu_ibu: {
    masuk: 'Halo mas, ibu mau cuci sprei dan persiapan baju bayi nih, rada berat bawaannya...',
    menunggu: 'Tolong ditimbang ya mas, deterjennya pakai yang wangi dan lembut ya!',
    menungguExpress: 'Bisa kilat express gak ya mas? Besok lusa mau acara syukuran keluarga!',
    ditimbang: 'Sip mantap harganya cocok. Tolong cetak notanya ya mas.',
    bayar: 'Ini uangnya pas ya mas, terima kasih banyak sudah dibantu.',
    selesai: 'Matur nuwun ya mas, besok-besok ibu balik langganan lagi ke sini!',
  },
  pegawai_bumn: {
    masuk: 'Selamat pagi mas, mau antar kemeja dinas dan celana seragam kantor nih...',
    menunggu: 'Tolong ditimbang ya mas, kemejanya disetrika licin dan wangi ya.',
    menungguExpress: 'Tolong yang kilat Express ya mas, besok ada apel pagi dan audit direksi!',
    ditimbang: 'Oke, total harganya sesuai. Tolong buatin nota resminya ya mas buat SPJ.',
    bayar: 'Ini uangnya ya mas, terima kasih banyak kerjasamanya.',
    selesai: 'Terima kasih mas, nanti seragam kantor saya rutin laundry di sini.',
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

  // Generate a random customer with specific bawa & idle sprites
  const spawnCustomer = useCallback(() => {
    const roll = Math.random();
    let type: CustomerType;
    let name: string;
    let spriteBawaUrl: string;
    let spriteIdleUrl: string;

    if (roll < 0.35) {
      type = 'anak_kos';
      name = ANAK_KOS_NAMES[Math.floor(Math.random() * ANAK_KOS_NAMES.length)];
      spriteBawaUrl = '/assets/characters/anak-kos-bawa.png';
      spriteIdleUrl = '/assets/characters/anak-kos-idle.png';
    } else if (roll < 0.7) {
      type = 'ibu_ibu';
      name = IBU_IBU_NAMES[Math.floor(Math.random() * IBU_IBU_NAMES.length)];
      spriteBawaUrl = '/assets/characters/ibu-hamil-bawa.png';
      spriteIdleUrl = '/assets/characters/ibu-hamil-idle.png';
    } else {
      type = 'pegawai_bumn';
      name = PEGAWAI_BUMN_NAMES[Math.floor(Math.random() * PEGAWAI_BUMN_NAMES.length)];
      spriteBawaUrl = '/assets/characters/pegawai-bumn-bawa.png';
      spriteIdleUrl = '/assets/characters/pegawai-bumn-idle.png';
    }

    const expressChance = type === 'pegawai_bumn' ? 0.6 : 0.35;
    const service: ServiceType = Math.random() < expressChance ? 'express' : 'reguler';
    const targetWeight = Math.floor(Math.random() * 8) + 2; // 2 - 9 kg
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
      spriteBawaUrl,
      spriteIdleUrl,
    };

    setCurrentCustomer(newCustomer);
    const typeLabel =
      type === 'anak_kos'
        ? '🎒 Anak Kos'
        : type === 'ibu_ibu'
        ? '🤰 Ibu Hamil'
        : '👔 Pegawai BUMN';
    setNotification(`Pelanggan baru datang: ${name} (${typeLabel})`);

    // Animate walking to front of counter (2.2s)
    setTimeout(() => {
      updateCustomerStatus('MENUNGGU');
    }, 2200);
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
      }, 2300);

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

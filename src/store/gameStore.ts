import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Customer, CustomerStatus, DailyReport, DailyTransaction } from '../types/game';

export interface GameState {
  // Core Required State
  currentDay: number;
  cash: number;
  soapStock: number; // default: 10, max: 20
  isOpen: boolean; // rolling door state
  currentGameTime: string; // 08:00 - 18:00
  dailyTransactions: DailyTransaction[];
  historyDailyReport: DailyReport[];

  // Daily Financial Tracking
  todayIncome: number;
  todayExpense: number;

  // Active Customer & Interaction States
  currentCustomer: Customer | null;
  scaleWeight: number | null;
  isWeighing: boolean;
  isDrawerOpen: boolean;
  isReceiptModalOpen: boolean;
  isEODModalOpen: boolean;
  gameSpeed: number; // multiplier
  notification: string | null;

  // Core Required Methods
  bukaToko: () => void;
  tutupToko: () => void;
  tambahTransaksi: (transaction: Omit<DailyTransaction, 'id'>) => void;
  kurangiStokSabun: (amount?: number) => boolean;
  beliSabun: () => boolean;
  nextDay: () => void;
  timbangPakaian: () => number | null;

  // Additional Helper Methods
  setCurrentCustomer: (customer: Customer | null) => void;
  updateCustomerStatus: (status: CustomerStatus) => void;
  setDrawerOpen: (open: boolean) => void;
  setReceiptModalOpen: (open: boolean) => void;
  setEODModalOpen: (open: boolean) => void;
  setGameTime: (time: string) => void;
  setNotification: (text: string | null) => void;
  resetGame: () => void;
}

const DEFAULT_START_TIME = '08:00';
const DEFAULT_CASH = 100000; // Rp 100.000 modal awal
const SOAP_BATCH_PRICE = 20000;
const SOAP_BATCH_AMOUNT = 10;
const SOAP_MAX_STOCK = 20;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentDay: 1,
      cash: DEFAULT_CASH,
      soapStock: 10,
      isOpen: false,
      currentGameTime: DEFAULT_START_TIME,
      dailyTransactions: [],
      historyDailyReport: [],

      todayIncome: 0,
      todayExpense: 0,

      currentCustomer: null,
      scaleWeight: null,
      isWeighing: false,
      isDrawerOpen: false,
      isReceiptModalOpen: false,
      isEODModalOpen: false,
      gameSpeed: 1,
      notification: null,

      bukaToko: () => {
        const { currentGameTime } = get();
        // If it's already 18:00 or later, cannot reopen on the same day without moving to next day
        const [hours] = currentGameTime.split(':').map(Number);
        if (hours >= 18) {
          set({
            notification: 'Waktu operasional sudah habis (18:00). Silakan tutup toko dan rekap hari ini!',
          });
          return;
        }

        set({
          isOpen: true,
          notification: 'Toko dibuka! Rolling door terangkat. Siap melayani pelanggan.',
        });
      },

      tutupToko: () => {
        const { currentDay, todayIncome, todayExpense, dailyTransactions, historyDailyReport } = get();

        // Calculate report
        const netProfit = todayIncome - todayExpense;
        const newReport: DailyReport = {
          day: currentDay,
          income: todayIncome,
          expense: todayExpense,
          netProfit,
          transactionsCount: dailyTransactions.length,
        };

        // If today report already exists in history, update it, otherwise push
        const existingIdx = historyDailyReport.findIndex((r) => r.day === currentDay);
        let updatedReports = [...historyDailyReport];
        if (existingIdx >= 0) {
          updatedReports[existingIdx] = newReport;
        } else {
          updatedReports.push(newReport);
        }

        set({
          isOpen: false,
          currentCustomer: null,
          isReceiptModalOpen: false,
          isEODModalOpen: true,
          historyDailyReport: updatedReports,
          notification: 'Toko ditutup! Rekap penjualan harian siap.',
        });
      },

      tambahTransaksi: (txData) => {
        const id = `TRX-${Date.now().toString().slice(-6)}`;
        const newTx: DailyTransaction = {
          id,
          ...txData,
          time: get().currentGameTime,
        };

        set((state) => ({
          dailyTransactions: [newTx, ...state.dailyTransactions],
          cash: state.cash + txData.price,
          todayIncome: state.todayIncome + txData.price,
          notification: `Transaksi ${id} berhasil! +Rp${txData.price.toLocaleString('id-ID')}`,
        }));
      },

      kurangiStokSabun: (amount = 1) => {
        const { soapStock } = get();
        if (soapStock < amount) {
          set({
            notification: '⚠️ Stok sabun habis! Beli sabun di rak terlebih dahulu.',
          });
          return false;
        }

        set((state) => ({
          soapStock: Math.max(0, state.soapStock - amount),
        }));
        return true;
      },

      beliSabun: () => {
        const { cash, soapStock } = get();

        if (soapStock + SOAP_BATCH_AMOUNT > SOAP_MAX_STOCK) {
          set({
            notification: `⚠️ Rak sabun penuh! Maksimal ${SOAP_MAX_STOCK} botol. (Stok saat ini: ${soapStock})`,
          });
          return false;
        }

        if (cash < SOAP_BATCH_PRICE) {
          set({
            notification: '⚠️ Uang kas tidak cukup untuk membeli sabun (Butuh Rp20.000)!',
          });
          return false;
        }

        set((state) => ({
          cash: state.cash - SOAP_BATCH_PRICE,
          soapStock: state.soapStock + SOAP_BATCH_AMOUNT,
          todayExpense: state.todayExpense + SOAP_BATCH_PRICE,
          notification: `Berhasil beli 10 botol sabun laundry (-Rp20.000). Stok: ${state.soapStock + SOAP_BATCH_AMOUNT}`,
        }));
        return true;
      },

      timbangPakaian: () => {
        const { currentCustomer } = get();
        if (!currentCustomer) {
          set({ notification: 'Tidak ada pakaian di timbangan!' });
          return null;
        }

        if (currentCustomer.status !== 'MENUNGGU' && currentCustomer.status !== 'DITIMBANG') {
          return null;
        }

        set({ isWeighing: true });

        const measured = currentCustomer.targetWeight;
        const ratePerKg = currentCustomer.service === 'express' ? 12000 : 7000;
        const price = measured * ratePerKg;

        set((state) => ({
          isWeighing: false,
          scaleWeight: measured,
          currentCustomer: state.currentCustomer
            ? {
                ...state.currentCustomer,
                measuredWeight: measured,
                price,
                status: 'DITIMBANG',
                dialogue: `Total beratnya ${measured} kg ya mas. Totalnya Rp${price.toLocaleString('id-ID')}. Tolong buatkan notanya ya!`,
              }
            : null,
          notification: `Timbangan selesai: ${measured} kg (${currentCustomer.service.toUpperCase()}) = Rp${price.toLocaleString('id-ID')}`,
        }));

        return measured;
      },

      nextDay: () => {
        set((state) => ({
          currentDay: state.currentDay + 1,
          currentGameTime: DEFAULT_START_TIME,
          isOpen: false,
          dailyTransactions: [],
          todayIncome: 0,
          todayExpense: 0,
          currentCustomer: null,
          scaleWeight: null,
          isWeighing: false,
          isDrawerOpen: false,
          isReceiptModalOpen: false,
          isEODModalOpen: false,
          notification: `Memulai Hari ke-${state.currentDay + 1}. Buka toko jam 08:00!`,
        }));
      },

      setCurrentCustomer: (customer) => set({ currentCustomer: customer }),

      updateCustomerStatus: (status) =>
        set((state) => ({
          currentCustomer: state.currentCustomer
            ? { ...state.currentCustomer, status }
            : null,
        })),

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      setReceiptModalOpen: (open) => set({ isReceiptModalOpen: open }),

      setEODModalOpen: (open) => set({ isEODModalOpen: open }),

      setGameTime: (time) => set({ currentGameTime: time }),

      setNotification: (text) => set({ notification: text }),

      resetGame: () => {
        set({
          currentDay: 1,
          cash: DEFAULT_CASH,
          soapStock: 10,
          isOpen: false,
          currentGameTime: DEFAULT_START_TIME,
          dailyTransactions: [],
          historyDailyReport: [],
          todayIncome: 0,
          todayExpense: 0,
          currentCustomer: null,
          scaleWeight: null,
          isWeighing: false,
          isDrawerOpen: false,
          isReceiptModalOpen: false,
          isEODModalOpen: false,
          notification: 'Game telah di-reset ke hari pertama!',
        });
      },
    }),
    {
      name: 'laundry-simulator-v1-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentDay: state.currentDay,
        cash: state.cash,
        soapStock: state.soapStock,
        dailyTransactions: state.dailyTransactions,
        historyDailyReport: state.historyDailyReport,
        todayIncome: state.todayIncome,
        todayExpense: state.todayExpense,
      }),
    }
  )
);

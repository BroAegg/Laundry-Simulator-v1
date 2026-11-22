export type CustomerType = 'anak_kos' | 'ibu_ibu' | 'pegawai_bumn';

export type ServiceType = 'reguler' | 'express';

export type CustomerStatus =
  | 'MASUK'
  | 'MENUNGGU'
  | 'DITIMBANG'
  | 'MENUNGGU_NOTA'
  | 'BAYAR'
  | 'KELUAR';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  service: ServiceType;
  targetWeight: number; // 1 - 10 kg
  measuredWeight?: number;
  price: number;
  status: CustomerStatus;
  dialogue: string;
  hasLaundryBag: boolean;
  avatarVariant: number;
  spriteBawaUrl: string;
  spriteIdleUrl: string;
}

export interface DailyTransaction {
  id: string;
  customerType: string;
  service: string;
  weight: number;
  price: number;
  time?: string;
}

export interface DailyReport {
  day: number;
  income: number;
  expense: number;
  netProfit: number;
  transactionsCount?: number;
}

# Laundry Simulator v1 (Game Web)

Proyek game simulasi bisnis 2D kasual berbasis web "Laundry Simulator v1". Fokus pengembangan v1 ini adalah manajemen transaksi dan penerimaan pelanggan (kasir & administrasi) di meja depan toko "LONFRI", menggunakan mekanik inventory, timbangan, transaksi, hingga evaluasi laporan keuangan harian (End of Day).

## 🛠️ Stack Teknologi & Deploy
- **Framework Utama**: Next.js 14+ (App Router) & TypeScript
- **State Management**: Zustand dengan Persist Middleware (ke LocalStorage untuk game save)
- **Animasi & Transisi**: Framer Motion
- **Gaya UI & Layout**: Tailwind CSS (Desain responsive di-lock pada rasio 16:9)
- **Audio Handling**: Howler.js (untuk FX suara tombol, timbangan, laci, & rolling door)
- **Platform Deploy**: Vercel

## 📂 Struktur Folder Proyek
/public
  /assets
    /bg
      - bg-road.png              # Jalan raya (latar paling belakang)
      - bg-store-open.png        # Toko terbuka (dengan pintu berlubang tembus ke jalan)
      - bg-store-closed.png      # Toko tertutup (rolling door tertutup)
    /props
      - rolling-door-roll.png    # Gulungan pintu atas ruko
      - scale-digital.png        # Timbangan di atas meja
      - cash-drawer.png          # Laci uang di bawah meja (tertutup/terbuka)
      - shelf.png                # Rak sebelah kiri ruko
      - logbook.png              # Buku catatan transaksi di meja
      - items-washing.png        # Botol detergen, sikat, dll di rak
    /ui
      - btn-action.png           # Tombol-tombol fungsional UI game
      - receipt-template.png     # Kertas struk transaksi
      - icon-coin.png            # Icon uang
      - bubble-chat.png          # Balon percakapan dialog
    /characters
      - sprite-pekerja-full.png  # Mas-mas pegawai (lanyard biru)
      - sprite-anak-kos-full.png # Pelanggan anak kos (bawa & tanpa cucian)
      - sprite-ibu-ibu-full.png  # Pelanggan ibu-ibu dasteran (bawa & tanpa cucian)

/src
  /app
    - page.tsx                   # Screen Manager utama (Menu / Gameplay / Rekap)
    - layout.tsx
  /components
    - Viewport.tsx               # Viewport 16:9 yang berisi semua sprite & background
    - Dashboard.tsx              # Overlay UI / HUD Game (Uang, Hari, Jam, Stok Sabun)
    - Dialogue.tsx               # Balon dialog pesanan & keluhan pelanggan
    - CashierTable.tsx           # Area interaktif timbangan, laci uang, logbook
    - ModalReceipt.tsx           # Overlay cetak struk transaksi
    - ModalEOD.tsx               # Screen Rekap Pendapatan Harian (End of Day)
  /store
    - gameStore.ts               # State game global (Zustand)
  /hooks
    - useGameLoop.ts             # Logika antrean pelanggan harian
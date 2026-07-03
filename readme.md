# ⚓ Pelabuhan Hijau v3: Muara Harapan

Selamat datang di **Pelabuhan Hijau v3**, sebuah game simulasi manajemen strategi di mana Anda ditunjuk sebagai pemimpin Pelabuhan Muara Harapan. Tugas Anda adalah mengelola pelabuhan ini selama **30 Hari**, menjaga keseimbangan antara keuntungan bisnis, kelestarian alam, dan kesejahteraan masyarakat.

---

## 🎯 Tujuan Permainan
Bertahan hidup selama 30 Hari operasional tanpa membiarkan satupun dari 6 Sumber Daya (Resources) menyentuh batas kritis (Game Over). Keputusan Anda selama 30 hari ini akan menentukan **1 dari 5 Ending** masa depan Pelabuhan Muara Harapan.

---

## 📊 6 Sumber Daya (Resources)
Anda harus terus memantau *Dashboard* di sebelah kiri layar. Jika indikator berkedip merah, Anda berada dalam bahaya!

1. 💰 **Dana (Maks 500, Kritis 0):** Uang kas pelabuhan. Digunakan untuk mendanai hampir semua aksi.
2. ⭐ **Reputasi (Maks 100, Kritis 10):** Kepercayaan publik dan investor luar terhadap pelabuhan Anda.
3. 🌊 **Lingkungan (Maks 100, Kritis 10):** Kesehatan ekosistem laut, terumbu karang, dan kebersihan air.
4. 👷 **SDM (Maks 100, Kritis 10):** Kondisi fisik, mental, dan loyalitas para pekerja pelabuhan.
5. 🏗️ **Infrastruktur (Maks 100, Kritis 5):** Kelayakan mesin, derek, dan bangunan pelabuhan.
6. 🤝 **Komunitas (Maks 100, Kritis 10):** Hubungan Anda dengan warga lokal dan nelayan tradisional.

*Catatan: Jika salah satu nilai menyentuh batas kritis, pelabuhan akan ditutup paksa dan permainan berakhir seketika (Game Over).*

---

## 👥 Pemimpin Pelabuhan (Karakter)
Di awal permainan, Anda wajib memilih 1 dari 3 karakter. Setiap karakter memberikan **Bonus Multiplier** saat Anda mendapatkan resource tertentu.

*   **Pak Bahari (Nelayan Senior):** Sangat ahli menjaga 🌊 Lingkungan (+40%) dan merangkul 🤝 Komunitas (+30%). Cocok untuk gaya bermain aman dan pro-rakyat.
*   **Bu Citra (Manajer Muda):** Jenius dalam meningkatkan ⭐ Reputasi (+40%) dan membangun 🏗️ Infrastruktur (+30%). Cocok untuk memodernisasi pelabuhan secara cepat.
*   **Pak Rendra (Direktur Bisnis):** Ahli mencetak 💰 Dana (+40%) dan memeras keringat 👷 SDM (+30%). Pilihan tepat bagi yang ingin untung besar dengan cepat.

---

## ⚙️ Cara Bermain (Core Loop)

Setiap hari (Hari 1 hingga 30), Anda akan melewati siklus berikut:

### 1. Eksekusi Aksi di Peta
Klik pada fasilitas-fasilitas di peta (Dermaga, Gudang, Kantor, Tambak, Kapal, Pasar) untuk memunculkan **Pop-up Menu Aksi**.
*   Setiap aksi membutuhkan **Biaya** (berwarna merah) dan memberikan **Hasil** (berwarna hijau).
*   Beberapa aksi besar memiliki **Cooldown** (waktu tunggu) beberapa hari sebelum fasilitas tersebut bisa digunakan lagi.

### 2. Gunakan Skill Aktif
Setiap karakter dibekali 1 Skill khusus (tombol ⚡ SKILL di kanan bawah). Gunakan di saat terdesak untuk mendapatkan suntikan sumber daya instan, namun perhatikan *cooldown*-nya!

### 3. Akhiri Hari
Jika dana tidak cukup atau semua fasilitas sedang *cooldown*, klik tombol **"AKHIRI HARI →"** untuk melangkah ke hari esok.

### 4. Hadapi Dilema Harian (Event Cards)
Setiap pagi, bersiaplah menghadapi kejadian acak tak terduga! Mulai dari penemuan kontainer ilegal, demonstrasi warga, hingga tawaran suap. Setiap pilihan memiliki **Trade-off** (pengorbanan). Memilih uang biasanya mengorbankan reputasi atau lingkungan, begitu pula sebaliknya.

---

## 🌪️ Skenario Dinamis
Seiring berjalannya waktu, Pelabuhan akan diterpa berbagai skenario (Event Pasif) yang berlangsung selama beberapa hari.
*   **Contoh Efek Positif:** *Musim Panen* (Setiap hari Anda otomatis mendapat +5 Dana & +2 Komunitas).
*   **Contoh Efek Negatif:** *Badai Musiman* (Setiap hari Infrastruktur akan otomatis tergerus -3 dan Dana -8. Pastikan tabungan Anda cukup untuk bertahan!).

---

## 🏆 Daftar Ending
Jika Anda berhasil melewati **Hari ke-30**, Pemerintah Pusat akan mengevaluasi kinerjamu dan memberikan 1 dari 5 gelar:

1.  🥇 **Pelabuhan Emas:** Ending terbaik! Semua 6 indikator berada di level sangat tinggi.
2.  💼 **Raja Bisnis:** Anda sangat kaya raya, tapi laut tercemar dan rakyat menderita.
3.  🌱 **Pejuang Hijau:** Laut sangat bersih dan lestari, namun pelabuhan minim inovasi dan dana.
4.  🤝 **Bapak Rakyat:** Warga sejahtera dan pekerja loyal, namun infrastruktur pelabuhan tertinggal zaman.
5.  🌫️ **Pelabuhan Terlupakan:** Anda berhasil bertahan hidup, namun tidak ada prestasi yang menonjol.

---

## 💻 Petunjuk Instalasi (Untuk Developer)

Game ini dibangun menggunakan **TypeScript** dan **Phaser 3**.

1. Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/).
2. Buka terminal/command prompt di dalam folder proyek ini.
3. Jalankan perintah instalasi dependensi:
   ```bash
   npm install
   ```
4. Jalankan server *development*:
   ```bash
   npm run dev
   ```
5. Buka browser Anda dan akses `http://localhost:5173` (atau sesuai port yang tertera di terminal).

---
*Dibuat untuk mengedukasi pentingnya keseimbangan antara Ekonomi, Sosial, dan Ekologi dalam pengelolaan sumber daya.*
# RateWatch Mobile App 📊

## Deskripsi Proyek

**RateWatch** adalah aplikasi mobile yang dirancang untuk memberikan data terkini dan wawasan tentang suku bunga global serta proyeksi kebijakan moneter. Aplikasi ini dibangun menggunakan **React Native** dan **Expo**, dengan fokus pada antarmuka yang modern dan mudah digunakan oleh analis keuangan, ekonom, dan pengamat pasar.

## Fitur Utama

- 🌍 **Cakupan global**: Data suku bunga dari bank sentral utama di seluruh dunia.
- 📈 **Visualisasi data**: Grafik perubahan suku bunga dan tren historis.
- 🔮 **Proyeksi kebijakan**: Probabilitas perubahan suku bunga berdasarkan analisis data.
- 🔔 **Notifikasi pintar**: Pemberitahuan tentang perubahan suku bunga terbaru.
- 🌙 **Mode gelap/terang**: Pengalaman pengguna yang nyaman di segala kondisi pencahayaan.

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:

- Node.js (versi 16+ direkomendasikan)
- npm atau yarn
- Expo CLI
- Android Studio / Xcode (untuk emulator)

Sebelum memulai proyek, pastikan untuk mengatur variabel lingkungan untuk koneksi database:
```bash
eas secret:create --name EXPO_PUBLIC_DB_HOST --value "alamatdb"
eas secret:create --name EXPO_PUBLIC_DB_USER --value "user"
eas secret:create --name EXPO_PUBLIC_DB_PASS --value "password"

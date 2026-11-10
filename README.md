# Seyahat Rehberi

Harita üzerinde gezdiğiniz bölgedeki **restoranları, kafeleri, otelleri ve gezilecek yerleri** gösteren bir web uygulaması. Haritanın merkezindeki **anlık hava durumunu** da gösterir.

## Özellikler

- Harita Bitlis şehir merkezinden başlar
- Şehir veya yer arama (otomatik tamamlama)
- Mekan türü seçimi: Restoranlar, Kafeler, Oteller, Gezilecek Yerler
- Filtreler: web sitesi / telefonu / çalışma saati olanlar
- Haritadaki işarete tıklayınca listede ilgili kart seçilir, karta tıklayınca harita oraya gider
- Yol tarifi, web sitesi ve detay bağlantıları
- Mobil uyumlu tasarım

## Kullanılan Teknolojiler

- React 18 + Vite
- Material UI (MUI)
- Leaflet / React-Leaflet + OpenStreetMap
- Overpass API ve Photon (mekan ve yer arama verisi)
- Open-Meteo (hava durumu)

Tüm servisler ücretsizdir; **hiçbir API anahtarı gerekmez**.

## Yerelde Çalıştırma

```bash
npm install
npm run dev
```

Ardından tarayıcıda `http://localhost:5173` adresini açın.

## Vercel'e Yükleme

1. Projeyi GitHub'a yükleyin.
2. [vercel.com](https://vercel.com) adresinde **Add New → Project** ile depoyu seçin.
3. Framework olarak **Vite** otomatik algılanır; **Deploy**'a basın. Ortam değişkeni gerekmez.

---

Geliştiren: **Osamah Ahmed Khudhair Alhel**

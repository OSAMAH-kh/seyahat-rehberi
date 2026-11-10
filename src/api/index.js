// Tüm veri kaynakları ücretsizdir ve API anahtarı gerektirmez:
// - Mekanlar: OpenStreetMap verisi, Overpass API üzerinden
// - Hava durumu: Open-Meteo
// - Yer arama: Photon (komoot)

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

export const PLACE_TYPES = {
  restaurants: {
    label: 'Restoranlar',
    title: 'Çevrendeki Restoranlar',
    emoji: '🍽️',
    filters: ['["amenity"~"^(restaurant|fast_food)$"]'],
    photonTags: ['amenity:restaurant', 'amenity:fast_food'],
  },
  cafes: {
    label: 'Kafeler',
    title: 'Çevrendeki Kafeler',
    emoji: '☕',
    filters: ['["amenity"="cafe"]'],
    photonTags: ['amenity:cafe'],
  },
  hotels: {
    label: 'Oteller',
    title: 'Çevrendeki Konaklama Yerleri',
    emoji: '🏨',
    filters: ['["tourism"~"^(hotel|hostel|guest_house|motel|apartment)$"]'],
    photonTags: ['tourism:hotel', 'tourism:hostel', 'tourism:guest_house', 'tourism:motel', 'tourism:apartment'],
  },
  attractions: {
    label: 'Gezilecek Yerler',
    title: 'Çevrendeki Gezilecek Yerler',
    emoji: '🏛️',
    filters: [
      '["tourism"~"^(attraction|museum|viewpoint|gallery|zoo|theme_park|aquarium)$"]',
      '["historic"~"^(castle|monument|ruins|archaeological_site|fort|palace)$"]',
    ],
    photonTags: [
      'tourism:attraction', 'tourism:museum', 'tourism:viewpoint', 'tourism:gallery', 'tourism:zoo',
      'historic:castle', 'historic:monument', 'historic:ruins', 'historic:archaeological_site', 'historic:palace',
    ],
  },
};

const KIND_LABELS = {
  restaurant: 'Restoran',
  fast_food: 'Fast Food',
  cafe: 'Kafe',
  hotel: 'Otel',
  hostel: 'Hostel',
  guest_house: 'Pansiyon',
  motel: 'Motel',
  apartment: 'Apart',
  attraction: 'Turistik Yer',
  museum: 'Müze',
  viewpoint: 'Seyir Noktası',
  gallery: 'Galeri',
  zoo: 'Hayvanat Bahçesi',
  theme_park: 'Tema Parkı',
  aquarium: 'Akvaryum',
  castle: 'Kale',
  monument: 'Anıt',
  ruins: 'Harabe',
  archaeological_site: 'Arkeolojik Alan',
  fort: 'Hisar',
  palace: 'Saray',
};

const CUISINE_LABELS = {
  turkish: 'Türk',
  kebab: 'Kebap',
  pizza: 'Pizza',
  burger: 'Burger',
  italian: 'İtalyan',
  chinese: 'Çin',
  japanese: 'Japon',
  sushi: 'Suşi',
  indian: 'Hint',
  mexican: 'Meksika',
  seafood: 'Deniz Ürünleri',
  fish: 'Balık',
  coffee_shop: 'Kahve',
  regional: 'Yöresel',
  international: 'Uluslararası',
  steak_house: 'Et / Steak',
  chicken: 'Tavuk',
  sandwich: 'Sandviç',
  breakfast: 'Kahvaltı',
  dessert: 'Tatlı',
  ice_cream: 'Dondurma',
  vegetarian: 'Vejetaryen',
  vegan: 'Vegan',
  french: 'Fransız',
  greek: 'Yunan',
  arab: 'Arap',
  lebanese: 'Lübnan',
  asian: 'Asya',
  american: 'Amerikan',
  doner: 'Döner',
  cake: 'Pasta',
  pastry: 'Pastane',
  tea: 'Çay',
};

const titleCase = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const normalizePlace = (el) => {
  const t = el.tags || {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const kind = t.amenity || t.tourism || t.historic;

  const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
  const address = [street, t['addr:district'] || t['addr:suburb'], t['addr:city']]
    .filter(Boolean)
    .join(', ');

  const website = t.website || t['contact:website'] || t.url;

  return {
    id: `${el.type}/${el.id}`,
    name: t['name:tr'] || t.name,
    lat,
    lng,
    kind: KIND_LABELS[kind] || (kind ? titleCase(kind) : ''),
    cuisine: (t.cuisine || '')
      .split(';')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => CUISINE_LABELS[c] || titleCase(c)),
    address,
    phone: t.phone || t['contact:phone'],
    website: website && !website.startsWith('http') ? `https://${website}` : website,
    openingHours: t.opening_hours,
    stars: t.stars ? parseFloat(t.stars) : null,
    image: t.image && t.image.startsWith('http') ? t.image : null,
    wikipedia: t.wikipedia,
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
  };
};

const withTimeout = (signal, ms) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  signal?.addEventListener('abort', () => controller.abort());
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
};

// 1. kaynak: Overpass (telefon, web sitesi, çalışma saati gibi zengin bilgi)
const getFromOverpass = async (type, { sw, ne }, signal) => {
  const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
  const parts = PLACE_TYPES[type].filters.map((f) => `nwr${f}["name"](${bbox});`).join('');
  const query = `[out:json][timeout:15];(${parts});out center 80;`;

  let lastError;
  for (const url of OVERPASS_URLS) {
    if (signal.aborted) break;
    const t = withTimeout(signal, 4000);
    try {
      const res = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: query }), signal: t.signal });
      if (!res.ok) throw new Error(`Overpass hata kodu ${res.status}`);
      const json = await res.json();
      return json.elements.map(normalizePlace).filter((p) => p.name && p.lat && p.lng);
    } catch (error) {
      lastError = error;
    } finally {
      t.clear();
    }
  }
  throw lastError || new Error('Overpass yanıt vermedi');
};

// 2. kaynak (yedek): Photon — Overpass sunucuları yoğun olduğunda devreye girer
const getFromPhoton = async (type, { sw, ne }, signal) => {
  const lat = (sw.lat + ne.lat) / 2;
  const lng = (sw.lng + ne.lng) / 2;
  const R = 6371;
  const dLat = ((ne.lat - sw.lat) * Math.PI) / 180;
  const dLng = (((ne.lng - sw.lng) * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180);
  const radius = Math.min(Math.max((Math.sqrt(dLat ** 2 + dLng ** 2) * R) / 2, 0.3), 10);

  const params = new URLSearchParams({
    lat: lat.toFixed(5), lon: lng.toFixed(5), radius: radius.toFixed(2), limit: '50',
  });
  PLACE_TYPES[type].photonTags.forEach((tag) => params.append('osm_tag', tag));

  const res = await fetch(`https://photon.komoot.io/reverse?${params}`, { signal });
  if (!res.ok) throw new Error('Photon yanıt vermedi');
  const json = await res.json();

  const typeMap = { N: 'node', W: 'way', R: 'relation' };
  return json.features
    .map((f) => {
      const p = f.properties;
      const [plng, plat] = f.geometry.coordinates;
      const osmType = typeMap[p.osm_type] || 'node';
      return normalizePlace({
        type: osmType,
        id: p.osm_id,
        lat: plat,
        lon: plng,
        tags: {
          name: p.name,
          [p.osm_key]: p.osm_value,
          'addr:street': p.street,
          'addr:housenumber': p.housenumber,
          'addr:district': p.district,
          'addr:city': p.city,
        },
      });
    })
    .filter((p) => p.name && p.lat >= sw.lat && p.lat <= ne.lat && p.lng >= sw.lng && p.lng <= ne.lng);
};

export const getPlacesData = async (type, bounds, signal) => {
  try {
    return await getFromOverpass(type, bounds, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    return getFromPhoton(type, bounds, signal);
  }
};

const WEATHER_CODES = {
  0: ['Açık', '☀️'],
  1: ['Çoğunlukla açık', '🌤️'],
  2: ['Parçalı bulutlu', '⛅'],
  3: ['Kapalı', '☁️'],
  45: ['Sisli', '🌫️'],
  48: ['Kırağılı sis', '🌫️'],
  51: ['Hafif çisenti', '🌦️'],
  53: ['Çisenti', '🌦️'],
  55: ['Yoğun çisenti', '🌦️'],
  61: ['Hafif yağmur', '🌧️'],
  63: ['Yağmur', '🌧️'],
  65: ['Şiddetli yağmur', '🌧️'],
  66: ['Dondurucu yağmur', '🌧️'],
  67: ['Dondurucu yağmur', '🌧️'],
  71: ['Hafif kar', '🌨️'],
  73: ['Kar', '🌨️'],
  75: ['Yoğun kar', '❄️'],
  77: ['Kar taneleri', '🌨️'],
  80: ['Sağanak', '🌦️'],
  81: ['Sağanak', '🌧️'],
  82: ['Şiddetli sağanak', '⛈️'],
  85: ['Kar sağanağı', '🌨️'],
  86: ['Kar sağanağı', '❄️'],
  95: ['Gök gürültülü fırtına', '⛈️'],
  96: ['Dolu ile fırtına', '⛈️'],
  99: ['Dolu ile fırtına', '⛈️'],
};

export const getWeatherData = async (lat, lng, signal) => {
  const params = new URLSearchParams({
    latitude: lat.toFixed(3),
    longitude: lng.toFixed(3),
    current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
    timezone: 'auto',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!res.ok) throw new Error('Hava durumu alınamadı');
  const { current } = await res.json();
  const [description, emoji] = WEATHER_CODES[current.weather_code] || ['Bilinmiyor', '🌡️'];
  return {
    temperature: Math.round(current.temperature_2m),
    wind: Math.round(current.wind_speed_10m),
    humidity: current.relative_humidity_2m,
    description,
    emoji,
  };
};

export const searchLocations = async (text, signal, near) => {
  const params = new URLSearchParams({ q: text, limit: '6' });
  // Restoran/dükkan isimlerini değil, şehir ve önemli yerleri öne çıkar
  params.append('osm_tag', '!amenity');
  params.append('osm_tag', '!shop');
  params.append('osm_tag', '!office');
  if (near) {
    params.set('lat', near.lat.toFixed(3));
    params.set('lon', near.lng.toFixed(3));
    params.set('location_bias_scale', '0.3');
  }
  const res = await fetch(`https://photon.komoot.io/api/?${params}`, { signal });
  if (!res.ok) throw new Error('Arama başarısız');
  const json = await res.json();
  return json.features.map((f) => {
    const p = f.properties;
    const [lng, lat] = f.geometry.coordinates;
    return {
      id: `${p.osm_type}${p.osm_id}`,
      name: p.name || p.city || p.state || p.country,
      detail: [p.city !== p.name ? p.city : null, p.state, p.country].filter(Boolean).join(', '),
      lat,
      lng,
      extent: p.extent, // [minLon, maxLat, maxLon, minLat]
    };
  });
};

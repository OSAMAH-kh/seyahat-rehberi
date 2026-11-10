import { useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';

import { getPlacesData, getWeatherData } from './api';
import Header from './components/Header/Header';
import List from './components/List/List';
import Map, { MIN_ZOOM_FOR_PLACES } from './components/Map/Map';

// Uygulama Bitlis şehir merkezinden başlar
const DEFAULT_CENTER = { lat: 38.4006, lng: 42.1095 };

const FILTERS = {
  all: () => true,
  website: (p) => Boolean(p.website),
  phone: (p) => Boolean(p.phone),
  hours: (p) => Boolean(p.openingHours),
};

const App = () => {
  const [type, setType] = useState('restaurants');
  const [filter, setFilter] = useState('all');

  const [flyTarget, setFlyTarget] = useState({ ...DEFAULT_CENTER, zoom: 15 });
  const [view, setView] = useState(null); // { bounds, center, zoom }

  const [places, setPlaces] = useState([]);
  const [weather, setWeather] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Harita hareket ettiğinde mekanları getir
  useEffect(() => {
    if (!view) return undefined;
    if (view.zoom < MIN_ZOOM_FOR_PLACES) {
      setPlaces([]);
      setIsLoading(false);
      setError('');
      return undefined;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError('');

    getPlacesData(type, view.bounds, controller.signal)
      .then((data) => {
        setPlaces(data);
        setSelectedId((prev) => (data.some((p) => p.id === prev) ? prev : null));
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setPlaces([]);
        setError('Mekanlar yüklenemedi. Lütfen birkaç saniye sonra tekrar deneyin.');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [view, type]);

  // Harita merkezi için hava durumu
  const weatherKey = view ? `${view.center.lat.toFixed(2)},${view.center.lng.toFixed(2)}` : null;
  useEffect(() => {
    if (!view) return undefined;
    const controller = new AbortController();
    getWeatherData(view.center.lat, view.center.lng, controller.signal)
      .then(setWeather)
      .catch(() => {});
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherKey]);

  const filteredPlaces = useMemo(() => places.filter(FILTERS[filter]), [places, filter]);

  const handleTypeChange = (value) => {
    setType(value);
    setFilter('all');
  };

  const handleSelectFromList = (place) => {
    setSelectedId(place.id);
    setFlyTarget({ lat: place.lat, lng: place.lng, zoom: Math.max(view?.zoom || 16, 16), keepPlaces: true });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Header near={view?.center} onLocationSelect={(loc) => setFlyTarget({ lat: loc.lat, lng: loc.lng, zoom: 15 })} />
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
        }}
      >
        <Box sx={{ width: { xs: '100%', md: '33.33%' }, minHeight: 0, flex: { xs: 1, md: 'none' } }}>
          <List
            places={filteredPlaces}
            totalCount={places.length}
            type={type}
            setType={handleTypeChange}
            filter={filter}
            setFilter={setFilter}
            selectedId={selectedId}
            onSelect={handleSelectFromList}
            isLoading={isLoading}
            error={error}
            tooFar={view && view.zoom < MIN_ZOOM_FOR_PLACES}
          />
        </Box>
        <Box sx={{ flex: { xs: 'none', md: 1 }, height: { xs: '45vh', md: 'auto' } }}>
          <Map
            type={type}
            places={filteredPlaces}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            flyTarget={flyTarget}
            onViewChange={setView}
            weather={weather}
            isLoading={isLoading}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default App;

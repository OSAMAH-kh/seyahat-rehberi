import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';

import { PLACE_TYPES } from '../../api';

export const MIN_ZOOM_FOR_PLACES = 13;

const ViewWatcher = ({ onViewChange }) => {
  const timer = useRef();
  const map = useMapEvents({
    moveend: () => report(),
  });

  function report() {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const b = map.getBounds();
      const c = map.getCenter();
      onViewChange({
        bounds: { sw: { lat: b.getSouth(), lng: b.getWest() }, ne: { lat: b.getNorth(), lng: b.getEast() } },
        center: { lat: c.lat, lng: c.lng },
        zoom: map.getZoom(),
      });
    }, 600);
  }

  useEffect(() => {
    report();
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

const FlyTo = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    // Leaflet, aynı noktaya flyTo yapılınca NaN hatası veriyor; o durumda atla
    const sameSpot = map.getCenter().distanceTo([target.lat, target.lng]) < 1
      && (target.keepPlaces || map.getZoom() === target.zoom);
    if (sameSpot) return;
    if (target.keepPlaces) {
      // Listeden seçimde haritayı kaydırmadan sadece mekana odaklan
      map.panTo([target.lat, target.lng], { animate: true });
    } else {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
};

const makeIcon = (emoji, selected) => L.divIcon({
  className: `place-marker${selected ? ' selected' : ''}`,
  html: `<div class="pin"><span>${emoji}</span></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  tooltipAnchor: [0, -34],
});

const Map = ({
  type, places, selectedId, setSelectedId, flyTarget, onViewChange, weather, isLoading,
}) => {
  const { emoji } = PLACE_TYPES[type];
  const icon = useMemo(() => makeIcon(emoji, false), [emoji]);
  const selectedIcon = useMemo(() => makeIcon(emoji, true), [emoji]);

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[flyTarget.lat, flyTarget.lng]}
        zoom={flyTarget.zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <ViewWatcher onViewChange={onViewChange} />
        <FlyTo target={flyTarget} />
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={selectedId === place.id ? selectedIcon : icon}
            zIndexOffset={selectedId === place.id ? 1000 : 0}
            eventHandlers={{ click: () => setSelectedId(place.id) }}
          >
            <Tooltip direction="top">{place.name}</Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {weather && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute', top: 12, right: 12, zIndex: 1000, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 32, lineHeight: 1 }}>{weather.emoji}</Typography>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>{weather.temperature}°C</Typography>
            <Typography variant="caption" color="text.secondary">
              {weather.description} · Rüzgar {weather.wind} km/s · Nem %{weather.humidity}
            </Typography>
          </Box>
        </Paper>
      )}

      {isLoading && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1,
          }}
        >
          <CircularProgress size={18} />
          <Typography variant="body2">Mekanlar yükleniyor…</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default Map;

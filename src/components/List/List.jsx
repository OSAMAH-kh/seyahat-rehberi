import { createRef, useEffect, useMemo } from 'react';
import {
  Alert, Box, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, Typography,
} from '@mui/material';

import PlaceDetails from '../PlaceDetails/PlaceDetails';
import { PLACE_TYPES } from '../../api';

const List = ({
  places, totalCount, type, setType, filter, setFilter, selectedId, onSelect, isLoading, error, tooFar,
}) => {
  const refs = useMemo(
    () => Object.fromEntries(places.map((p) => [p.id, createRef()])),
    [places],
  );

  useEffect(() => {
    if (selectedId) refs[selectedId]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selectedId, refs]);

  const renderBody = () => {
    if (isLoading && !places.length) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress size="4rem" />
        </Box>
      );
    }
    if (error) return <Alert severity="error">{error}</Alert>;
    if (tooFar) return <Alert severity="info">Mekanları görmek için haritayı biraz yakınlaştırın.</Alert>;
    if (!places.length) {
      return (
        <Alert severity="info">
          {totalCount
            ? 'Bu filtreye uyan mekan yok. Başka bir filtre deneyin.'
            : 'Bu bölgede mekan bulunamadı. Haritayı kaydırın veya başka bir yer arayın.'}
        </Alert>
      );
    }
    return (
      <Stack spacing={2}>
        {places.map((place) => (
          <div ref={refs[place.id]} key={place.id}>
            <PlaceDetails
              place={place}
              emoji={PLACE_TYPES[type].emoji}
              selected={selectedId === place.id}
              onClick={() => onSelect(place)}
            />
          </div>
        ))}
      </Stack>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
        {PLACE_TYPES[type].title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, my: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="type-label">Tür</InputLabel>
          <Select labelId="type-label" label="Tür" value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(PLACE_TYPES).map(([key, t]) => (
              <MenuItem key={key} value={key}>{t.emoji} {t.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="filter-label">Filtre</InputLabel>
          <Select labelId="filter-label" label="Filtre" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="all">Tümü</MenuItem>
            <MenuItem value="website">Web sitesi olanlar</MenuItem>
            <MenuItem value="phone">Telefonu olanlar</MenuItem>
            <MenuItem value="hours">Çalışma saati olanlar</MenuItem>
          </Select>
        </FormControl>
        {!isLoading && !error && places.length > 0 && (
          <Typography variant="body2" color="text.secondary">{places.length} mekan</Typography>
        )}
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', pr: 1, minHeight: 0 }}>{renderBody()}</Box>
    </Box>
  );
};

export default List;

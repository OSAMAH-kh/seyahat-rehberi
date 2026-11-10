import { useEffect, useState } from 'react';
import { AppBar, Autocomplete, Box, InputAdornment, TextField, Toolbar, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

import { searchLocations } from '../../api';

const Header = ({ onLocationSelect, near }) => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (input.trim().length < 2) {
      setOptions([]);
      return undefined;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      searchLocations(input, controller.signal, near)
        .then(setOptions)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TravelExploreIcon />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            Seyahat Rehberi
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: { xs: 1, sm: 'none' } }}>
          <Typography variant="h6" sx={{ display: { xs: 'none', md: 'block' } }}>
            Yeni yerler keşfet
          </Typography>
          <Autocomplete
            sx={{ width: { xs: '100%', sm: 320 } }}
            options={options}
            loading={loading}
            filterOptions={(x) => x}
            getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            noOptionsText={input.length < 2 ? 'Aramak için yazmaya başlayın' : 'Sonuç bulunamadı'}
            loadingText="Aranıyor…"
            onInputChange={(_, value) => setInput(value)}
            onChange={(_, value) => value && onLocationSelect(value)}
            renderOption={(props, o) => {
              const { key, ...rest } = props;
              return (
                <Box component="li" key={o.id} {...rest} sx={{ display: 'block !important' }}>
                  <Typography variant="body1">{o.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{o.detail}</Typography>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Şehir veya yer ara…"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  borderRadius: 1,
                  '& .MuiInputBase-root': { color: 'inherit' },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiSvgIcon-root': { color: 'inherit' },
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

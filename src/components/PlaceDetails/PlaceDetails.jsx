import {
  Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Chip, Rating, Typography,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsIcon from '@mui/icons-material/Directions';
import LanguageIcon from '@mui/icons-material/Language';
import MapIcon from '@mui/icons-material/Map';

const InfoRow = ({ icon, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1, color: 'text.secondary' }}>
    {icon}
    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{children}</Typography>
  </Box>
);

const PlaceDetails = ({ place, emoji, selected, onClick }) => (
  <Card
    elevation={selected ? 8 : 3}
    sx={{ border: 2, borderColor: selected ? 'secondary.main' : 'transparent', transition: 'all .2s' }}
  >
    <CardActionArea onClick={onClick}>
      {place.image ? (
        <CardMedia component="img" height="180" image={place.image} alt={place.name} />
      ) : (
        <Box
          sx={{
            height: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            background: 'linear-gradient(135deg, #1e3a5f 0%, #3c6e9f 60%, #f28c28 140%)',
          }}
        >
          {emoji}
        </Box>
      )}
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" component="h3" sx={{ lineHeight: 1.3 }}>{place.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          {place.kind && <Chip size="small" color="primary" label={place.kind} />}
          {place.cuisine.map((c) => <Chip key={c} size="small" variant="outlined" label={c} />)}
        </Box>
        {place.stars && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Rating value={place.stars} max={5} precision={0.5} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">{place.stars} yıldızlı</Typography>
          </Box>
        )}
        {place.address && <InfoRow icon={<LocationOnIcon fontSize="small" />}>{place.address}</InfoRow>}
        {place.phone && <InfoRow icon={<PhoneIcon fontSize="small" />}>{place.phone}</InfoRow>}
        {place.openingHours && <InfoRow icon={<AccessTimeIcon fontSize="small" />}>{place.openingHours}</InfoRow>}
      </CardContent>
    </CardActionArea>
    <CardActions sx={{ flexWrap: 'wrap' }}>
      <Button
        size="small"
        startIcon={<DirectionsIcon />}
        href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Yol Tarifi
      </Button>
      {place.website && (
        <Button size="small" startIcon={<LanguageIcon />} href={place.website} target="_blank" rel="noopener noreferrer">
          Web Sitesi
        </Button>
      )}
      <Button size="small" startIcon={<MapIcon />} href={place.osmUrl} target="_blank" rel="noopener noreferrer">
        Detaylar
      </Button>
    </CardActions>
  </Card>
);

export default PlaceDetails;

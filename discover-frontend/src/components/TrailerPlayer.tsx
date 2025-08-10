import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { PlayArrow, OpenInNew } from '@mui/icons-material';

interface TrailerPlayerProps {
  trailerUrl?: string;
  trailerId?: string;
  title: string;
}

const TrailerPlayer: React.FC<TrailerPlayerProps> = ({ trailerUrl, trailerId, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!trailerUrl && !trailerId) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No trailer available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Trailer information is not available for this content.
        </Typography>
      </Paper>
    );
  }

  // Extract YouTube video ID from URL if not provided
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const videoId = trailerId || getYouTubeVideoId(trailerUrl || '');

  if (!videoId) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Trailer not available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Unable to load trailer for this content.
        </Typography>
        {trailerUrl && (
          <IconButton
            component="a"
            href={trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            size="large"
          >
            <OpenInNew />
          </IconButton>
        )}
      </Paper>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Box sx={{ position: 'relative', width: '100%', height: 0, pb: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={`${title} Trailer`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </Box>
      
      {/* Fallback link */}
      {trailerUrl && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Having trouble viewing? 
          </Typography>
          <Button
            href={trailerUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            size="small"
            startIcon={<OpenInNew />}
          >
            Open in YouTube
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default TrailerPlayer; 
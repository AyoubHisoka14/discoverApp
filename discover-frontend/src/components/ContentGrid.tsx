import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Chip,
  Paper,
} from '@mui/material';
import { ContentItem, WatchlistItem } from '../types';
import ContentCard from './ContentCard';

interface ContentGridProps {
  items: (ContentItem & { seasons?: number; episodes?: number })[] | WatchlistItem[];
  title?: string;
  icon?: React.ReactNode;
  showActions?: boolean;
  onWatch?: (id: string) => void;
  onAddToWatchlist?: (id: string) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

const ContentGrid: React.FC<ContentGridProps> = ({
  items,
  title,
  icon,
  showActions = true,
  onWatch,
  onAddToWatchlist,
  emptyMessage = "No content found",
  emptyIcon,
}) => {
  if (items.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {emptyIcon}
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {title && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {icon}
          <Typography variant="h5" sx={{ ml: 1 }}>
            {title}
          </Typography>
          <Chip
            label={`${items.length} items`}
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        </Box>
      )}

      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <ContentCard
              item={item as any}
              showActions={showActions}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ContentGrid;

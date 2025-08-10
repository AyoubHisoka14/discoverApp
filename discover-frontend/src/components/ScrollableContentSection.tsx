import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import {ContentDto, PageType} from '../types';
import ContentCard from './ContentCard';

interface ScrollableContentSectionProps {
  title: string;
  items: ContentDto[];
  itemsPerView?: number;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

const ScrollableContentSection: React.FC<ScrollableContentSectionProps> = ({
  title,
  items,
  itemsPerView = 3,
  loading = false,
  loadingText = 'Loading...',
  icon,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Adjust items per view based on screen size
  const getItemsPerView = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return itemsPerView;
  };

  const actualItemsPerView = getItemsPerView();
  const maxIndex = Math.max(0, Math.ceil(items.length / actualItemsPerView) - 1);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxIndex;

  const handleScrollLeft = () => {
    if (canScrollLeft && items.length > actualItemsPerView) {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    }
  };

  const handleScrollRight = () => {
    console.log(maxIndex)
    if (canScrollRight && items.length > actualItemsPerView) {
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    }
  };

  const handleScrollToIndex = (index: number) => {
    if (items.length > actualItemsPerView) {
      setCurrentIndex(Math.min(index, maxIndex));
    }
  };

  // Reset currentIndex when items change or when it exceeds maxIndex
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [items, currentIndex, maxIndex]);

  if (loading) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>{loadingText}</Typography>
        </Box>
      </Paper>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No content available</Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: -2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
        <Typography variant="h5">
          {title}
        </Typography>
      </Box>

      <Box sx={{ position: 'relative'}}>
        {/* Navigation Arrows */}
        {canScrollLeft && items.length > actualItemsPerView && (
          <IconButton
            onClick={handleScrollLeft}
            sx={{
              position: 'absolute',
              left: -35,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'darkgrey',
                boxShadow: 4,
              },
            }}
            size="large"
          >
            <ChevronLeft />
          </IconButton>
        )}

        {canScrollRight && items.length > actualItemsPerView && (
          <IconButton
            onClick={handleScrollRight}
            sx={{
              position: 'absolute',
              right: -35,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'darkgrey',
                boxShadow: 4,
              },
            }}
            size="large"
          >
            <ChevronRight />
          </IconButton>
        )}

        {/* Content Container */}
        <Box
          ref={scrollContainerRef}
          sx={{
            overflow: 'hidden',
            position: 'relative',
            width: '100%',
            pt: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              transition: 'transform 0.3s ease-in-out',
              transform: `translateX(-${currentIndex * (100 / actualItemsPerView)}%)`,
              width: `${Math.ceil(items.length / actualItemsPerView) * 100}%`,
            }}
          >
            {items.map((item, index) => (
              <Box
                key={item.id}
                sx={{
                  width: `${100 / (actualItemsPerView * (maxIndex + 1))}%`,
                  px: 1,
                  flexShrink: 0,
                  mb: 1
                }}
              >
                <ContentCard item={item} page={PageType.HOME}/>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Dots Indicator */}
        {maxIndex > 0 && items.length > actualItemsPerView && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              mt: 2,
            }}
          >
            {Array.from({ length: maxIndex + 1 }, (_, index) => (
              <Box
                key={index}
                onClick={() => handleScrollToIndex(index)}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === currentIndex ? 'primary.main' : 'grey.300',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: index === currentIndex ? 'primary.dark' : 'grey.400',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ScrollableContentSection;

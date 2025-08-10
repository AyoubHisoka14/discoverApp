import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {Movie, Tv, Animation, Whatshot} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ContentDto, ContentType } from '../types';
import ContentCard from './ContentCard';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import ScrollableContentSection from "./ScrollableContentSection";

interface RecommendedContentProps {
  recommendedContent?: ContentDto[];
  title?: string;
}

const RecommendedContent: React.FC<RecommendedContentProps> = ({
  recommendedContent,
  title = "You might also like"
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [slide, setSlide] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const itemsPerSlide = 4;
  const totalSlides = Math.ceil((recommendedContent?.length || 0) / itemsPerSlide);
  const handlePrev = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
      setTimeout(() => setIsAnimating(false), 300);
    }
  };
  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 600);
    }
  };
  const startIdx = slide * itemsPerSlide;
  const visibleItems = recommendedContent?.slice(startIdx, startIdx + itemsPerSlide) || [];

  if (!recommendedContent || recommendedContent.length === 0) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No recommendations available at the moment.
        </Typography>
      </Box>
    );
  }

  const getContentIcon = (type: ContentType) => {
    switch (type) {
      case ContentType.MOVIE:
        return <Movie fontSize="small" />;
      case ContentType.SERIES:
        return <Tv fontSize="small" />;
      case ContentType.ANIME:
        return <Animation fontSize="small" />;
      default:
        return <Movie fontSize="small" />;
    }
  };

  const getContentTypeLabel = (type: ContentType) => {
    switch (type) {
      case ContentType.MOVIE:
        return 'Movie';
      case ContentType.SERIES:
        return 'TV Series';
      case ContentType.ANIME:
        return 'Anime';
      default:
        return 'Content';
    }
  };

  const handleContentClick = (content: ContentDto) => {
    if (content.externalId) {
      navigate(`/content/${content.externalId}/${content.type.toLowerCase()}`);
    }
  };

  return (
    <Box sx={{ mt: 4, position: 'relative' }}>
      {(!recommendedContent || recommendedContent.length === 0) ? (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No recommendations available at the moment.
          </Typography>
        </Box>
      ) : (
          <ScrollableContentSection
              title="You might also like"
              items={recommendedContent.slice(0, 12)}
              itemsPerView={4}
              icon={<Whatshot sx={{color: 'error.main'}}/>}
          />
      )}
    </Box>
  );
};

export default RecommendedContent;

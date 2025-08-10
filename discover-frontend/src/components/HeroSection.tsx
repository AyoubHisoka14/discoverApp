import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Rating,
  Card,
  CardMedia,
  CardContent,
  useTheme,
  useMediaQuery,
  Fade,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add,
} from '@mui/icons-material';
import { ContentDto } from '../types';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  content: ContentDto[];
  loading: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ content, loading }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (content.length <= 1) return;

    const interval = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % content.length);
        setTimeout(() => setIsAnimating(false), 300);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [content.length, isAnimating]);

  const handleNext = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev + 1) % content.length);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handlePrevious = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex((prev) => (prev - 1 + content.length) % content.length);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleSidebarClick = (index: number) => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentIndex(index);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleMainContentClick = () => {
    if (content[currentIndex]) {
      navigate(`/content/${content[currentIndex].externalId || content[currentIndex].id}/${content[currentIndex].type.toLowerCase()}`, {
          state: { from: window.location.pathname }
      });
    }
  };

  const handleNavigationClick = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.stopPropagation();
    if (direction === 'prev') {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  if (loading || content.length === 0) {
    return (
      <Box sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Loading trending content...
        </Typography>
      </Box>
    );
  }

  const currentContent = content[currentIndex];

  // Get next 4 items for sidebar (FIFO behavior)
  const getSidebarItems = () => {
    const items = [];
    for (let i = 1; i <= 4; i++) {
      const index = (currentIndex + i) % content.length;
      items.push(content[index]);
    }
    return items;
  };

  const sidebarItems = getSidebarItems();

  const getBackdropUrl = (content: ContentDto) => {
    if (content.backdropPath) {
      return content.backdropPath;
    }
    // Fallback to poster if no backdrop
    return content.posterUrl || 'https://via.placeholder.com/1920x1080?text=No+Image';
  };

  return (
    <Box sx={{ position: 'relative', height: '70vh', mb: 4, maxWidth: '1200px', mx: 'auto', display: 'flex' }}>
      {/* Main Content Area */}
             <Box
         sx={{
           position: 'relative',
           height: '100%',
           flex: 1,
           background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${getBackdropUrl(currentContent)})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           display: 'flex',
           alignItems: 'flex-end',
           cursor: 'pointer',
           transition: 'all 0.5s ease-in-out',
           transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
           opacity: isAnimating ? 0.9 : 1,
         }}
         onClick={handleMainContentClick}
       >
        {/* Navigation Arrows */}
        <IconButton
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': { bgcolor: 'darkgrey' },
            zIndex: 10,
          }}
          onClick={(e) => handleNavigationClick(e, 'prev')}
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            bgcolor: 'rgba(0,0,0,0.5)',
            color: 'white',
            '&:hover': { bgcolor: 'darkgrey' },
            zIndex: 10,
          }}
          onClick={(e) => handleNavigationClick(e, 'next')}
        >
          <ChevronRight />
        </IconButton>

        {/* Content Info Overlay */}
                 <Box
           sx={{
             position: 'absolute',
             bottom: 0,
             left: 0,
             right: 0,
             p: 4,
             background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
             transition: 'all 0.3s ease-in-out',
             transform: isAnimating ? 'translateY(10px)' : 'translateY(0)',
             opacity: isAnimating ? 0.8 : 1,
           }}
         >
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
            {/* Poster */}
            <Box
              sx={{
                position: 'relative',
                flexShrink: 0,
                '&:hover .add-button': {
                  opacity: 1,
                },
              }}
            >
              <Card
                sx={{
                  width: 120,
                  height: 180,
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMainContentClick();
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={currentContent.posterUrl || 'https://via.placeholder.com/120x180?text=No+Image'}
                  alt={currentContent.title}
                  sx={{ objectFit: 'cover' }}
                />
                <IconButton
                  className="add-button"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to watchlist functionality
                  }}
                >
                  <Add />
                </IconButton>
              </Card>
            </Box>

            {/* Content Details */}
            <Box sx={{ flex: 1, color: 'white' }}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
                {currentContent.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                {currentContent.release_date && (
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    {new Date(currentContent.release_date).getFullYear()}
                  </Typography>
                )}
                {currentContent.ratings && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={currentContent.ratings / 2} precision={0.1} readOnly size="small" />
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      {currentContent.ratings.toFixed(1)}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{
                  mb: 2,
                  maxWidth: '600px',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.4em',
                  maxHeight: '4.2em', // 3 lines * 1.4em
                  color: 'white',
                }}
              >
                {currentContent.description}
              </Typography>

              {currentContent.genreNames && currentContent.genreNames.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {currentContent.genreNames.slice(0, 3).map((genre, index) => (
                    <Chip
                      key={index}
                      label={genre}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Up Next Sidebar */}
      {!isMobile && (
        <Box
          sx={{
            width: 300,
            height: '100%',
            bgcolor: 'rgba(25, 118, 210, 0.1)',
            backdropFilter: 'blur(10px)',
            borderLeft: '1px solid rgba(25, 118, 210, 0.2)',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'primary.main',
              fontWeight: 'bold',
              mb: 2,
              textAlign: 'center',
            }}
          >
            Up next
          </Typography>

                     <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
             {sidebarItems.map((item, index) => (
               <Fade
                 key={`${item.id}-${currentIndex}-${index}`}
                 in={!isAnimating}
                 timeout={300}
                 style={{ transitionDelay: `${index * 50}ms` }}
               >
                 <Card
                   sx={{
                     display: 'flex',
                     height: 80,
                     cursor: 'pointer',
                     bgcolor: 'rgba(25, 118, 210, 0.05)',
                     transition: 'all 0.3s ease-in-out',
                     transform: isAnimating ? 'translateX(-10px)' : 'translateX(0)',
                     opacity: isAnimating ? 0.7 : 1,
                     '&:hover': {
                       bgcolor: 'rgba(25, 118, 210, 0.15)',
                       transform: 'translateX(5px)',
                     },
                   }}
                   onClick={() => handleSidebarClick((currentIndex + index + 1) % content.length)}
                 >
                   <CardMedia
                     component="img"
                     sx={{ width: 60, height: 80 }}
                     image={item.posterUrl || 'https://via.placeholder.com/60x80?text=No+Image'}
                     alt={item.title}
                   />
                   <CardContent sx={{ flex: 1, p: 1, color: 'text.primary' }}>
                     <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                       {item.title}
                     </Typography>
                     <Typography variant="caption" color="text.secondary">
                       {item.release_date ? new Date(item.release_date).getFullYear() : ''}
                     </Typography>
                   </CardContent>
                 </Card>
               </Fade>
             ))}
           </Box>
        </Box>
      )}
    </Box>
  );
};

export default HeroSection;

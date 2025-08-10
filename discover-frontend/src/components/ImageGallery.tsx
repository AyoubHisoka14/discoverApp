import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Modal,
  Fade,
  Backdrop,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Fullscreen } from '@mui/icons-material';

interface ImageGalleryProps {
  images?: string[];
  title: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.100' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No images available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Image gallery is not available for this content.
        </Typography>
      </Paper>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleImageClick = (index?: number) => {
    setModalIndex(typeof index === 'number' ? index : currentIndex);
    setModalOpen(true);
  };
  const handleModalClose = () => setModalOpen(false);
  const handleModalPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleModalNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Paper sx={{ overflow: 'hidden', position: 'relative' }}>
      {/* Image Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: isMobile ? 200 : 400,
          cursor: 'pointer',
          '&:hover .gallery-overlay': {
            opacity: 1,
          },
        }}
        onClick={() => handleImageClick(currentIndex)}
      >
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
          }}
        />

        {/* Overlay with fullscreen icon */}
        <Box
          className="gallery-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <IconButton
            color="primary"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 1)',
              },
            }}
          >
            <Fullscreen />
          </IconButton>
        </Box>
      </Box>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'grey',
              '&:hover': {
                bgcolor: 'darkgrey',
              },
            }}
          >
            <ChevronLeft />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'grey',
              '&:hover': {
                bgcolor: 'darkgrey',
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        </>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.875rem',
          }}
        >
          {currentIndex + 1} / {images.length}
        </Box>
      )}

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 2,
            overflowX: 'auto',
            bgcolor: 'black',
          }}
        >
          {images.map((image, index) => (
            <Box
              key={index}
              onClick={() => setCurrentIndex(index)}
              sx={{
                flexShrink: 0,
                width: 60,
                height: 40,
                cursor: 'pointer',
                border: index === currentIndex ? 2 : 1,
                borderColor: index === currentIndex ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                overflow: 'hidden',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/60x40?text=Error';
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Modal for enlarged image */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={modalOpen}>
          <Box
            onClick={handleModalClose}
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              bgcolor: 'rgba(0,0,0,0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300,
              backdropFilter: 'blur(6px)',
            }}
          >
            <Box
              onClick={e => e.stopPropagation()}
              sx={{
                position: 'relative',
                maxWidth: isMobile ? '90vw' : '70vw',
                maxHeight: isMobile ? '70vh' : '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconButton
                onClick={handleModalPrev}
                sx={{
                  position: 'absolute',
                  left: -48,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'grey',
                  '&:hover': { bgcolor: 'darkgray' },
                  zIndex: 1,
                }}
              >
                <ChevronLeft fontSize="large" />
              </IconButton>
              <img
                src={images[modalIndex]}
                alt={`${title} - Modal Image ${modalIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: 8,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  background: 'white',
                  objectFit: 'contain',
                }}
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Available';
                }}
              />
              <IconButton
                onClick={handleModalNext}
                sx={{
                  position: 'absolute',
                  right: -48,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  bgcolor: 'grey',
                  '&:hover': { bgcolor: 'darkgray' },
                  zIndex: 1,
                }}
              >
                <ChevronRight fontSize="large" />
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: 1,
                  fontSize: '1rem',
                }}
              >
                {modalIndex + 1} / {images.length}
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Paper>
  );
};

export default ImageGallery;

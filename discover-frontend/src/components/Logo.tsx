import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { Movie, Search } from '@mui/icons-material';

interface LogoProps {
  variant?: 'default' | 'compact';
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ variant = 'default', onClick }) => {
  const isCompact = variant === 'compact';
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        '&:hover': onClick ? {
          opacity: 0.8,
          transform: 'scale(1.02)',
        } : {},
        transition: 'all 0.2s ease-in-out',
      }}
      onClick={onClick}
    >
      {/* Logo Icon */}
             <Box
         sx={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'center',
           width: isCompact ? 28 : 36,
           height: isCompact ? 28 : 36,
           borderRadius: '10px',
           background: isDarkMode 
             ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
             : 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
           mr: isCompact ? 1 : 1.5,
           position: 'relative',
           overflow: 'hidden',
         }}
       >
                 <Search
           sx={{
             color: 'white',
             fontSize: isCompact ? 18 : 22,
             fontWeight: 'bold',
             zIndex: 1,
             position: 'relative',
             backgroundColor: 'transparent',
           }}
         />
      </Box>

      {/* Logo Text */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                 <Typography
           variant={isCompact ? 'body1' : 'h6'}
           sx={{
             fontWeight: 700,
             color: isDarkMode ? '#ffffff' : '#ffffff',
             lineHeight: 1,
             mb: isCompact ? 0 : 0.5,
           }}
         >
          Discover
        </Typography>
                 {!isCompact && (
           <Typography
             variant="caption"
             sx={{
               color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)',
               fontSize: '0.7rem',
               fontWeight: 500,
               letterSpacing: '0.5px',
               textTransform: 'uppercase',
             }}
           >
            Entertainment Hub
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Logo;

import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
} from '@mui/material';
import {
  Home,
  Search,
  Bookmark,
  SmartToy,
  Forum,
  Person,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileBottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 0;
    if (path === '/search') return 1;
    if (path === '/watchlist') return 2;
    if (path === '/ai') return 3;
    if (path.startsWith('/channels')) return 4;
    if (path === '/profile') return 5;
    return 0;
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/search');
        break;
      case 2:
        navigate('/watchlist');
        break;
      case 3:
        navigate('/ai');
        break;
      case 4:
        navigate('/channels');
        break;
      case 5:
        navigate('/profile');
        break;
    }
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: { xs: 'block', md: 'none' },
      }}
      elevation={3}
    >
      <BottomNavigation
        value={getCurrentValue()}
        onChange={handleChange}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 12px 8px',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            marginTop: '4px',
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<Home />}
          sx={{
            '&.Mui-selected': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction
          label="Search"
          icon={<Search />}
          sx={{
            '&.Mui-selected': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction
          label="Watchlist"
          icon={<Bookmark />}
          sx={{
            '&.Mui-selected': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction
          label="AI"
          icon={<SmartToy />}
          sx={{
            '&.Mui-selected': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction
          label="Channels"
          icon={<Forum />}
          sx={{
            '&.Mui-selected': {
              color: 'primary.main',
            },
          }}
        />
        <BottomNavigationAction
          label="Profile"
          icon={<Person />}
          sx={{
            '&.Mui-selected': {
              color: 'primary.main',
            },
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNavigation; 
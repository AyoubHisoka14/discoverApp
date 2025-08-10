import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Home,
  Movie,
  Search,
  SmartToy,
  Forum,
  AccountCircle,
  Logout,
  Menu as MenuIcon,
  Bookmark,
  TrendingUp,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Logo from './Logo';

// Available avatars - same as in Profile page
const availableAvatars = [
  { id: '1', name: 'Default', emoji: '👤' },
  { id: '2', name: 'Cat', emoji: '🐱' },
  { id: '3', name: 'Dog', emoji: '🐶' },
  { id: '4', name: 'Robot', emoji: '🤖' },
  { id: '5', name: 'Alien', emoji: '👽' },
  { id: '6', name: 'Ninja', emoji: '🥷' },
  { id: '7', name: 'Wizard', emoji: '🧙‍♂️' },
  { id: '8', name: 'Astronaut', emoji: '👨‍🚀' },
  { id: '9', name: 'Pirate', emoji: '🏴‍☠️' },
  { id: '10', name: 'Knight', emoji: '⚔️' },
  { id: '11', name: 'Dragon', emoji: '🐉' },
  { id: '12', name: 'Unicorn', emoji: '🦄' },
];

const Navigation = () => {
  const { user, logout } = useAuth();
  const { themeMode, setThemeMode, isDarkMode } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleThemeToggle = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
  };

  const getThemeIcon = () => {
    return themeMode === 'light' ? <LightMode /> : <DarkMode />;
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  const navItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Content', path: '/content', icon: <Movie /> },
    { label: 'Search', path: '/search', icon: <Search /> },
    { label: 'Watchlist', path: '/watchlist', icon: <Bookmark /> },
    { label: 'Channels', path: '/channels', icon: <Forum /> },
    { label: 'AI', path: '/ai', icon: <SmartToy /> },
  ];

  const getUserAvatar = () => {
    const avatarId = user?.avatar || '1';
    const avatar = availableAvatars.find(av => av.id === avatarId) || availableAvatars[0];
    return avatar.emoji;
  };

  if (!user) {
    return null;
  }

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, md: 3 } }}>
        {/* Logo/Brand */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Logo onClick={() => navigate('/')} />
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            startIcon={<Home />}
            sx={{
              backgroundColor: isActive('/') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: isActive('/') ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              },
              fontWeight: isActive('/') ? 600 : 400,
            }}
          >
            Home
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/content"
            startIcon={<Movie />}
            sx={{
              backgroundColor: isActive('/content') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: isActive('/content') ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              },
              fontWeight: isActive('/content') ? 600 : 400,
            }}
          >
            Content
          </Button>
              <Button
                color="inherit"
                component={Link}
                to="/search"
                startIcon={<Search />}
                sx={{
                  backgroundColor: isActive('/search') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive('/search') ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                  },
                  fontWeight: isActive('/search') ? 600 : 400,
                }}
              >
                Search
              </Button>
          <Button
            color="inherit"
            component={Link}
            to="/watchlist"
            startIcon={<Bookmark />}
            sx={{
              backgroundColor: isActive('/watchlist') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: isActive('/watchlist') ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              },
              fontWeight: isActive('/watchlist') ? 600 : 400,
            }}
          >
            Watchlist
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/channels"
            startIcon={<Forum />}
            sx={{
              backgroundColor: isActive('/channels') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: isActive('/channels') ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              },
              fontWeight: isActive('/channels') ? 600 : 400,
            }}
          >
            Channels
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/ai"
            startIcon={<TrendingUp />}
            sx={{
              backgroundColor: isActive('/ai') ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: isActive('/ai') ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
              },
              fontWeight: isActive('/ai') ? 600 : 400,
            }}
          >
            AI
          </Button>
        </Box>
          </Box>
        )}

        {/* User Profile Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle Button */}
          <IconButton
            color="inherit"
            onClick={handleThemeToggle}
            aria-label="toggle theme"
            title={`Current theme: ${themeMode}`}
          >
            {getThemeIcon()}
          </IconButton>

          {isMobile ? (
            <>
              {/* Mobile Logo */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', mr: 2 }}>
                <Logo variant="compact" onClick={() => navigate('/')} />
              </Box>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMobileMenuOpen}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {navItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      handleMenuClose();
                    }}
                    sx={{
                      backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.12)' : 'transparent',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      '&:hover': {
                        backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.16)' : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.icon}
                      {item.label}
                    </Box>
                  </MenuItem>
                ))}
                <MenuItem onClick={handleThemeToggle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getThemeIcon()}
                    {themeMode === 'light' ? 'Light Theme' : 'Dark Theme'}
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleProfileClick}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountCircle />
                    Profile
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Logout />
                    Logout
                  </Box>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Typography
                variant="body2"
                sx={{
                  mr: -1,
                  color: 'white',
                  fontWeight: 500,
                }}
              >
                {user.username}
              </Typography>
          <IconButton
            size="large"
                edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
                onClick={handleProfileMenuOpen}
            color="inherit"
          >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '1.2rem' }}>
                  {getUserAvatar()}
                </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
                  vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
                onClose={handleMenuClose}
          >
                <MenuItem onClick={handleProfileClick}>
                  <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
            </MenuItem>
          </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;

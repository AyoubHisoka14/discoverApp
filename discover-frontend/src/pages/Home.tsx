import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Paper,
  Tabs,
  Tab,
  Rating,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  TrendingUp,
  Star,
  PlayArrow,
  Bookmark,
  Add,
  Movie,
  Tv,
  Animation,
  Whatshot,
  Schedule,
  Person,
  Forum,
  Search,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { contentAPI, recommendationsAPI } from '../services/api';
import { ContentDto, ContentType } from '../types';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/ContentCard';
import ScrollableContentSection from '../components/ScrollableContentSection';
import HeroSection from '../components/HeroSection';
import { usePageState } from '../hooks/usePageState';
import { ContentGridSkeleton, HeroSectionSkeleton } from '../components/SkeletonComponents';

// State persistence key
const HOME_STATE_KEY = 'homePageState';

interface HomePageState {
  contentTypeIndex: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // Use the enhanced page state hook with auto-reset
  const { state, updateState } = usePageState<HomePageState>({
    key: HOME_STATE_KEY,
    initialState: {
      contentTypeIndex: 0,
    },
    persist: true,
    autoResetMinutes: 2, // Auto reset state after 2 minutes
  });

  const { contentTypeIndex } = state;
  const contentType = [ContentType.MOVIE, ContentType.SERIES, ContentType.ANIME][contentTypeIndex];



  // Fetch trending content for all types (for HeroSection)
  const { data: trendingMoviesData, isLoading: trendingMoviesLoading } = useQuery(
    ['trending', ContentType.MOVIE],
    () => contentAPI.getTrendingContent(ContentType.MOVIE),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  const { data: trendingSeriesData, isLoading: trendingSeriesLoading } = useQuery(
    ['trending', ContentType.SERIES],
    () => contentAPI.getTrendingContent(ContentType.SERIES),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  const { data: trendingAnimeData, isLoading: trendingAnimeLoading } = useQuery(
    ['trending', ContentType.ANIME],
    () => contentAPI.getTrendingContent(ContentType.ANIME),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  // Fetch recommendations
  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery(
    ['recommendations'],
    () => recommendationsAPI.getRecommendations({ description: 'Show me popular content' }),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  const handleContentTypeChange = (event: React.SyntheticEvent, newValue: number) => {
    updateState({ contentTypeIndex: newValue });
  };

  // Combine first 4 items from each content type for HeroSection
  const getHeroContent = () => {
    const movies = trendingMoviesData?.data?.slice(0, 4) || [];
    const series = trendingSeriesData?.data?.slice(0, 4) || [];
    const anime = trendingAnimeData?.data?.slice(0, 4) || [];

    return [...movies, ...series, ...anime];
  };

  // Get content for tabs (excluding hero items)
  const getTabContent = () => {
    const heroContent = getHeroContent();
    const heroIds = new Set(heroContent.map(item => item.id));

    const allContent = trendingMoviesData?.data || [];
    return allContent.filter(item => !heroIds.has(item.id));
  };

  const heroContent = getHeroContent();
  const tabContent = getTabContent();
  const recommendations = recommendationsData?.data || [];

  // Mock quick stats
  const quickStats = [
    { label: 'Watchlist Items', value: '25', icon: <Bookmark />, color: 'primary.main' },
    { label: 'Reviews Written', value: '8', icon: <Star />, color: 'warning.main' },
    { label: 'Channels Joined', value: '3', icon: <Forum />, color: 'secondary.main' },
    { label: 'Hours Watched', value: '156', icon: <Schedule />, color: 'success.main' },
  ];

  // Loading state for hero section
  const heroLoading = trendingMoviesLoading || trendingSeriesLoading || trendingAnimeLoading;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Discover
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your personalized hub for discovering amazing movies, TV series, and anime
        </Typography>
      </Box>

      {/* Hero Section with Trending Content from all types */}
      <HeroSection content={heroContent} loading={heroLoading} />

      {/* Content Type Tabs */}
      <Paper sx={{ p: 2, paddingBottom: 0, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
              value={contentTypeIndex}
              onChange={handleContentTypeChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons={isMobile ? 'auto' : false}
              textColor="primary"
              indicatorColor="primary"
          >
            <Tab
                label="Movies"
                icon={<Movie />}
                iconPosition="start"
                sx={{ minHeight: 64 }}
            />
            <Tab
                label="TV Series"
                icon={<Tv />}
                iconPosition="start"
                sx={{ minHeight: 64 }}
            />
            <Tab
                label="Anime"
                icon={<Animation />}
                iconPosition="start"
                sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Box>

        <TabPanel value={contentTypeIndex} index={0}>
          {trendingMoviesLoading ? (
            <ContentGridSkeleton count={8} />
          ) : (
            <ScrollableContentSection
                title="More Trending Movies"
                items={trendingMoviesData?.data?.slice(5, 21) || []}
                loading={false}
                loadingText="Loading more trending movies..."
                itemsPerView={4}
                icon={<Whatshot sx={{ color: 'error.main' }} />}
            />
          )}
        </TabPanel>

        <TabPanel value={contentTypeIndex} index={1}>
          {trendingSeriesLoading ? (
            <ContentGridSkeleton count={8} />
          ) : (
            <ScrollableContentSection
                title="More Trending TV Series"
                items={trendingSeriesData?.data?.slice(5, 21) || []}
                loading={false}
                loadingText="Loading more trending series..."
                itemsPerView={4}
                icon={<Whatshot sx={{ color: 'error.main' }} />}
            />
          )}
        </TabPanel>

        <TabPanel value={contentTypeIndex} index={2}>
          {trendingAnimeLoading ? (
            <ContentGridSkeleton count={8} />
          ) : (
            <ScrollableContentSection
                title="More Trending Anime"
                items={trendingAnimeData?.data?.slice(5, 21) || []}
                loading={false}
                loadingText="Loading more trending anime..."
                itemsPerView={4}
                icon={<Whatshot sx={{ color: 'error.main' }} />}
            />
          )}
        </TabPanel>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content Area */}
        <Grid item xs={12} lg={8}>
          {/* Quick Stats */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Activity Overview
            </Typography>
            <Grid container spacing={2}>
              {quickStats.map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: stat.color, mb: 1 }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>



          {/* AI Recommendations */}
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<TrendingUp />}
              onClick={() => navigate('/ai')}
            >
              Get More Recommendations
            </Button>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Bookmark />}
                onClick={() => navigate('/watchlist')}
                fullWidth
              >
                View Watchlist
              </Button>
              <Button
                variant="outlined"
                startIcon={<Search />}
                onClick={() => navigate('/search')}
                fullWidth
              >
                Search Content
              </Button>
              <Button
                variant="outlined"
                startIcon={<Forum />}
                onClick={() => navigate('/channels')}
                fullWidth
              >
                Join Channels
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;

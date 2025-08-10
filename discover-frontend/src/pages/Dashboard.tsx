import React from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
} from '@mui/material';
import {
  Movie,
  Tv,
  Animation,
  Forum,
  Bookmark,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import PageHeader from '../components/PageHeader';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const features: Feature[] = [
    {
      title: 'Movies',
      description: 'Discover and explore the latest movies',
      icon: <Movie sx={{ fontSize: 40 }} />,
      path: '/movies',
      color: '#1976d2',
    },
    {
      title: 'TV Series',
      description: 'Find your next binge-worthy series',
      icon: <Tv sx={{ fontSize: 40 }} />,
      path: '/series',
      color: '#dc004e',
    },
    {
      title: 'Anime',
      description: 'Explore Japanese animation',
      icon: <Animation sx={{ fontSize: 40 }} />,
      path: '/anime',
      color: '#9c27b0',
    },
    {
      title: 'Channels',
      description: 'Join discussions with other fans',
      icon: <Forum sx={{ fontSize: 40 }} />,
      path: '/channels',
      color: '#ff9800',
    },
    {
      title: 'Watchlist',
      description: 'Manage your saved content',
      icon: <Bookmark sx={{ fontSize: 40 }} />,
      path: '/watchlist',
      color: '#4caf50',
    },
    {
      title: 'Recommendations',
      description: 'Get AI-powered suggestions',
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      path: '/recommendations',
      color: '#00bcd4',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PageHeader
        title="Welcome to Discover"
        subtitle="Your ultimate destination for movies, TV series, and anime discovery"
      />

      <Grid container spacing={3}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <FeatureCard
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
              onClick={() => navigate(feature.path)}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Ready to start discovering?
        </Typography>
        <Typography color="text.secondary" paragraph>
          Choose a category above or use our AI-powered recommendation system
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/recommendations')}
          sx={{ mr: 2 }}
        >
          Get Recommendations
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/movies')}
        >
          Browse Movies
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard; 
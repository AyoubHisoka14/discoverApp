import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Box,
  Grid,
  Paper,
  Typography,
  Container,
} from '@mui/material';

// Content Card Skeleton
export const ContentCardSkeleton = () => (
  <Card sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
    <Skeleton variant="rectangular" height={200} />
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
        <Skeleton variant="rectangular" width={60} height={24} />
        <Skeleton variant="rectangular" width={60} height={24} />
      </Box>
    </CardContent>
  </Card>
);

// Content Grid Skeleton
export const ContentGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
        <ContentCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

// Hero Section Skeleton
export const HeroSectionSkeleton = () => (
  <Box sx={{ position: 'relative', height: 400, mb: 4 }}>
    <Skeleton variant="rectangular" height="100%" />
    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 3, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
      <Skeleton variant="text" height={48} width="60%" sx={{ mb: 2 }} />
      <Skeleton variant="text" height={20} width="40%" sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="80%" />
    </Box>
  </Box>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <Grid container spacing={4}>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="text" height={32} width="60%" sx={{ mx: 'auto', mb: 1 }} />
        <Skeleton variant="text" height={20} width="80%" sx={{ mx: 'auto', mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={40} />
      </Paper>
    </Grid>
    <Grid item xs={12} md={8}>
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="text" height={32} width="40%" sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Skeleton variant="rectangular" height={56} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Skeleton variant="rectangular" height={56} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={80} />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  </Grid>
);

// Search Results Skeleton
export const SearchResultsSkeleton = () => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Skeleton variant="circular" width={24} height={24} sx={{ mr: 1 }} />
      <Skeleton variant="text" height={32} width="40%" />
      <Skeleton variant="circular" width={20} height={20} sx={{ ml: 2 }} />
    </Box>
    <ContentGridSkeleton count={12} />
  </Box>
);

// Channel Card Skeleton
export const ChannelCardSkeleton = () => (
  <Card sx={{ height: 200 }}>
    <CardContent>
      <Skeleton variant="text" height={28} width="70%" sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="100%" sx={{ mb: 1 }} />
      <Skeleton variant="text" height={20} width="60%" sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
    </CardContent>
  </Card>
);

// Content Details Skeleton
export const ContentDetailsSkeleton = () => (
  <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
      <Skeleton variant="text" height={32} width="200px" />
    </Box>
    
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Skeleton variant="rectangular" height={500} />
      </Grid>
      <Grid item xs={12} md={8}>
        <Skeleton variant="text" height={48} width="80%" sx={{ mb: 2 }} />
        <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} width="40%" sx={{ mb: 3 }} />
        <Skeleton variant="text" height={16} width="100%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={16} width="100%" sx={{ mb: 1 }} />
        <Skeleton variant="text" height={16} width="80%" sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Skeleton variant="rectangular" width={100} height={36} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </Box>
      </Grid>
    </Grid>
  </Container>
);

// AI Recommendations Skeleton
export const AIRecommendationsSkeleton = () => (
  <Box>
    <Skeleton variant="text" height={32} width="50%" sx={{ mb: 2 }} />
    <Skeleton variant="text" height={20} width="30%" sx={{ mb: 3 }} />
    <ContentGridSkeleton count={6} />
  </Box>
); 
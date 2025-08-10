import React from 'react';
import {
  Box,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {Animation, Bookmark, CheckCircle, Movie, PlayArrow, Tv,} from '@mui/icons-material';
import {useQuery} from 'react-query';
import {watchlistAPI} from '../services/api';
import {ContentType, PageType, WatchlistItemDto, WatchListItemStatus} from '../types';
import {useAuth} from '../contexts/AuthContext';
import ContentCard from '../components/ContentCard';
import { usePageState } from '../hooks/usePageState';
import { ContentGridSkeleton } from '../components/SkeletonComponents';

// State persistence key
const WATCHLIST_STATE_KEY = 'watchlistPageState';

interface WatchlistPageState {
  statusFilter: number;
  contentTypeFilter: ContentType | 'ALL';
  sortBy: string;
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
      id={`watchlist-tabpanel-${index}`}
      aria-labelledby={`watchlist-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Watchlist = () => {
  // Use the enhanced page state hook with auto-reset
  const { state, updateState } = usePageState<WatchlistPageState>({
    key: WATCHLIST_STATE_KEY,
    initialState: {
      statusFilter: 0,
      contentTypeFilter: 'ALL',
      sortBy: 'addedAt',
    },
    persist: true,
    autoResetMinutes: 2, // Auto reset state after 2 minutes
  });

  const { statusFilter, contentTypeFilter, sortBy } = state;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  // Fetch watchlist data
  const { data: watchlistData = [], isLoading: watchlistLoading } = useQuery(
    ['watchlist'],
    () => watchlistAPI.getUserWatchlist().then(res => res.data),
    {
      enabled: !!user,
    }
  );

  const handleStatusFilterChange = (event: React.SyntheticEvent, newValue: number) => {
    updateState({ statusFilter: newValue });
  };

  const handleContentTypeFilterChange = (event: any) => {
    updateState({ contentTypeFilter: event.target.value });
  };

  // Get status for tab index
  const getStatusForTab = (tabIndex: number): string | null => {
    switch (tabIndex) {
      case 0: return null; // All
      case 1: return WatchListItemStatus.WATCHLIST;
      case 2: return WatchListItemStatus.IN_PROGRESS;
      case 3: return WatchListItemStatus.WATCHED;
      default: return null;
    }
  };

  // Filter and sort watchlist items
  const filteredWatchlist = watchlistData
    .filter((item: WatchlistItemDto) => {
      // Status filter
      const targetStatus = getStatusForTab(statusFilter);
      const matchesStatus = !targetStatus || item.status === targetStatus;

      // Content type filter
      const matchesContentType = contentTypeFilter === 'ALL' || item.content?.type === contentTypeFilter;

      return matchesStatus && matchesContentType;
    })
    .sort((a: WatchlistItemDto, b: WatchlistItemDto) => {
      switch (sortBy) {
        case 'title':
          // Use content title if available, otherwise fall back to contentId
          const titleA = a.content?.title || `Content ${a.contentId}`;
          const titleB = b.content?.title || `Content ${b.contentId}`;
          return titleA.localeCompare(titleB);
        case 'addedAt':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'rating':
          // Use content ratings if available, otherwise sort by ID
          const ratingA = a.content?.ratings || 0;
          const ratingB = b.content?.ratings || 0;
          return ratingB - ratingA;
        default:
          return 0;
      }
    });

  if (watchlistLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading watchlist...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Watchlist
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your saved movies, TV series, and anime
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={contentTypeFilter}
                label="Content Type"
                onChange={handleContentTypeFilterChange}
              >
                <MenuItem value="ALL">All Types</MenuItem>
                <MenuItem value={ContentType.MOVIE}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Movie />
                    Movies
                  </Box>
                </MenuItem>
                <MenuItem value={ContentType.SERIES}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tv />
                    TV Series
                  </Box>
                </MenuItem>
                <MenuItem value={ContentType.ANIME}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Animation />
                    Anime
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => updateState({ sortBy: e.target.value })}
              >
                <MenuItem value="addedAt">Date Added</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="contentId">Content ID</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Total: {filteredWatchlist.length} items
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Status Tabs */}
      <Paper sx={{ mb: 3}}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={statusFilter}
            onChange={handleStatusFilterChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons={isMobile ? 'auto' : false}
          >
            <Tab
              label="All"
              icon={<Bookmark />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="Watchlist"
              icon={<Bookmark />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="In Progress"
              icon={<PlayArrow />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
            <Tab
              label="Watched"
              icon={<CheckCircle />}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ bgcolor: 'background.default'}}>
          <TabPanel value={statusFilter} index={0}>
            {watchlistLoading ? (
              <ContentGridSkeleton count={8} />
            ) : (
              <>
                <Grid container spacing={3}>
                  {filteredWatchlist.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                      <ContentCard item={item} isWatchListItem={true} showActions={true} page={PageType.WATCHLIST}/>
                    </Grid>
                  ))}
                </Grid>
                {filteredWatchlist.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Bookmark sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No items found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or search terms
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </TabPanel>
          <TabPanel value={statusFilter} index={1}>
            {watchlistLoading ? (
              <ContentGridSkeleton count={8} />
            ) : (
              <>
                <Grid container spacing={3}>
                  {filteredWatchlist.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                      <ContentCard item={item} isWatchListItem={true} showActions={true} page={PageType.WATCHLIST}/>
                    </Grid>
                  ))}
                </Grid>
                {filteredWatchlist.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Bookmark sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No watchlist items found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add some content to your watchlist to get started
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </TabPanel>
          <TabPanel value={statusFilter} index={2}>
            {watchlistLoading ? (
              <ContentGridSkeleton count={8} />
            ) : (
              <>
                <Grid container spacing={3}>
                  {filteredWatchlist.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                      <ContentCard item={item} isWatchListItem={true} showActions={true} page={PageType.WATCHLIST}/>
                    </Grid>
                  ))}
                </Grid>
                {filteredWatchlist.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <PlayArrow sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No in-progress items found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start watching some content to see it here
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </TabPanel>
          <TabPanel value={statusFilter} index={3}>
            {watchlistLoading ? (
              <ContentGridSkeleton count={8} />
            ) : (
              <>
                <Grid container spacing={3}>
                  {filteredWatchlist.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                      <ContentCard item={item} isWatchListItem={true} showActions={true} page={PageType.WATCHLIST}/>
                    </Grid>
                  ))}
                </Grid>
                {filteredWatchlist.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CheckCircle sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No watched items found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete some content to see it here
                </Typography>
              </Box>
            )}
          </>
        )}
      </TabPanel>
        </Box>
      </Paper>
    </Container>
  );
};

export default Watchlist;

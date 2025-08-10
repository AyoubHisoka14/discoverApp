import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Tabs,
  Tab,
  Paper,
  Rating,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Movie,
  Tv,
  Animation,
  Clear,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { contentAPI } from '../services/api';
import {ContentDto, ContentType, PageType} from '../types';
import ContentCard from "../components/ContentCard";
import { usePageState } from '../hooks/usePageState';
import { SearchResultsSkeleton } from '../components/SkeletonComponents';
import SearchAutocomplete from '../components/SearchAutocomplete';
import { useToast } from '../components/ToastNotification';

// State persistence keys
const SEARCH_STATE_KEY = 'searchPageState';
const SEARCH_SCROLL_KEY = 'searchScrollPosition';

interface SearchPageState {
  searchQuery: string;
  contentType: ContentType;
  searchResults: ContentDto[];
  hasSearched: boolean;
}

const Search = () => {
  const location = useLocation();
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useToast();
  
  // Use the enhanced page state hook with auto-reset
  const { state, updateState, clearSavedState } = usePageState<SearchPageState>({
    key: SEARCH_STATE_KEY,
    initialState: {
      searchQuery: '',
      contentType: ContentType.MOVIE,
      searchResults: [],
      hasSearched: false,
    },
    persist: true,
    autoResetMinutes: 2, // Auto reset state after 2 minutes
  });

  const [isSearching, setIsSearching] = useState(false);

  // Destructure state for easier access
  const { searchQuery, contentType, searchResults, hasSearched } = state;

  // Save scroll position
  const saveScrollPosition = () => {
    if (searchResultsRef.current) {
      localStorage.setItem(SEARCH_SCROLL_KEY, searchResultsRef.current.scrollTop.toString());
    }
  };

  // Restore scroll position
  const restoreScrollPosition = () => {
    const savedScroll = localStorage.getItem(SEARCH_SCROLL_KEY);
    if (savedScroll && searchResultsRef.current) {
      setTimeout(() => {
        if (searchResultsRef.current) {
          searchResultsRef.current.scrollTop = parseInt(savedScroll);
        }
      }, 100);
    }
  };

  // Search query
  const { data: searchResultsData = [], isLoading, error, refetch } = useQuery<ContentDto[]>(
    ['search', searchQuery, contentType],
    () => {
      if (!searchQuery.trim()) return Promise.resolve([]);
      return contentAPI.searchContent(contentType, searchQuery).then(res => res.data);
    },
    {
      enabled: false, // Don't auto-search, wait for user action
      onSuccess: (data) => {
        updateState({ searchResults: data, hasSearched: true });
      },
    }
  );

  // Restore search results from saved state on mount
  useEffect(() => {
    if (hasSearched && searchQuery.trim()) {
      // Don't trigger a new search, just restore scroll position
      setTimeout(restoreScrollPosition, 200);
    }
  }, []);

  // Save scroll position when component unmounts
  useEffect(() => {
    return () => {
      saveScrollPosition();
    };
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      updateState({ searchQuery, contentType });
      refetch()
        .then(() => {
          showSuccess(`Found ${searchResults.length} results for "${searchQuery}"`);
        })
        .catch(() => {
          showError('Search failed. Please try again.');
        })
        .finally(() => setIsSearching(false));
    }
  };

  const handleClear = () => {
    updateState({ 
      searchQuery: '', 
      hasSearched: false, 
      searchResults: [] 
    });
    clearSavedState();
    setIsSearching(false);
  };

  const handleContentTypeChange = (event: React.SyntheticEvent, newType: ContentType) => {
    updateState({ contentType: newType });
    if (searchQuery.trim() && hasSearched) {
      // Only trigger a new search if we've already searched before
      refetch();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const getContentIcon = () => {
    switch (contentType) {
      case ContentType.MOVIE:
        return <Movie />;
      case ContentType.SERIES:
        return <Tv />;
      case ContentType.ANIME:
        return <Animation />;
      default:
        return <Movie />;
    }
  };

  const getContentTitle = () => {
    switch (contentType) {
      case ContentType.MOVIE:
        return 'Movies';
      case ContentType.SERIES:
        return 'TV Series';
      case ContentType.ANIME:
        return 'Anime';
      default:
        return 'Content';
    }
  };

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case ContentType.MOVIE:
        return 'primary' as const;
      case ContentType.SERIES:
        return 'secondary' as const;
      case ContentType.ANIME:
        return 'default' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Search {getContentTitle()}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find your favorite movies, TV series, and anime by title, genre, or description.
        </Typography>
      </Box>

      {/* Search Input */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <SearchAutocomplete
            value={searchQuery}
            onChange={(value) => updateState({ searchQuery: value })}
            onSearch={handleSearch}
            placeholder={`Search ${contentType.toLowerCase()}...`}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || isSearching}
            sx={{ minWidth: 120 }}
          >
            {isSearching ? <CircularProgress size={20} /> : 'Search'}
          </Button>
        </Box>

        {/* Content Type Tabs */}
        <Tabs
          value={contentType}
          onChange={handleContentTypeChange}
          centered
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: '0.9rem',
            },
          }}
        >
          <Tab
            value={ContentType.MOVIE}
            label="Movies"
            icon={<Movie />}
            iconPosition="start"
          />
          <Tab
            value={ContentType.SERIES}
            label="Series"
            icon={<Tv />}
            iconPosition="start"
          />
          <Tab
            value={ContentType.ANIME}
            label="Anime"
            icon={<Animation />}
            iconPosition="start"
        />
        </Tabs>
      </Paper>

      {/* Search Results */}
      <Box ref={searchResultsRef}>
        {(searchQuery || hasSearched) && (
          <Box>
            {isLoading ? (
              <SearchResultsSkeleton />
            ) : error ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">
                  Error searching content. Please try again.
                </Typography>
              </Paper>
            ) : searchResults.length === 0 && hasSearched ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No results found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or switching to a different content type.
                </Typography>
              </Paper>
            ) : searchResults.length > 0 ? (
              <React.Fragment>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  {getContentIcon()}
                  <Typography variant="h5" sx={{ ml: 1 }}>
                    Search Results for "{searchQuery}"
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </Typography>
                <Grid container spacing={2}>
                  {searchResults.map((item: ContentDto) => (
                    <Grid item xs={12} sm={6} md={3} key={item.id}>
                      <ContentCard item={item} page={PageType.CONTENT}/>
                    </Grid>
                  ))}
                </Grid>
              </React.Fragment>
            ) : null}
          </Box>
        )}

        {/* Empty State */}
        {!searchQuery && !hasSearched && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SearchIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Start your search
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a title, genre, or description to find amazing content.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Search;

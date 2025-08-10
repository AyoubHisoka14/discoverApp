import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Typography,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Search as SearchIcon,
  Movie,
  Tv,
  Animation,
  History,
  TrendingUp,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { contentAPI } from '../services/api';
import { ContentDto, ContentType } from '../types';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'content' | 'recent' | 'trending';
  contentType?: ContentType;
  externalId?: string;
}

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search for movies, TV series, anime...",
  fullWidth = true,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Search content based on input
  const { data: searchResultsResponse, isLoading } = useQuery(
    ['search-suggestions', inputValue],
    () => contentAPI.searchContent(ContentType.MOVIE, inputValue),
    {
      enabled: inputValue.length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const searchResults = searchResultsResponse?.data || [];

  // Generate suggestions
  const getSuggestions = (): SearchSuggestion[] => {
    const suggestions: SearchSuggestion[] = [];

    // Add recent searches
    recentSearches.forEach(search => {
      suggestions.push({
        id: `recent-${search}`,
        title: search,
        type: 'recent',
      });
    });

    // Add trending searches (mock data)
    const trendingSearches = ['Avengers', 'Game of Thrones', 'Naruto', 'Breaking Bad', 'Friends'];
    trendingSearches.forEach(search => {
      if (!recentSearches.includes(search)) {
        suggestions.push({
          id: `trending-${search}`,
          title: search,
          type: 'trending',
        });
      }
    });

    // Add search results
    searchResults.forEach((item: ContentDto) => {
      suggestions.push({
        id: `content-${item.id}`,
        title: item.title,
        type: 'content',
        contentType: item.type,
        externalId: item.externalId,
      });
    });

    return suggestions;
  };

  const handleInputChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (newInputValue.length >= 2) {
        // Trigger search query
      }
    }, 300);
  };

  const handleOptionSelect = (event: React.SyntheticEvent, value: string | SearchSuggestion | null) => {
    if (typeof value === 'string') {
      onChange(value);
      saveRecentSearch(value);
      onSearch();
    } else if (value) {
      onChange(value.title);
      saveRecentSearch(value.title);
      onSearch();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && value.trim()) {
      saveRecentSearch(value);
      onSearch();
    }
  };

  const getOptionIcon = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'recent':
        return <History fontSize="small" />;
      case 'trending':
        return <TrendingUp fontSize="small" />;
      case 'content':
        switch (suggestion.contentType) {
          case ContentType.MOVIE:
            return <Movie fontSize="small" />;
          case ContentType.SERIES:
            return <Tv fontSize="small" />;
          case ContentType.ANIME:
            return <Animation fontSize="small" />;
          default:
            return <SearchIcon fontSize="small" />;
        }
      default:
        return <SearchIcon fontSize="small" />;
    }
  };

  const getOptionColor = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'recent':
        return 'primary';
      case 'trending':
        return 'secondary';
      case 'content':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Autocomplete
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={getSuggestions()}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option.title;
      }}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      onKeyPress={handleKeyPress}
      loading={isLoading}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <SearchIcon color="action" />
              </Box>
            ),
            endAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {isLoading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </Box>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'background.paper',
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <ListItem {...props} sx={{ py: 1 }}>
          <ListItemIcon sx={{ minWidth: 36 }}>
            {getOptionIcon(option)}
          </ListItemIcon>
          <ListItemText
            primary={option.title}
            secondary={
              option.type === 'content' 
                ? `${option.contentType} • Click to view details`
                : option.type === 'recent'
                ? 'Recent search'
                : 'Trending search'
            }
          />
          {option.type !== 'content' && (
            <Chip
              label={option.type}
              size="small"
              color={getOptionColor(option)}
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </ListItem>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={typeof option === 'string' ? option : option.title}
            {...getTagProps({ index })}
            size="small"
          />
        ))
      }
      PaperComponent={({ children }) => (
        <Paper
          elevation={8}
          sx={{
            mt: 1,
            '& .MuiAutocomplete-listbox': {
              maxHeight: 300,
            },
          }}
        >
          {children}
        </Paper>
      )}
      noOptionsText={
        inputValue.length < 2 
          ? "Type at least 2 characters to search..."
          : "No results found"
      }
    />
  );
};

export default SearchAutocomplete; 
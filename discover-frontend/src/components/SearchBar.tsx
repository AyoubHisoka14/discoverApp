import React, { KeyboardEvent, ChangeEvent } from 'react';
import {
  TextField,
  Button,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear,
} from '@mui/icons-material';

interface SearchBarProps {
  searchQuery: string;
  searchType: string;
  isSearching: boolean;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  onClearSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  searchType,
  isSearching,
  onSearchQueryChange,
  onSearch,
  onClearSearch,
}) => {
  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onSearchQueryChange(e.target.value);
  };

  return (
    <>
      <TextField
        fullWidth
        placeholder={`Search ${searchType}...`}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <Button
                size="small"
                onClick={onClearSearch}
                startIcon={<Clear />}
              >
                Clear
              </Button>
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        onClick={onSearch}
        disabled={!searchQuery.trim() || isSearching}
        sx={{ minWidth: 120 }}
      >
        {isSearching ? <CircularProgress size={20} /> : 'Search'}
      </Button>
    </>
  );
};

export default SearchBar; 
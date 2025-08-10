import React from 'react';
import {
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Movie,
  Tv,
  Animation,
} from '@mui/icons-material';

interface ContentTypeTabsProps {
  value: string;
  onChange: (event: React.SyntheticEvent, newValue: string) => void;
  centered?: boolean;
  sx?: any;
}

const ContentTypeTabs: React.FC<ContentTypeTabsProps> = ({
  value,
  onChange,
  centered = true,
  sx,
}) => {
  return (
    <Paper sx={sx}>
      <Tabs
        value={value}
        onChange={onChange}
        centered={centered}
        sx={{
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: '1rem',
          },
          ...sx,
        }}
      >
        <Tab
          value="movies"
          label="Movies"
          icon={<Movie />}
          iconPosition="start"
        />
        <Tab
          value="series"
          label="TV Series"
          icon={<Tv />}
          iconPosition="start"
        />
        <Tab
          value="anime"
          label="Anime"
          icon={<Animation />}
          iconPosition="start"
        />
      </Tabs>
    </Paper>
  );
};

export default ContentTypeTabs; 
import React from 'react';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actionButton,
}) => {
  return (
    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {actionButton && (
        <Button
          variant="contained"
          startIcon={actionButton.icon}
          onClick={actionButton.onClick}
        >
          {actionButton.label}
        </Button>
      )}
    </Box>
  );
};

export default PageHeader; 
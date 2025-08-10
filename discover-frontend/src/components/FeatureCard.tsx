import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
} from '@mui/material';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  color,
  onClick,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
            color: color,
          }}
        >
          {icon}
        </Box>
        <Typography gutterBottom variant="h5" component="h2">
          {title}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {description}
        </Typography>
        <Button
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Explore
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard; 
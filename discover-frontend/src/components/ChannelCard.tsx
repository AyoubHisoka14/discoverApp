import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from '@mui/material';
import {
  Forum,
} from '@mui/icons-material';
import { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  onJoinChannel: (channelId: string) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onJoinChannel,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleJoinChannel = () => {
    onJoinChannel(channel.id.toString());
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Forum sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {channel.name}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
          {channel.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Created on {formatDate(channel.createdAt)}
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleJoinChannel}
        >
          Join Channel
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChannelCard; 
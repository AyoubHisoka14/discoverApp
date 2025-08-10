import React, { useState, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import {
  Add,
  Group,
  Message,
  Delete,
  Edit,
  Sort,
  FilterList, 
  Create,
  ExitToApp,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { channelsAPI } from '../services/api';
import { ChannelDto, CreateChannelRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Tab types
type ChannelTab = 'all' | 'joined' | 'created';

// Sort types
type SortOption = 'name-asc' | 'name-desc' | 'members-asc' | 'members-desc' | 'date-asc' | 'date-desc';

const Channels = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<ChannelDto | null>(null);
  const [newChannelData, setNewChannelData] = useState<CreateChannelRequest>({
    name: '',
    description: '',
  });
  const [activeTab, setActiveTab] = useState<ChannelTab>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch channels
  const { data: channels = [], isLoading } = useQuery<ChannelDto[]>(
    'channels',
    () => channelsAPI.getChannels().then(res => res.data),
    {
      retry: 1,
    }
  );

  // Filter and sort channels based on active tab and sort option
  const filteredAndSortedChannels = useMemo(() => {
    let filteredChannels = channels;

    // Filter by tab
    switch (activeTab) {
      case 'joined':
        filteredChannels = channels.filter(channel => channel.joined);
        break;
      case 'created':
        filteredChannels = channels.filter(channel => user && channel.createdById === user.id);
        break;
      case 'all':
      default:
        filteredChannels = channels;
        break;
    }

    // Sort channels
    const sortedChannels = [...filteredChannels].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'members-asc':
          return a.memberCount - b.memberCount;
        case 'members-desc':
          return b.memberCount - a.memberCount;
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return sortedChannels;
  }, [channels, activeTab, sortBy, user]);

  // Create channel mutation
  const createChannelMutation = useMutation(
    (data: CreateChannelRequest) => channelsAPI.createChannel(data).then(res => res.data),
    {
      onSuccess: (data) => {
        console.log('Channel created successfully:', data);
        queryClient.invalidateQueries('channels');
        setIsCreateDialogOpen(false);
        setNewChannelData({ name: '', description: '' });
      },
      onError: (error: any) => {
        console.error('Error creating channel:', error);
        console.error('Error response:', error.response);
      },
    }
  );

  // Delete channel mutation
  const deleteChannelMutation = useMutation(
    (channelId: number) => channelsAPI.deleteChannel(channelId).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('channels');
        setIsDeleteDialogOpen(false);
        setSelectedChannel(null);
      },
      onError: (error: any) => {
        console.error('Error deleting channel:', error);
        console.error('Error response:', error.response);
      },
    }
  );

  // Join channel mutation
  const joinChannelMutation = useMutation(
    (channelId: number) => channelsAPI.joinChannel(channelId).then(res => res.data),
    {
      onSuccess: () => {
        console.log('Join mutation succeeded');
        queryClient.invalidateQueries('channels');
      },
      onError: (error: any) => {
        console.error('Error joining channel:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
      },
    }
  );

  // Leave channel mutation
  const leaveChannelMutation = useMutation(
    (channelId: number) => channelsAPI.leaveChannel(channelId).then(res => res.data),
    {
      onSuccess: () => {
        console.log('Leave mutation succeeded');
        queryClient.invalidateQueries('channels');
        setIsLeaveDialogOpen(false);
        setSelectedChannel(null);
      },
      onError: (error: any) => {
        console.error('Error leaving channel:', error);
        console.error('Error response:', error.response);
      },
    }
  );

  const handleCreateChannel = () => {
    if (newChannelData.name.trim() && newChannelData.description.trim()) {
      createChannelMutation.mutate(newChannelData);
    }
  };

  const handleDeleteChannel = (channel: ChannelDto) => {
    setSelectedChannel(channel);
    setIsDeleteDialogOpen(true);
  };

  const handleLeaveChannel = (channel: ChannelDto) => {
    setSelectedChannel(channel);
    setIsLeaveDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedChannel) {
      deleteChannelMutation.mutate(selectedChannel.id);
    }
  };

  const handleConfirmLeave = () => {
    if (selectedChannel) {
      leaveChannelMutation.mutate(selectedChannel.id);
    }
  };

  const handleJoinChannel = (channelId: number) => {
    console.log('Attempting to join channel:', channelId);
    joinChannelMutation.mutate(channelId);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewChannelData({ name: '', description: '' });
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedChannel(null);
  };

  const handleCloseLeaveDialog = () => {
    setIsLeaveDialogOpen(false);
    setSelectedChannel(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: ChannelTab) => {
    setActiveTab(newValue);
  };

  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Channels
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join channels to discuss your favorite movies, series, and anime with other fans.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create Channel
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="channel tabs">
          <Tab label={`All Channels (${channels.length})`} value="all" />
          <Tab label={`Joined (${channels.filter(c => c.joined).length})`} value="joined" />
          <Tab label={`Created (${user ? channels.filter(c => c.createdById === user.id).length : 0})`} value="created" />
        </Tabs>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <FilterList color="action" />
          <Typography variant="body2" color="text.secondary">
            Sort by:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sort Order</InputLabel>
            <Select
              value={sortBy}
              label="Sort Order"
              onChange={handleSortChange}
            >
              <MenuItem value="name-asc">Name (A-Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z-A)</MenuItem>
              <MenuItem value="members-asc">Members (Low to High)</MenuItem>
              <MenuItem value="members-desc">Members (High to Low)</MenuItem>
              <MenuItem value="date-asc">Date Created (Oldest First)</MenuItem>
              <MenuItem value="date-desc">Date Created (Newest First)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Error Display */}
      {/* Error handling removed temporarily */}

      {/* Channels Grid */}
      <Grid container spacing={3}>
        {filteredAndSortedChannels.map((channel) => {
          const isCreator = user && channel.createdById === user.id;
          const canAccess = isCreator || channel.joined;
          return (
            <Grid item xs={12} sm={6} md={4} key={channel.id}>
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
                  cursor: canAccess ? 'pointer' : 'default',
                }}
                onClick={() => canAccess && navigate(`/channels/${channel.id}/chat`)}
              >
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {channel.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {isCreator ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Create />}
                          disabled
                        >
                          Created
                        </Button>
                      ) : channel.joined ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Group />}
                          disabled
                        >
                          Joined
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Group />}
                          onClick={e => { e.stopPropagation(); handleJoinChannel(channel.id); }}
                          disabled={joinChannelMutation.isLoading}
                        >
                          {joinChannelMutation.isLoading ? <CircularProgress size={16} /> : 'Join'}
                        </Button>
                      )}
                      
                      {/* Show delete button only for creator, leave button for joined users */}
                      {isCreator ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={e => { e.stopPropagation(); handleDeleteChannel(channel); }}
                          disabled={deleteChannelMutation.isLoading}
                        >
                          {deleteChannelMutation.isLoading ? <CircularProgress size={16} /> : 'Delete'}
                        </Button>
                      ) : channel.joined ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<ExitToApp />}
                          onClick={e => { e.stopPropagation(); handleLeaveChannel(channel); }}
                          disabled={leaveChannelMutation.isLoading}
                        >
                          {leaveChannelMutation.isLoading ? <CircularProgress size={16} /> : 'Leave'}
                        </Button>
                      ) : null}
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                    {channel.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      icon={<Group />}
                      label={`${channel.memberCount}`}
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(channel.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {filteredAndSortedChannels.length === 0 && !isLoading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Group sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {activeTab === 'all' && 'No channels yet'}
            {activeTab === 'joined' && 'You haven\'t joined any channels yet'}
            {activeTab === 'created' && 'You haven\'t created any channels yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {activeTab === 'all' && 'Be the first to create a channel and start discussions about your favorite content.'}
            {activeTab === 'joined' && 'Join some channels to start discussing your favorite content with other fans.'}
            {activeTab === 'created' && 'Create your first channel to start building a community around your favorite content.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            {activeTab === 'all' && 'Create First Channel'}
            {activeTab === 'joined' && 'Browse All Channels'}
            {activeTab === 'created' && 'Create Channel'}
          </Button>
        </Box>
      )}

      {/* Create Channel Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Channel</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Channel Name"
            fullWidth
            variant="outlined"
            value={newChannelData.name}
            onChange={(e) => setNewChannelData({ ...newChannelData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newChannelData.description}
            onChange={(e) => setNewChannelData({ ...newChannelData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button
            onClick={handleCreateChannel}
            variant="contained"
            disabled={!newChannelData.name.trim() || !newChannelData.description.trim() || createChannelMutation.isLoading}
          >
            {createChannelMutation.isLoading ? <CircularProgress size={20} /> : 'Create Channel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Channel Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Channel</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the channel "{selectedChannel?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. All messages and data in this channel will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleteChannelMutation.isLoading}
          >
            {deleteChannelMutation.isLoading ? <CircularProgress size={20} /> : 'Delete Channel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Channel Dialog */}
      <Dialog open={isLeaveDialogOpen} onClose={handleCloseLeaveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Leave Channel</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to leave the channel "{selectedChannel?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You will no longer be able to access this channel or see its messages. You can rejoin later if you change your mind.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLeaveDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmLeave}
            variant="contained"
            color="warning"
            disabled={leaveChannelMutation.isLoading}
          >
            {leaveChannelMutation.isLoading ? <CircularProgress size={20} /> : 'Leave Channel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Channels;

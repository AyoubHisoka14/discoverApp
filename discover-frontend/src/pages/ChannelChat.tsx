import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { messagesAPI, channelsAPI } from '../services/api';
import { MessageDto, CreateMessageRequest, ChannelDto } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Container,
  Divider,
  Chip,
  Alert,
  Avatar,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Send, Group, Person, ArrowBack, Delete, ExitToApp } from '@mui/icons-material';

const ChannelChat = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch channel details
  const { data: channel, isLoading: channelLoading, error: channelError } = useQuery<ChannelDto>(
    ['channel', channelId],
    () => channelsAPI.getChannel(Number(channelId)).then(res => res.data),
    { enabled: !!channelId, retry: false }
  );

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageDto[]>(
    ['messages', channelId],
    () => messagesAPI.getMessages(Number(channelId)).then(res => res.data),
    { enabled: !!channelId && !!channel }
  );

  // Join channel mutation
  const joinChannelMutation = useMutation(
    (channelId: number) => channelsAPI.joinChannel(channelId).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['channel', channelId]);
        queryClient.invalidateQueries(['messages', channelId]);
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
        navigate('/channels');
      },
      onError: (error: any) => {
        console.error('Error deleting channel:', error);
      },
    }
  );

  // Leave channel mutation
  const leaveChannelMutation = useMutation(
    (channelId: number) => channelsAPI.leaveChannel(channelId).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('channels');
        setIsLeaveDialogOpen(false);
        navigate('/channels');
      },
      onError: (error: any) => {
        console.error('Error leaving channel:', error);
      },
    }
  );

  // Post message mutation
  const postMessageMutation = useMutation(
    (data: CreateMessageRequest) => messagesAPI.postMessage(Number(channelId), data).then(res => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['messages', channelId]);
        setMessage('');
      },
    }
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      postMessageMutation.mutate({ content: message });
    }
  };

  const handleJoinChannel = () => {
    if (channelId) {
      joinChannelMutation.mutate(Number(channelId));
    }
  };

  const handleDeleteChannel = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleLeaveChannel = () => {
    setIsLeaveDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (channelId) {
      deleteChannelMutation.mutate(Number(channelId));
    }
  };

  const handleConfirmLeave = () => {
    if (channelId) {
      leaveChannelMutation.mutate(Number(channelId));
    }
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleCloseLeaveDialog = () => {
    setIsLeaveDialogOpen(false);
  };

  // Handle access denied
  if (channelError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          You need to join this channel to access the chat.
        </Alert>
        <Button
          variant="contained"
          startIcon={<Group />}
          onClick={handleJoinChannel}
          disabled={joinChannelMutation.isLoading}
        >
          {joinChannelMutation.isLoading ? <CircularProgress size={20} /> : 'Join Channel'}
        </Button>
      </Container>
    );
  }

  if (channelLoading || messagesLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!channel) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Channel not found.</Alert>
      </Container>
    );
  }

  const isOwner = user && channel.createdById === user.id;
  const isJoined = channel.joined;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/channels')}
          variant="outlined"
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1, ml: 2 }}>
          {channel.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isOwner ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Delete />}
              onClick={handleDeleteChannel}
              disabled={deleteChannelMutation.isLoading}
            >
              {deleteChannelMutation.isLoading ? <CircularProgress size={16} /> : 'Delete'}
            </Button>
          ) : isJoined ? (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              startIcon={<ExitToApp />}
              onClick={handleLeaveChannel}
              disabled={leaveChannelMutation.isLoading}
            >
              {leaveChannelMutation.isLoading ? <CircularProgress size={16} /> : 'Leave'}
            </Button>
          ) : null}
        </Box>
      </Box>

      {/* Channel Info Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                About this channel
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {channel.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Person sx={{ fontSize: 16 }} />
                <Typography variant="body2" color="text.secondary">
                  Created by {channel.createdByUsername}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  icon={<Group />}
                  label={`${channel.memberCount} Members`}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Created {new Date(channel.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Chat Section */}
      <Paper sx={{ p: 2, minHeight: 400, maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && (
          <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
            No messages yet. Start the conversation!
          </Typography>
        )}
        {messages.map((msg) => {
          const isOwnMessage = user && msg.userId === user.id;
          return (
            <Box
              key={msg.id}
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              {isOwnMessage ? (
                // Own message - right aligned with blue background
                <Box sx={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Paper
                    sx={{
                      p: 2,
                      background: 'grey',
                      color: 'white',
                      borderRadius: '18px 18px 4px 18px',
                      boxShadow: 2,
                    }}
                    elevation={2}
                  >
                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                      {msg.content}
                    </Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, mr: 1 }}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              ) : (
                // Other user's message - left aligned with avatar and gray background
                <Box sx={{ maxWidth: '70%', display: 'flex', gap: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem',
                      mt: 0.5
                    }}
                  >
                    {msg.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                        {msg.username}
                      </Typography>
                    </Box>
                    <Paper
                      sx={{
                        p: 2,
                        background: 'darkgrey',
                        borderRadius: '18px 18px 18px 4px',
                        boxShadow: 1,
                      }}
                      elevation={1}
                    >
                      <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                        {msg.content}
                      </Typography>
                    </Paper>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, alignSelf: 'flex-end' }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Message Input */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          disabled={postMessageMutation.isLoading}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!message.trim() || postMessageMutation.isLoading}
          startIcon={<Send />}
        >
          {postMessageMutation.isLoading ? <CircularProgress size={20} /> : 'Send'}
        </Button>
      </Box>

      {/* Delete Channel Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Channel</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the channel "{channel.name}"?
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
            Are you sure you want to leave the channel "{channel.name}"?
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

export default ChannelChat;

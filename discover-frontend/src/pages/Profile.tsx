import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Chip,
  Divider,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  SelectChangeEvent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Save,
  Person,
  Email,
  CalendarToday,
  Favorite,
  Bookmark,
  Forum,
  Star,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { userAPI } from '../services/api';
import { UserProfileDto } from '../types';

// Available avatars - you can add more or use actual image URLs
const availableAvatars = [
  { id: '1', name: 'Default', url: 'https://via.placeholder.com/100x100?text=👤', emoji: '👤' },
  { id: '2', name: 'Cat', url: 'https://via.placeholder.com/100x100?text=🐱', emoji: '🐱' },
  { id: '3', name: 'Dog', url: 'https://via.placeholder.com/100x100?text=🐶', emoji: '🐶' },
  { id: '4', name: 'Robot', url: 'https://via.placeholder.com/100x100?text=🤖', emoji: '🤖' },
  { id: '5', name: 'Alien', url: 'https://via.placeholder.com/100x100?text=👽', emoji: '👽' },
  { id: '6', name: 'Ninja', url: 'https://via.placeholder.com/100x100?text=🥷', emoji: '🥷' },
  { id: '7', name: 'Wizard', url: 'https://via.placeholder.com/100x100?text=🧙‍♂️', emoji: '🧙‍♂️' },
  { id: '8', name: 'Astronaut', url: 'https://via.placeholder.com/100x100?text=👨‍🚀', emoji: '👨‍🚀' },
  { id: '9', name: 'Pirate', url: 'https://via.placeholder.com/100x100?text=🏴‍☠️', emoji: '🏴‍☠️' },
  { id: '10', name: 'Knight', url: 'https://via.placeholder.com/100x100?text=⚔️', emoji: '⚔️' },
  { id: '11', name: 'Dragon', url: 'https://via.placeholder.com/100x100?text=🐉', emoji: '🐉' },
  { id: '12', name: 'Unicorn', url: 'https://via.placeholder.com/100x100?text=🦄', emoji: '🦄' },
];

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('1');
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile data
  const { data: profileResponse, isLoading, error, refetch } = useQuery(
    ['userProfile', user?.id],
    () => userAPI.getProfile(user?.id || 0),
    {
      enabled: !!user?.id,
    }
  );

  const profile: UserProfileDto = useMemo(() => {
    return profileResponse?.data || {
      id: user?.id || 0,
      username: user?.username || 'User',
      email: user?.email || 'user@example.com',
      bio: 'Movie and anime enthusiast. Always looking for the next great story to watch!',
      avatar: '1',
      preferences: '{"notifications":true}',
      profileInfo: '',
    };
  }, [profileResponse?.data, user?.id, user?.username, user?.email]);

  const [editForm, setEditForm] = useState({
    username: profile.username,
    bio: profile.bio || '',
    notifications: true,
  });

  // Update edit form when profile data loads
  useEffect(() => {
    if (profile) {
      let savedNotifications = true;
      
      // Parse preferences from profile
      if (profile.preferences) {
        try {
          const preferences = JSON.parse(profile.preferences);
          savedNotifications = preferences.notifications !== false;
        } catch (error) {
          console.error('Error parsing preferences:', error);
        }
      }
      
      setEditForm({
        username: profile.username,
        bio: profile.bio || '',
        notifications: savedNotifications,
      });
      setSelectedAvatar(profile.avatar || '1');
    }
  }, [profile]);

  const handleEditToggle = async () => {
    if (isEditing) {
      // Save changes
      setIsSaving(true);
      setSaveError('');
      
      try {
        await updateUserProfile({
          username: editForm.username,
          bio: editForm.bio,
          avatar: selectedAvatar,
          preferences: JSON.stringify({
            notifications: editForm.notifications,
          }),
        });
        
        // Refetch profile data to get the latest
        await refetch();
        setIsEditing(false);
      } catch (error) {
        console.error('Save error:', error);
        setSaveError('Failed to save changes. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Reset form to current values
      let savedNotifications = true;
      
      if (profile.preferences) {
        try {
          const preferences = JSON.parse(profile.preferences);
          savedNotifications = preferences.notifications !== false;
        } catch (error) {
          console.error('Error parsing preferences:', error);
        }
      }
      
      setEditForm({
        username: profile.username,
        bio: profile.bio || '',
        notifications: savedNotifications,
      });
      setSelectedAvatar(profile.avatar || '1');
      setSaveError('');
    }
    setIsEditing(!isEditing);
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
  };

  const handleAvatarSave = () => {
    setAvatarDialogOpen(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCurrentAvatar = () => {
    // When editing, show the selected avatar, otherwise show the profile avatar
    const avatarId = isEditing ? selectedAvatar : (profile.avatar || '1');
    return availableAvatars.find(avatar => avatar.id === avatarId) || availableAvatars[0];
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatWatchTime = (hours: number) => {
    if (hours < 24) {
      return `${hours} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days} days, ${remainingHours} hours`;
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Please log in to view your profile.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Error loading profile. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your account settings and preferences
      </Typography>

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3rem',
                  cursor: isEditing ? 'pointer' : 'default',
                  border: '3px solid',
                  borderColor: 'primary.main',
                  opacity: isEditing ? 1 : 0.8,
                }}
                onClick={() => {
                  if (isEditing) {
                    setAvatarDialogOpen(true);
                  }
                }}
              >
                {getCurrentAvatar().emoji}
              </Avatar>
              {isEditing && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
                size="small"
                onClick={() => setAvatarDialogOpen(true)}
              >
                <Edit fontSize="small" />
              </IconButton>
              )}
            </Box>

            <Typography variant="h5" gutterBottom>
              {profile.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {profile.bio || 'No bio yet. Add one to tell others about yourself!'}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Chip
                icon={<CalendarToday />}
                label={`Member since ${formatJoinDate(new Date().toISOString())}`}
                variant="outlined"
                size="small"
              />
            </Box>

            <Button
              variant={isEditing ? 'contained' : 'outlined'}
              startIcon={isEditing ? (isSaving ? <CircularProgress size={16} /> : <Save />) : <Edit />}
              onClick={handleEditToggle}
              fullWidth
              disabled={isSaving}
            >
              {isEditing ? (isSaving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}
            </Button>
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={isEditing ? editForm.username : profile.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profile.email}
                  disabled
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={isEditing ? editForm.bio : (profile.bio || '')}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Tell others about yourself..."
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" sx={{ mr: 2 }}>
                    Email Notifications
                  </Typography>
                  <Button
                    variant={editForm.notifications ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleInputChange('notifications', !editForm.notifications)}
                    disabled={!isEditing}
                  >
                    {editForm.notifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Statistics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Activity
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Bookmark sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    25
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Watchlist Items
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Star sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" color="warning.main">
                    8
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reviews Written
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Forum sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h4" color="secondary.main">
                    3
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Channels Joined
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Favorite sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h4" color="error.main">
                    {formatWatchTime(156)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Watch Time
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Avatar Selection Dialog */}
      <Dialog
        open={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Choose Your Avatar
          <IconButton
            aria-label="close"
            onClick={() => setAvatarDialogOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {availableAvatars.map((avatar) => (
              <Grid item xs={6} sm={4} md={3} key={avatar.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedAvatar === avatar.id ? '2px solid' : '1px solid',
                    borderColor: selectedAvatar === avatar.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleAvatarSelect(avatar.id)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {avatar.emoji}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {avatar.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAvatarSave} variant="contained">
            Select Avatar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 
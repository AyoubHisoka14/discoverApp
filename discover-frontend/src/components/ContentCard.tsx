import React, {useState} from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent, DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Rating,
  Select,

  Typography,
  Fade,
  Tooltip,
} from '@mui/material';
import {Animation, Bookmark, BookmarkAdd, CheckCircle, Delete, Edit, Movie, PlayArrow, Tv,} from '@mui/icons-material';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {useNavigate} from 'react-router-dom';
import {watchlistAPI} from '../services/api';
import {ContentItem, PageType, WatchlistItem, WatchListItemStatus} from '../types';
import {useAuth} from '../contexts/AuthContext';
import {useToast} from './ToastNotification';

interface ContentCardProps {
  item: (ContentItem & { seasons?: number; episodes?: number }) | WatchlistItem;
  showActions?: boolean;
  onWatch?: (id: string) => void;
  onAddToWatchlist?: (id: string) => void;
  onEdit?: (item: WatchlistItem) => void;
  onRemove?: (id: number) => void;
  isWatchListItem?: boolean;
  page?: PageType;
}

function isContentItem(item: any, isWatchListItem: boolean): item is ContentItem {
  return !isWatchListItem;
}

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  showActions = true,
  onWatch,
  onAddToWatchlist,
  onEdit,
  onRemove,
  isWatchListItem = false,
  page,
}) => {
  const [addingId, setAddingId] = useState<number | null>(null);
  const { showSuccess, showError } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<WatchListItemStatus>(WatchListItemStatus.WATCHLIST);
  const [selectedItem, setSelectedItem] = useState<WatchlistItem | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch user's watchlist to check if item is already added
  const { data: userWatchlist = [] } = useQuery(
    ['watchlist'],
    () => watchlistAPI.getUserWatchlist().then(res => res.data),
    {
      enabled: !!user && page != PageType.WATCHLIST,
    }
  );

  // Check if the current item is already in the user's watchlist
  const isInWatchlist = isContentItem(item, page == PageType.WATCHLIST) && userWatchlist.some((watchlistItem: WatchlistItem) =>
    watchlistItem.contentId === item.id
  );

  const addToWatchlistMutation = useMutation(
    (contentId: number) => {
      setAddingId(contentId);
      console.log('Adding to watchlist:', { movieId: contentId, status: WatchListItemStatus.WATCHLIST });
      return watchlistAPI.addToWatchlist({ movieId: contentId, status: WatchListItemStatus.WATCHLIST });
    },
    {
      onSuccess: (response) => {
        console.log('Successfully added to watchlist:', response);
        showSuccess('Added to watchlist!');
        setAddingId(null);
        // Invalidate watchlist query to refresh the data
        queryClient.invalidateQueries(['watchlist']);
      },
      onError: (error: any) => {
        console.error('Failed to add to watchlist:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to add to watchlist.';
        showError(errorMessage);
        setAddingId(null);
      },
    }
  );

  // Update watchlist item status
  const updateStatusMutation = useMutation(
    (data: { id: number; status: string }) => watchlistAPI.updateWatchlistItem({ id: data.id, status: data.status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['watchlist']);
        setEditDialogOpen(false);
        setSelectedItem(null);
        showSuccess('Status updated successfully!');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update status.';
        showError(errorMessage);
      },
    }
  );

  // Remove from watchlist
  const removeMutation = useMutation(
    (id: number) => watchlistAPI.removeFromWatchlist(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['watchlist']);
        showSuccess('Removed from watchlist!');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item.';
        showError(errorMessage);
      },
    }
  );

  const handleAddToWatchlist = (contentId: number) => {
    console.log('handleAddToWatchlist called with contentId:', contentId);
    console.log('Current user:', user);

    if (!user) {
      console.log('No user found, showing error');
      showError('You must be logged in.');
      return;
    }

    console.log('User authenticated, proceeding with add to watchlist');
    addToWatchlistMutation.mutate(contentId);
  };

  const handleToggleWatchlist = (contentId: number) => {
    if (!user) {
      showError('You must be logged in.');
      return;
    }

    if (isInWatchlist) {
      // Find the watchlist item to remove
      const watchlistItem = userWatchlist.find((item: WatchlistItem) => item.contentId === contentId);
      if (watchlistItem) {
        removeMutation.mutate(watchlistItem.id);
      }
    } else {
      handleAddToWatchlist(contentId);
    }
  };

  const handleEditItem = (item: WatchlistItem) => {
    setSelectedItem(item);
    setNewStatus(item.status as WatchListItemStatus);
    setEditDialogOpen(true);
  };

  const handleRemoveItem = (item: WatchlistItem) => {
    setSelectedItem(item);
    setDeleteDialog(true);
  };

  const handleSaveStatus = () => {
    if (selectedItem) {
      updateStatusMutation.mutate({
        id: selectedItem.id,
        status: newStatus,
      });
    }
  };

  const handleConfirmRemove = () => {
    if (selectedItem !== null) {
      removeMutation.mutate(selectedItem.id);
    }
    setDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleCancelRemove = () => {
    setDeleteDialog(false);
    setSelectedItem(null);
  };


  // Removed snackbar close handler as we're using toast notifications now

  const handleCardClick = (event: React.MouseEvent) => {
    // Prevent navigation if clicking on buttons or interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('a')) {
      return;
    }

    // Navigate to content details page
    if (isContentItem(item, page == PageType.WATCHLIST)) {
      if (page === PageType.AI) {
        navigate(`/content/${item.externalId || item.id}/${item.type.toLowerCase()}`, {
          state: { from: '/ai' }
        });
      } else {
        navigate(`/content/${item.externalId || item.id}/${item.type.toLowerCase()}`, {
          state: { from: window.location.pathname }
        });
      }
    } else {
      navigate(`/content/${item.content?.externalId || item.content?.id}/${item.content?.type.toLowerCase()}`, {
        state: { from: '/watchlist' }
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'movie':
        return <Movie />;
      case 'series':
        return <Tv />;
      case 'anime':
        return <Animation />;
      default:
        return <Movie />;
    }
  };

  const getTypeColor = (type: string): "primary" | "secondary" | "default" => {
    switch (type) {
      case 'movie':
        return 'primary';
      case 'series':
        return 'secondary';
      case 'anime':
        return 'default';
      default:
        return 'primary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case WatchListItemStatus.WATCHED:
        return 'success';
      case WatchListItemStatus.IN_PROGRESS:
        return 'warning';
      case WatchListItemStatus.WATCHLIST:
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case WatchListItemStatus.WATCHED:
        return <CheckCircle />;
      case WatchListItemStatus.IN_PROGRESS:
        return <PlayArrow />;
      default:
        return <Bookmark />;
    }
  };

  const handleWatch = () => {
    if (onWatch) {
      onWatch(item.id.toString());
    }
  };

  const handleAddToWatchlistLegacy = () => {
    if (onAddToWatchlist) {
      onAddToWatchlist(item.id.toString());
    }
  };

  // Render for ContentItem
  if (isContentItem(item, page == PageType.WATCHLIST)) {
    return (
      <>
        <Card
          sx={{
            pt: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease-in-out',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: (theme) => theme.shadows[8],
              '& .quick-actions': {
                opacity: 1,
              },
              '& .card-overlay': {
                opacity: 1,
              },
            },
          }}
          onClick={handleCardClick}
        >
          {/* Quick Actions Overlay */}
          <Box
            className="quick-actions"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
              zIndex: 2,
              display: 'flex',
              gap: 1,
            }}
          >
            {/* Only show hover button if item is NOT in watchlist */}
            {!isInWatchlist && (
              <Tooltip title="Add to Watchlist">
                <IconButton
                  size="small"
                  color="primary"
                  sx={{
                    backgroundColor: 'rgba(25, 118, 210, 0.9)', // Blue background for add
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 1)'
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(128, 128, 128, 0.7)',
                      color: 'rgba(255, 255, 255, 0.7)',
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWatchlist(item.id);
                  }}
                  disabled={addingId === item.id}
                >
                  <BookmarkAdd fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Card Overlay */}
          <Box
            className="card-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
              opacity: 0,
              transition: 'opacity 0.3s ease-in-out',
              zIndex: 1,
            }}
          />

          <CardMedia
            component="img"
            height="300"
            image={item.posterUrl || 'https://via.placeholder.com/300x450?text=No+Image'}
            alt={item.title}
            loading="lazy"
            sx={{
              objectFit: 'contain',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
          <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              {item.title}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                paragraph
                sx={{
                  flexGrow: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: '1.5em', // force consistent line height
                  maxHeight: '7.5em',   // 1.5em * 5 lines
                }}
            >
              {item.description}
            </Typography>

            <Box sx={{ mt: 'auto' }}>
            {item.release_date && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 1 }}>
                  <Chip
                      label={new Date(item.release_date).getFullYear()}
                      size="medium"
                      variant="outlined"
                  />
                </Box>
            )}

            {item.ratings && item.ratings > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={item.ratings / 2} precision={0.1} readOnly size="small" />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {item.ratings.toFixed(1)}
                </Typography>
              </Box>
            )}

            {item.genreNames && item.genreNames.length > 0 &&(
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1}}>
                  {item.genreNames.slice(0, 2).map((genre, index) => (
                      <Chip
                          key={index}
                          label={genre}
                          size="small"
                          color='primary'
                          variant="outlined"
                      />
                  ))}
                </Box>
            )}

            {/* Watchlist Indicator - Clickable when item is in watchlist */}
            {isInWatchlist && (
              <Tooltip title="Remove from Watchlist">
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    backgroundColor: 'success.main',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    color: 'white',
                    boxShadow: 2,
                    '&:hover': {
                      backgroundColor: 'error.main', // Red on hover
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWatchlist(item.id);
                  }}
                >
                  <Bookmark sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            </Box>
          </CardContent>
        </Card>

      </>
    );
  }

  // Render for WatchlistItemDto
  return (
    <>
      <Card
          sx={{
            pt: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease-in-out',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: (theme) => theme.shadows[8],
              '& .quick-actions': {
                opacity: 1,
              },
              '& .card-overlay': {
                opacity: 1,
              },
            },
          }}
          onClick={handleCardClick}
      >
        {/* Quick Actions Overlay */}
        <Box
          className="quick-actions"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 2,
            display: 'flex',
            gap: 1,
          }}
        >
          <Tooltip title="Edit Status">
            <IconButton
              size="small"
              color="primary"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleEditItem(item);
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove from Watchlist">
            <IconButton
              size="small"
              color="error"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
              }}
              onClick={(e) => {
                e.stopPropagation();
                removeMutation.mutate(item.id);
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Watchlist Indicator - Always shown for watchlist items */}
        <Tooltip title="Remove from Watchlist">
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              backgroundColor: 'success.main',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: 'white',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'error.main', // Red on hover
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            onClick={(e) => {
              e.stopPropagation();
              removeMutation.mutate(item.id);
            }}
          >
            <Bookmark sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Card Overlay */}
        <Box
          className="card-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1,
          }}
        />

        <CardMedia
          component="img"
          height="300"
          image={item.content?.posterUrl || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={item.content?.title || `Content ${item.contentId}`}
          loading="lazy"
          sx={{
            objectFit: 'contain',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
          onClick={handleCardClick}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            {item.content?.title}
          </Typography>
          <Typography
              variant="body2"
              color="text.secondary"
              paragraph
              sx={{
                flexGrow: 1,
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '1.5em', // force consistent line height
                maxHeight: '7.5em',   // 1.5em * 5 lines
              }}
          >
            {item.content?.description}
          </Typography>

          <Box sx={{ mt: 'auto' }}>
            {item.content?.release_date && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 1 }}>
                  <Chip
                      label={new Date(item.content?.release_date).getFullYear()}
                      size="medium"
                      variant="outlined"
                  />
                </Box>
            )}

            {item.content?.ratings && item.content?.ratings > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={item.content?.ratings / 2} precision={0.1} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {item.content?.ratings.toFixed(1)}
                  </Typography>
                </Box>
            )}

            {item.content?.genreNames && item.content?.genreNames.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, mb: 2 }}>
                  {item.content?.genreNames.slice(0, 2).map((genre, index) => (
                      <Chip
                          key={index}
                          label={genre}
                          size="small"
                          color='primary'
                          variant="outlined"
                      />
                  ))}
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                icon={getStatusIcon(item.status)}
                label={item.status}
                color={getStatusColor(item.status) as any}
                size="small"
                variant="filled"
                sx={{
                  '& .MuiChip-label': {
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  },
                  '& .MuiChip-icon': {
                    color: 'white',
                  },
                  '&.MuiChip-colorSuccess': {
                    backgroundColor: 'success.main',
                    '& .MuiChip-label, & .MuiChip-icon': {
                      color: 'white',
                    },
                  },
                  '&.MuiChip-colorWarning': {
                    backgroundColor: 'warning.main',
                    '& .MuiChip-label, & .MuiChip-icon': {
                      color: 'white',
                    },
                  },
                  '&.MuiChip-colorPrimary': {
                    backgroundColor: 'primary.main',
                    '& .MuiChip-label, & .MuiChip-icon': {
                      color: 'white',
                    },
                  },
                  '&.MuiChip-colorDefault': {
                    backgroundColor: 'grey.600',
                    '& .MuiChip-label, & .MuiChip-icon': {
                      color: 'white',
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Update Watchlist Status</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {selectedItem?.content?.title || `Content ID: ${selectedItem?.contentId}`}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value as WatchListItemStatus)}
              >
                <MenuItem value={WatchListItemStatus.WATCHLIST}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Bookmark />
                    Watchlist
                  </Box>
                </MenuItem>
                <MenuItem value={WatchListItemStatus.IN_PROGRESS}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlayArrow />
                    In Progress
                  </Box>
                </MenuItem>
                <MenuItem value={WatchListItemStatus.WATCHED}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle />
                    Watched
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveStatus}
            variant="contained"
            disabled={updateStatusMutation.isLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={handleCancelRemove}>
        <DialogTitle>Remove Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this item from your watchlist?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelRemove}>Cancel</Button>
          <Button onClick={handleConfirmRemove} color="error">Remove</Button>
        </DialogActions>
      </Dialog>


    </>
  );
};

export default ContentCard;

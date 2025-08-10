import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

interface CreateChannelDialogProps {
  open: boolean;
  onClose: () => void;
  channelName: string;
  channelDescription: string;
  onChannelNameChange: (name: string) => void;
  onChannelDescriptionChange: (description: string) => void;
  onCreateChannel: () => void;
}

const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({
  open,
  onClose,
  channelName,
  channelDescription,
  onChannelNameChange,
  onChannelDescriptionChange,
  onCreateChannel,
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChannelNameChange(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChannelDescriptionChange(e.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create New Channel</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Channel Name"
          fullWidth
          variant="outlined"
          value={channelName}
          onChange={handleNameChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={channelDescription}
          onChange={handleDescriptionChange}
          placeholder="Describe what this channel is about..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={onCreateChannel}
          variant="contained"
          disabled={!channelName.trim() || !channelDescription.trim()}
        >
          Create Channel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateChannelDialog; 
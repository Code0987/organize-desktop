import React from 'react';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Autocomplete,
  IconButton,
} from '@mui/material';
import { FolderOpen as BrowseIcon } from '@mui/icons-material';
import { Action } from '../types';
import { getActionDefinition } from '../utils/definitions';

interface ActionEditorProps {
  action: Action;
  onUpdate: (action: Action) => void;
}

const ActionEditor: React.FC<ActionEditorProps> = ({ action, onUpdate }) => {
  const definition = getActionDefinition(action.type);

  const handleConfigChange = (key: string, value: any) => {
    onUpdate({
      ...action,
      config: { ...action.config, [key]: value },
    });
  };

  if (!definition) {
    return (
      <Typography color="error">
        Unknown action type: {action.type}
      </Typography>
    );
  }

  const handleBrowseFolder = async (propName: string) => {
    try {
      const result = await window.electronAPI.openFolderDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        handleConfigChange(propName, result.filePaths[0] + '/');
      }
    } catch (error) {
      console.error('Failed to browse folder:', error);
    }
  };

  return (
    <Box sx={{ pt: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {definition.description}
      </Typography>

      {definition.properties.map((prop) => (
        <Box key={prop.name} sx={{ mb: 2 }}>
          {prop.type === 'string' && (
            <TextField
              fullWidth
              label={prop.label}
              value={action.config[prop.name] || ''}
              onChange={(e) => handleConfigChange(prop.name, e.target.value)}
              placeholder={prop.placeholder}
              helperText={prop.description}
              required={prop.required}
              multiline={prop.name === 'msg' || prop.name === 'text'}
              rows={prop.name === 'msg' || prop.name === 'text' ? 2 : 1}
              InputProps={{
                endAdornment: ['dest', 'outfile'].includes(prop.name) ? (
                  <IconButton
                    size="small"
                    onClick={() => handleBrowseFolder(prop.name)}
                  >
                    <BrowseIcon fontSize="small" />
                  </IconButton>
                ) : undefined,
              }}
            />
          )}

          {prop.type === 'number' && (
            <TextField
              fullWidth
              type="number"
              label={prop.label}
              value={action.config[prop.name] || ''}
              onChange={(e) =>
                handleConfigChange(
                  prop.name,
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder={prop.placeholder}
              helperText={prop.description}
              required={prop.required}
            />
          )}

          {prop.type === 'boolean' && (
            <FormControlLabel
              control={
                <Switch
                  checked={action.config[prop.name] ?? prop.default ?? false}
                  onChange={(e) => handleConfigChange(prop.name, e.target.checked)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">{prop.label}</Typography>
                  {prop.description && (
                    <Typography variant="caption" color="text.secondary">
                      {prop.description}
                    </Typography>
                  )}
                </Box>
              }
            />
          )}

          {prop.type === 'select' && (
            <FormControl fullWidth>
              <InputLabel>{prop.label}</InputLabel>
              <Select
                value={action.config[prop.name] || prop.default || ''}
                label={prop.label}
                onChange={(e) => handleConfigChange(prop.name, e.target.value)}
              >
                {prop.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {prop.description && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {prop.description}
                </Typography>
              )}
            </FormControl>
          )}

          {prop.type === 'string[]' && (
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={action.config[prop.name] || []}
              onChange={(_, newValue) => handleConfigChange(prop.name, newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip label={option} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={prop.label}
                  placeholder={prop.placeholder}
                  helperText={prop.description}
                  required={prop.required}
                />
              )}
            />
          )}

          {prop.type === 'code' && (
            <TextField
              fullWidth
              multiline
              rows={8}
              label={prop.label}
              value={action.config[prop.name] || ''}
              onChange={(e) => handleConfigChange(prop.name, e.target.value)}
              placeholder={prop.placeholder}
              helperText={prop.description}
              required={prop.required}
              InputProps={{
                sx: {
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          )}
        </Box>
      ))}

      {definition.properties.length === 0 && (
        <Typography color="text.secondary">
          This action has no configurable options.
        </Typography>
      )}

      {/* Template placeholders help */}
      {['move', 'copy', 'rename', 'echo', 'write'].includes(action.type) && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Available Placeholders
          </Typography>
          <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
            {'{path}'} - Full file path<br />
            {'{relative_path}'} - Relative path<br />
            {'{name}'} - Filename without extension<br />
            {'{extension}'} - File extension<br />
            {'{now()}'} - Current datetime<br />
            {'{today()}'} - Current date<br />
            {'{env.VAR}'} - Environment variable
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ActionEditor;

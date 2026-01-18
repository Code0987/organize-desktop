import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Grid,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Slider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    organizeStatus,
    checkOrganizeStatus,
    platform,
  } = useApp();

  const [testingConnection, setTestingConnection] = useState(false);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  React.useEffect(() => {
    const loadRecentFiles = async () => {
      const files = await window.electronAPI.getRecentFiles();
      setRecentFiles(files);
    };
    loadRecentFiles();
  }, []);

  const handlePythonPathChange = async (path: string) => {
    await updateSettings('pythonPath', path);
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    await checkOrganizeStatus();
    setTestingConnection(false);
  };

  const handleBrowsePythonPath = async () => {
    try {
      const result = await window.electronAPI.openFileDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Python', extensions: ['exe', ''] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      if (!result.canceled && result.filePaths.length > 0) {
        await handlePythonPathChange(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Failed to browse:', error);
    }
  };

  const handleClearRecentFiles = async () => {
    await window.electronAPI.clearRecentFiles();
    setRecentFiles([]);
  };

  const handleOpenDocs = async () => {
    await window.electronAPI.openExternal('https://organize.readthedocs.io/');
  };

  if (!settings) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading settings...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure your Organize Desktop preferences
      </Typography>

      <Grid container spacing={3}>
        {/* Python / Organize Configuration */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Python Configuration
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Python Path"
                value={settings.pythonPath}
                onChange={(e) => handlePythonPathChange(e.target.value)}
                placeholder="python3"
                helperText="Path to Python executable (e.g., python3, python, /usr/bin/python3)"
                InputProps={{
                  endAdornment: (
                    <IconButton size="small" onClick={handleBrowsePythonPath}>
                      <FolderIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testingConnection}
                startIcon={<RefreshIcon />}
              >
                Test Connection
              </Button>
              
              {organizeStatus && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    icon={organizeStatus.installed ? <CheckIcon /> : <ErrorIcon />}
                    label={
                      organizeStatus.installed
                        ? `organize ${organizeStatus.version} installed`
                        : organizeStatus.error || 'Not installed'
                    }
                    color={organizeStatus.installed ? 'success' : 'error'}
                  />
                </Box>
              )}
            </Box>

            {!organizeStatus?.installed && (
              <Alert severity="info">
                <Typography variant="body2">
                  To install organize, run:
                  <br />
                  <code>pip install organize-tool</code>
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Appearance
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Theme</InputLabel>
              <Select
                value={settings.theme}
                label="Theme"
                onChange={(e) => updateSettings('theme', e.target.value)}
              >
                <MenuItem value="system">System Default</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" gutterBottom>
                Font Size: {settings.fontSize}px
              </Typography>
              <Slider
                value={settings.fontSize}
                onChange={(_, value) => updateSettings('fontSize', value)}
                min={10}
                max={20}
                step={1}
                marks
                valueLabelDisplay="auto"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Editor Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Editor Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings('autoSave', e.target.checked)}
                />
              }
              label="Auto-save configurations"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.confirmDangerousActions}
                  onChange={(e) => updateSettings('confirmDangerousActions', e.target.checked)}
                />
              }
              label="Confirm dangerous actions (delete, run)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.showSystemFiles}
                  onChange={(e) => updateSettings('showSystemFiles', e.target.checked)}
                />
              }
              label="Show system files in file browser"
            />
          </Paper>
        </Grid>

        {/* Recent Files */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Recent Files
              </Typography>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearRecentFiles}
                disabled={recentFiles.length === 0}
              >
                Clear All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {recentFiles.length === 0 ? (
              <Typography color="text.secondary">No recent files</Typography>
            ) : (
              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {recentFiles.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={file.split('/').pop() || file.split('\\').pop()}
                      secondary={file}
                      secondaryTypographyProps={{
                        sx: { overflow: 'hidden', textOverflow: 'ellipsis' }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="Max Recent Files"
                value={settings.maxRecentFiles}
                onChange={(e) => updateSettings('maxRecentFiles', parseInt(e.target.value) || 10)}
                inputProps={{ min: 1, max: 50 }}
                size="small"
              />
            </Box>
          </Paper>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Platform
                    </Typography>
                    <Typography variant="h6">
                      {platform?.platform === 'darwin' ? 'macOS' :
                       platform?.platform === 'win32' ? 'Windows' :
                       platform?.platform === 'linux' ? 'Linux' :
                       platform?.platform || 'Unknown'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Architecture
                    </Typography>
                    <Typography variant="h6">
                      {platform?.arch || 'Unknown'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Node.js Version
                    </Typography>
                    <Typography variant="h6">
                      {platform?.version || 'Unknown'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Documentation Links */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resources
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<OpenIcon />}
                onClick={handleOpenDocs}
              >
                Organize Documentation
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenIcon />}
                onClick={() => window.electronAPI.openExternal('https://github.com/tfeldmann/organize')}
              >
                GitHub Repository
              </Button>
              <Button
                variant="outlined"
                startIcon={<OpenIcon />}
                onClick={() => window.electronAPI.openExternal('https://github.com/tfeldmann/organize/issues')}
              >
                Report an Issue
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SettingsPage;

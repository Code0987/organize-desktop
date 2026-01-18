import React, { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  FolderOpen as FolderIcon,
  Rule as RuleIcon,
  Code as CodeIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  PlayArrow as PlayIcon,
  PlayCircleOutline as SimulateIcon,
  Save as SaveIcon,
  SaveAs as SaveAsIcon,
  Create as NewIcon,
  FolderOpen as OpenIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import { configToYaml } from '../utils/yaml';

const drawerWidth = 260;

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentFilePath,
    isModified,
    organizeStatus,
    newConfig,
    openConfig,
    saveConfig,
    saveConfigAs,
    loadConfig,
    isRunning,
    setIsRunning,
    clearOutput,
    addOutput,
    config,
    yamlContent,
    viewMode,
  } = useApp();

  const [recentMenuAnchor, setRecentMenuAnchor] = useState<null | HTMLElement>(null);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);

  const handleRecentClick = async (event: React.MouseEvent<HTMLElement>) => {
    const files = await window.electronAPI.getRecentFiles();
    setRecentFiles(files);
    setRecentMenuAnchor(event.currentTarget);
  };

  const handleRecentClose = () => {
    setRecentMenuAnchor(null);
  };

  const handleRecentFileClick = async (filePath: string) => {
    await loadConfig(filePath);
    handleRecentClose();
  };

  const handleClearRecent = async () => {
    await window.electronAPI.clearRecentFiles();
    setRecentFiles([]);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: <FolderIcon /> },
    { path: '/rules', label: 'Visual Editor', icon: <RuleIcon /> },
    { path: '/yaml', label: 'YAML Editor', icon: <CodeIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    { path: '/help', label: 'Help & Docs', icon: <HelpIcon /> },
  ];

  const runOrganize = async (simulate: boolean) => {
    setIsRunning(true);
    clearOutput();
    
    const command = simulate ? 'sim' : 'run';
    addOutput(`======================================\n`);
    addOutput(`  Organize ${simulate ? 'Simulation' : 'Run'}\n`);
    addOutput(`======================================\n\n`);
    
    try {
      // Get the config content
      let configContent: string;
      
      if (viewMode === 'visual') {
        addOutput(`[INFO] Converting visual config to YAML...\n`);
        try {
          configContent = configToYaml(config);
          addOutput(`[INFO] Config converted successfully.\n\n`);
        } catch (yamlError: any) {
          addOutput(`[ERROR] Failed to convert config to YAML: ${yamlError.message}\n`);
          setIsRunning(false);
          return;
        }
      } else {
        configContent = yamlContent;
        addOutput(`[INFO] Using YAML editor content.\n\n`);
      }
      
      addOutput(`[INFO] Executing: organize ${command} --stdin\n\n`);
      
      const result = await window.electronAPI.runOrganizeStdin(command, configContent, {
        format: 'default'
      });
      
      addOutput(`\n======================================\n`);
      if (result.code === 0) {
        addOutput(`  ✓ Completed successfully\n`);
      } else if (result.code === -1) {
        addOutput(`  ✗ Failed to start process\n`);
        addOutput(`  Check Settings to verify Python path\n`);
      } else {
        addOutput(`  ✗ Process exited with code ${result.code}\n`);
      }
      addOutput(`======================================\n`);
      
    } catch (error: any) {
      addOutput(`\n[ERROR] ${error.message}\n`);
      addOutput(`[ERROR] Stack: ${error.stack}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const fileName = currentFilePath 
    ? currentFilePath.split('/').pop() || currentFilePath.split('\\').pop() 
    : 'Untitled';

  return (
    <Box sx={{ display: 'flex', width: '100%' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mr: 2,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/')}
          >
            <FolderIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
              Organize
            </Typography>
          </Box>

          {/* File actions */}
          <Tooltip title="New Config (Ctrl+N)">
            <IconButton size="small" onClick={newConfig}>
              <NewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open Config (Ctrl+O)">
            <IconButton size="small" onClick={openConfig}>
              <OpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Recent Files">
            <IconButton size="small" onClick={handleRecentClick}>
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save (Ctrl+S)">
            <IconButton size="small" onClick={saveConfig} disabled={!isModified}>
              <SaveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Save As (Ctrl+Shift+S)">
            <IconButton size="small" onClick={saveConfigAs}>
              <SaveAsIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Current file */}
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {fileName}
            {isModified && ' •'}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Organize status */}
          {organizeStatus && (
            <Tooltip title={organizeStatus.installed ? '' : (organizeStatus.error || 'Not installed')}>
              <Chip
                size="small"
                icon={organizeStatus.installed ? <CheckCircleIcon /> : <ErrorIcon />}
                label={organizeStatus.installed ? organizeStatus.version : 'Not installed'}
                color={organizeStatus.installed ? 'success' : 'error'}
                variant="outlined"
                sx={{ mr: 1 }}
              />
            </Tooltip>
          )}

          {/* Run buttons */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<SimulateIcon />}
            onClick={() => runOrganize(true)}
            disabled={isRunning}
            sx={{ mr: 1 }}
          >
            {isRunning ? 'Running...' : 'Simulate'}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayIcon />}
            onClick={() => runOrganize(false)}
            disabled={isRunning}
            color="primary"
          >
            {isRunning ? 'Running...' : 'Run'}
          </Button>
        </Toolbar>
      </AppBar>

      {/* Recent files menu */}
      <Menu
        anchorEl={recentMenuAnchor}
        open={Boolean(recentMenuAnchor)}
        onClose={handleRecentClose}
        PaperProps={{ sx: { minWidth: 300, maxWidth: 400 } }}
      >
        {recentFiles.length === 0 ? (
          <MenuItem disabled>No recent files</MenuItem>
        ) : (
          <>
            {recentFiles.map((file, index) => (
              <MenuItem
                key={index}
                onClick={() => handleRecentFileClick(file)}
                sx={{
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {file.split('/').pop() || file.split('\\').pop()}
                <Typography
                  variant="caption"
                  sx={{ ml: 1, color: 'text.secondary' }}
                >
                  {file}
                </Typography>
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={handleClearRecent}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              Clear Recent Files
            </MenuItem>
          </>
        )}
      </Menu>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
            bgcolor: 'background.default',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 2 }}>
          <List sx={{ px: 1 }}>
            {navItems.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'inherit',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

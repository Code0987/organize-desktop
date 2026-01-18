import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Paper,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  FolderOpen as OpenIcon,
  Rule as RuleIcon,
  Code as CodeIcon,
  PlayArrow as PlayIcon,
  Help as HelpIcon,
  History as HistoryIcon,
  Description as FileIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    config,
    newConfig,
    openConfig,
    loadConfig,
    organizeStatus,
    output,
    isRunning,
  } = useApp();

  const [recentFiles, setRecentFiles] = React.useState<string[]>([]);

  React.useEffect(() => {
    const loadRecentFiles = async () => {
      const files = await window.electronAPI.getRecentFiles();
      setRecentFiles(files);
    };
    loadRecentFiles();
  }, []);

  const quickActions = [
    {
      title: 'New Config',
      description: 'Start with a fresh configuration',
      icon: <AddIcon sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      onClick: () => {
        newConfig();
        navigate('/rules');
      },
    },
    {
      title: 'Open Config',
      description: 'Load an existing configuration file',
      icon: <OpenIcon sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      onClick: openConfig,
    },
    {
      title: 'Visual Editor',
      description: 'Build rules with the visual editor',
      icon: <RuleIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      onClick: () => navigate('/rules'),
    },
    {
      title: 'YAML Editor',
      description: 'Edit configuration as YAML directly',
      icon: <CodeIcon sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      onClick: () => navigate('/yaml'),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome to Organize Desktop
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Automate your file management with powerful rules
        </Typography>
      </Box>

      {/* Status alert */}
      {!organizeStatus?.installed && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
          }
        >
          <Typography variant="body2">
            <strong>organize</strong> CLI tool is not detected. Please install it with{' '}
            <code>pip install organize-tool</code> or configure the Python path in settings.
          </Typography>
        </Alert>
      )}

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                onClick={action.onClick}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: `${action.color}20`,
                      color: action.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {action.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Current Config */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <RuleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Current Configuration</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {config.rules.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" gutterBottom>
                  No rules configured yet
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/rules')}
                  sx={{ mt: 2 }}
                >
                  Create First Rule
                </Button>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`${config.rules.length} rule${config.rules.length === 1 ? '' : 's'}`}
                    size="small"
                    color="primary"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${config.rules.filter(r => r.enabled !== false).length} enabled`}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <List dense>
                  {config.rules.slice(0, 5).map((rule, index) => (
                    <ListItem
                      key={rule.id}
                      sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        mb: 0.5,
                        opacity: rule.enabled === false ? 0.5 : 1,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Typography variant="body2" color="text.secondary">
                          {index + 1}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={rule.name || `Rule ${index + 1}`}
                        secondary={`${rule.filters?.length || 0} filters, ${rule.actions?.length || 0} actions`}
                      />
                    </ListItem>
                  ))}
                  {config.rules.length > 5 && (
                    <ListItem>
                      <ListItemText
                        primary={`+${config.rules.length - 5} more rules`}
                        primaryTypographyProps={{ color: 'text.secondary' }}
                      />
                    </ListItem>
                  )}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/rules')}
                  sx={{ mt: 2 }}
                >
                  Edit Rules
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Recent Files & Output */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Recent Files</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {recentFiles.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No recent files
              </Typography>
            ) : (
              <List dense>
                {recentFiles.slice(0, 5).map((file, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => loadConfig(file)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FileIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.split('/').pop() || file.split('\\').pop()}
                      secondary={file}
                      secondaryTypographyProps={{
                        sx: {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Output Preview */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PlayIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Last Output</Typography>
              {isRunning && (
                <Chip
                  label="Running..."
                  size="small"
                  color="primary"
                  sx={{ ml: 2 }}
                />
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {output.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No output yet. Run or simulate your rules to see output here.
              </Typography>
            ) : (
              <Box
                sx={{
                  bgcolor: 'grey.900',
                  color: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.8rem',
                  maxHeight: 200,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {output.slice(-20).join('')}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Getting Started */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <HelpIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Getting Started</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              1. Create Rules
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define rules with locations, filters, and actions. Use the visual editor
              for an easy drag-and-drop experience, or edit YAML directly.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              2. Simulate First
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always simulate your rules before running them. This shows what would
              happen without actually moving or modifying any files.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              3. Run & Automate
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Once satisfied, run your rules to organize your files. Save your config
              and run it anytime, or set up scheduled tasks for automation.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default HomePage;

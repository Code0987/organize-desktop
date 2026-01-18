import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  History as HistoryIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  PlayArrow as RunIcon,
  PlayCircleOutline as SimIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  DeleteSweep as ClearAllIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { RunLog } from '../types';

interface LogHistoryProps {
  open: boolean;
  onClose: () => void;
  onSelectLog: (log: RunLog) => void;
}

const LogHistory: React.FC<LogHistoryProps> = ({ open, onClose, onSelectLog }) => {
  const [logs, setLogs] = useState<RunLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<RunLog | null>(null);
  const [viewLogOpen, setViewLogOpen] = useState(false);

  const loadLogs = async () => {
    const loadedLogs = await window.electronAPI.getRunLogs();
    setLogs(loadedLogs);
  };

  useEffect(() => {
    if (open) {
      loadLogs();
    }
  }, [open]);

  const handleDeleteLog = async (logId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await window.electronAPI.deleteRunLog(logId);
    loadLogs();
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all logs?')) {
      await window.electronAPI.clearAllLogs();
      loadLogs();
    }
  };

  const handleViewLog = (log: RunLog) => {
    setSelectedLog(log);
    setViewLogOpen(true);
  };

  const handleLoadLog = (log: RunLog) => {
    onSelectLog(log);
    onClose();
  };

  const handleCopyOutput = async () => {
    if (selectedLog) {
      await navigator.clipboard.writeText(selectedLog.output.join(''));
    }
  };

  const handleDownloadLog = () => {
    if (selectedLog) {
      const content = `# Organize Run Log
# Date: ${new Date(selectedLog.timestamp).toLocaleString()}
# Command: organize ${selectedLog.command}
# Exit Code: ${selectedLog.exitCode}
# Duration: ${(selectedLog.duration / 1000).toFixed(2)}s

## Config:
${selectedLog.configContent}

## Output:
${selectedLog.output.join('')}
`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `organize-log-${selectedLog.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon />
              <Typography variant="h6">Run History</Typography>
              <Chip label={`${logs.length} logs`} size="small" />
            </Box>
            <Box>
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={loadLogs}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear All Logs">
                <IconButton size="small" onClick={handleClearAll} disabled={logs.length === 0}>
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {logs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="text.secondary">
                No run history yet. Run or simulate your rules to see logs here.
              </Typography>
            </Box>
          ) : (
            <List>
              {logs.map((log) => (
                <ListItem
                  key={log.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => handleDeleteLog(log.id, e)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  }
                  sx={{ mb: 1 }}
                >
                  <ListItemButton
                    onClick={() => handleViewLog(log)}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ListItemIcon>
                      {log.success ? (
                        <SuccessIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={log.command === 'sim' ? <SimIcon /> : <RunIcon />}
                            label={log.command === 'sim' ? 'Simulate' : 'Run'}
                            size="small"
                            color={log.command === 'sim' ? 'info' : 'primary'}
                            variant="outlined"
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {log.configName || 'Untitled'}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(log.timestamp)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Duration: {formatDuration(log.duration)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Exit: {log.exitCode}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* View Log Dialog */}
      <Dialog
        open={viewLogOpen}
        onClose={() => setViewLogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedLog?.success ? (
                <SuccessIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
              <Typography variant="h6">
                {selectedLog?.command === 'sim' ? 'Simulation' : 'Run'} Log
              </Typography>
              {selectedLog && (
                <Typography variant="body2" color="text.secondary">
                  {new Date(selectedLog.timestamp).toLocaleString()}
                </Typography>
              )}
            </Box>
            <Box>
              <Tooltip title="Copy Output">
                <IconButton size="small" onClick={handleCopyOutput}>
                  <CopyIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download Log">
                <IconButton size="small" onClick={handleDownloadLog}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedLog && (
            <Box>
              {/* Log Info */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`Command: organize ${selectedLog.command}`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Exit Code: ${selectedLog.exitCode}`}
                  size="small"
                  color={selectedLog.exitCode === 0 ? 'success' : 'error'}
                  variant="outlined"
                />
                <Chip
                  label={`Duration: ${formatDuration(selectedLog.duration)}`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Output */}
              <Typography variant="subtitle2" gutterBottom>
                Output
              </Typography>
              <Box
                sx={{
                  bgcolor: '#1e1e1e',
                  color: '#d4d4d4',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  maxHeight: 400,
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {selectedLog.output.map((line, index) => {
                  let color = '#d4d4d4';
                  if (line.includes('[ERROR]') || line.includes('✗')) color = '#f48771';
                  else if (line.includes('[DEBUG]')) color = '#888';
                  else if (line.includes('[INFO]')) color = '#4fc1ff';
                  else if (line.includes('✓')) color = '#89d185';
                  else if (line.startsWith('===')) color = '#dcdcaa';
                  
                  return <span key={index} style={{ color }}>{line}</span>;
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewLogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedLog) handleLoadLog(selectedLog);
              setViewLogOpen(false);
            }}
          >
            Load Config
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogHistory;

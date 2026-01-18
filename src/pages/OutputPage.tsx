import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Delete as ClearIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  PlayArrow as PlayIcon,
  PlayCircleOutline as SimulateIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const OutputPage: React.FC = () => {
  const { output, clearOutput, isRunning } = useApp();
  const outputRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, autoScroll]);

  const handleCopy = async () => {
    const text = output.join('');
    await navigator.clipboard.writeText(text);
  };

  const handleDownload = () => {
    const text = output.join('');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organize-output-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    clearOutput();
  };

  // Parse output line for coloring
  const getLineStyle = (line: string) => {
    if (line.includes('[ERROR]') || line.includes('✗')) {
      return { color: '#f44336' };
    }
    if (line.includes('[WARNING]') || line.includes('⚠')) {
      return { color: '#ff9800' };
    }
    if (line.includes('[INFO]')) {
      return { color: '#2196f3' };
    }
    if (line.includes('[DEBUG]')) {
      return { color: '#9e9e9e' };
    }
    if (line.includes('✓') || line.includes('Completed successfully')) {
      return { color: '#4caf50' };
    }
    if (line.includes('===')) {
      return { color: '#64b5f6', fontWeight: 'bold' };
    }
    return {};
  };

  // Determine status from output
  const getStatus = () => {
    if (isRunning) return 'running';
    if (output.length === 0) return 'empty';
    
    const fullOutput = output.join('');
    if (fullOutput.includes('Completed successfully') || fullOutput.includes('exit code: 0')) {
      return 'success';
    }
    if (fullOutput.includes('Failed') || fullOutput.includes('[ERROR]') || fullOutput.includes('exit code:')) {
      return 'error';
    }
    return 'idle';
  };

  const status = getStatus();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <TerminalIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Output
          </Typography>
          
          {status === 'running' && (
            <Chip
              label="Running..."
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
          {status === 'success' && (
            <Chip
              icon={<SuccessIcon />}
              label="Success"
              color="success"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
          {status === 'error' && (
            <Chip
              icon={<ErrorIcon />}
              label="Failed"
              color="error"
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          View the output from organize commands. Use Simulate or Run buttons in the toolbar to execute your configuration.
        </Typography>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Tooltip title="Copy to Clipboard">
          <IconButton 
            size="small" 
            onClick={handleCopy}
            disabled={output.length === 0}
          >
            <CopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download as File">
          <IconButton 
            size="small" 
            onClick={handleDownload}
            disabled={output.length === 0}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear Output">
          <IconButton 
            size="small" 
            onClick={handleClear}
            disabled={output.length === 0 || isRunning}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Tooltip title={autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}>
          <Button
            size="small"
            variant={autoScroll ? "contained" : "outlined"}
            onClick={() => setAutoScroll(!autoScroll)}
          >
            Auto-scroll
          </Button>
        </Tooltip>
      </Box>

      {/* Progress indicator */}
      {isRunning && (
        <LinearProgress sx={{ mb: 1, borderRadius: 1 }} />
      )}

      {/* Output Content */}
      <Paper
        ref={outputRef}
        elevation={0}
        sx={{
          flexGrow: 1,
          bgcolor: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", Consolas, monospace',
          fontSize: '0.85rem',
          p: 2,
          overflow: 'auto',
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          minHeight: 400,
        }}
      >
        {output.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 300,
              color: '#666',
            }}
          >
            <TerminalIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" sx={{ color: '#888', mb: 1 }}>
              No output yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', maxWidth: 400 }}>
              Click the <strong>Simulate</strong> button to preview what organize will do, 
              or click <strong>Run</strong> to execute your configuration.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Chip
                icon={<SimulateIcon />}
                label="Simulate"
                variant="outlined"
                sx={{ color: '#888', borderColor: '#555' }}
              />
              <Chip
                icon={<PlayIcon />}
                label="Run"
                variant="outlined"
                sx={{ color: '#888', borderColor: '#555' }}
              />
            </Box>
          </Box>
        ) : (
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {output.map((line, index) => (
              <span key={index} style={getLineStyle(line)}>
                {line}
              </span>
            ))}
          </pre>
        )}
      </Paper>

      {/* Footer stats */}
      {output.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {output.length} lines
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {output.join('').length} characters
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default OutputPage;
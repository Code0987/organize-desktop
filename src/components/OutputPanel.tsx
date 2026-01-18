import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Delete as ClearIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

interface OutputPanelProps {
  height?: number | string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ height = 300 }) => {
  const { output, clearOutput, isRunning } = useApp();
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output arrives
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output.join(''));
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([output.join('')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organize-output-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ height }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2">
          Output
          {isRunning && <span style={{ marginLeft: 8 }}>● Running...</span>}
        </Typography>
        <Box>
          <Tooltip title="Copy to clipboard">
            <IconButton size="small" onClick={handleCopy} disabled={output.length === 0}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download as file">
            <IconButton size="small" onClick={handleDownload} disabled={output.length === 0}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear output">
            <IconButton size="small" onClick={clearOutput} disabled={output.length === 0}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box
        ref={outputRef}
        sx={{
          height: `calc(${typeof height === 'number' ? `${height}px` : height} - 45px)`,
          overflow: 'auto',
          bgcolor: 'grey.900',
          color: 'grey.100',
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          fontSize: '0.8rem',
          p: 1.5,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {output.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: 'grey.500', fontFamily: 'inherit' }}
          >
            Output will appear here when you run or simulate rules...
          </Typography>
        ) : (
          output.map((line, index) => (
            <span
              key={index}
              style={{
                color: line.includes('[ERROR]')
                  ? '#ff5252'
                  : line.includes('[Completed')
                  ? '#69f0ae'
                  : line.startsWith('$')
                  ? '#64b5f6'
                  : 'inherit',
              }}
            >
              {line}
            </span>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default OutputPanel;

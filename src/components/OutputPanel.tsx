import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Delete as ClearIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';

interface OutputPanelProps {
  expanded?: boolean;
  onToggleExpand?: () => void;
  minHeight?: number;
  maxHeight?: number;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ 
  expanded = true, 
  onToggleExpand,
  minHeight = 200,
  maxHeight = 500
}) => {
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
    a.download = `organize-output-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const height = expanded ? maxHeight : minHeight;

  return (
    <Paper 
      elevation={3}
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: height,
        transition: 'height 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Output Console
          </Typography>
          {isRunning && (
            <Chip 
              label="Running..." 
              size="small" 
              color="primary" 
              sx={{ 
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1 },
                  '50%': { opacity: 0.5 },
                  '100%': { opacity: 1 },
                }
              }}
            />
          )}
          {!isRunning && output.length > 0 && (
            <Chip 
              label={`${output.length} lines`} 
              size="small" 
              variant="outlined"
            />
          )}
        </Box>
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
          {onToggleExpand && (
            <Tooltip title={expanded ? "Collapse" : "Expand"}>
              <IconButton size="small" onClick={onToggleExpand}>
                {expanded ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Output content */}
      <Box
        ref={outputRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: '"JetBrains Mono", "Fira Code", Consolas, monospace',
          fontSize: '13px',
          lineHeight: 1.5,
          p: 2,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {output.length === 0 ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%',
            color: '#666',
          }}>
            <Typography variant="body2" sx={{ fontFamily: 'inherit' }}>
              Click "Simulate" or "Run" to see output here...
            </Typography>
          </Box>
        ) : (
          output.map((line, index) => {
            // Color coding based on content
            let color = '#d4d4d4'; // default
            if (line.includes('[ERROR]') || line.includes('✗')) {
              color = '#f48771';
            } else if (line.includes('[DEBUG]')) {
              color = '#888';
            } else if (line.includes('[INFO]')) {
              color = '#4fc1ff';
            } else if (line.includes('✓') || line.includes('Completed successfully')) {
              color = '#89d185';
            } else if (line.startsWith('===')) {
              color = '#dcdcaa';
            } else if (line.startsWith('$')) {
              color = '#c586c0';
            }
            
            return (
              <span key={index} style={{ color }}>
                {line}
              </span>
            );
          })
        )}
      </Box>
    </Paper>
  );
};

export default OutputPanel;

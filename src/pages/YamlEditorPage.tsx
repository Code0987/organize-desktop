import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Divider,
  Alert,
  Chip,
  Tooltip,
  Grid,
  Snackbar,
} from '@mui/material';
import {
  Check as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import Editor from '@monaco-editor/react';
import { useApp } from '../context/AppContext';
import { yamlToConfig, configToYaml, validateConfig } from '../utils/yaml';

const YamlEditorPage: React.FC = () => {
  const {
    config,
    setConfig,
    yamlContent,
    setYamlContent,
    setIsModified,
    settings,
  } = useApp();

  const [localYaml, setLocalYaml] = useState(yamlContent);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] }>({ valid: true, errors: [] });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Sync local yaml with context when switching to this page
  useEffect(() => {
    const newYaml = configToYaml(config);
    setLocalYaml(newYaml);
    setYamlContent(newYaml);
  }, []);

  // Validate on change
  useEffect(() => {
    const result = validateConfig(localYaml);
    setValidationResult(result);
  }, [localYaml]);

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || '';
    setLocalYaml(newValue);
    setIsModified(true);
    
    // Try to parse and update the config
    try {
      const result = validateConfig(newValue);
      if (result.valid) {
        const newConfig = yamlToConfig(newValue);
        setConfig(newConfig);
        setYamlContent(newValue);
      }
    } catch (error) {
      // Invalid YAML, keep local state but don't update config
    }
  };

  const handleSyncFromVisual = () => {
    const newYaml = configToYaml(config);
    setLocalYaml(newYaml);
    setYamlContent(newYaml);
    setSnackbarMessage('Synced from visual editor');
    setSnackbarOpen(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(localYaml);
      setSnackbarMessage('Copied to clipboard');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Failed to copy');
      setSnackbarOpen(true);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLocalYaml(text);
      handleEditorChange(text);
      setSnackbarMessage('Pasted from clipboard');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Failed to paste');
      setSnackbarOpen(true);
    }
  };

  const isDarkMode = settings?.theme === 'dark' || 
    (settings?.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Paper sx={{ p: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">YAML Editor</Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Validation status */}
          <Chip
            icon={validationResult.valid ? <CheckIcon /> : <ErrorIcon />}
            label={validationResult.valid ? 'Valid YAML' : `${validationResult.errors.length} error(s)`}
            color={validationResult.valid ? 'success' : 'error'}
            size="small"
          />
          
          <Divider orientation="vertical" flexItem />
          
          <Tooltip title="Sync from Visual Editor">
            <IconButton size="small" onClick={handleSyncFromVisual}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Copy to Clipboard">
            <IconButton size="small" onClick={handleCopyToClipboard}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Paste from Clipboard">
            <IconButton size="small" onClick={handlePasteFromClipboard}>
              <UploadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Validation Errors */}
      {!validationResult.valid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Validation Errors:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationResult.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Editor */}
      <Paper sx={{ flexGrow: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language="yaml"
          theme={isDarkMode ? 'vs-dark' : 'light'}
          value={localYaml}
          onChange={handleEditorChange}
          options={{
            fontSize: settings?.fontSize || 14,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            insertSpaces: true,
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            renderWhitespace: 'selection',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            folding: true,
            foldingStrategy: 'indentation',
          }}
        />
      </Paper>

      {/* Help Text */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Basic Structure
            </Typography>
            <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
{`rules:
  - name: "Rule Name"
    locations:
      - ~/Downloads
    filters:
      - extension: pdf
    actions:
      - move: ~/Documents/`}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Common Filters
            </Typography>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
              extension: pdf<br />
              size: "&gt; 1 MB"<br />
              lastmodified: days: 30<br />
              name: startswith: "Invoice"<br />
              duplicate<br />
              empty
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Common Actions
            </Typography>
            <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace' }}>
              move: ~/Folder/<br />
              copy: ~/Backup/<br />
              rename: "{'{name}'}.{'{extension.lower()}'}"<br />
              trash<br />
              delete<br />
              echo: "Found: {'{path}'}"
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default YamlEditorPage;

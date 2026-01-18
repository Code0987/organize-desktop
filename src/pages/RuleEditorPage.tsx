import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Tooltip,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Collapse,
  Alert,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  DragIndicator as DragIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Folder as FolderIcon,
  FilterAlt as FilterIcon,
  PlayArrow as ActionIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import RuleEditor from '../components/RuleEditor';
import { Rule } from '../types';
import { createEmptyRule } from '../utils/yaml';

const RuleEditorPage: React.FC = () => {
  const {
    config,
    addRule,
    updateRule,
    deleteRule,
    moveRule,
    duplicateRule,
    selectedRuleId,
    setSelectedRuleId,
    setIsModified,
  } = useApp();

  const [menuAnchor, setMenuAnchor] = useState<{
    element: HTMLElement | null;
    ruleId: string | null;
  }>({ element: null, ruleId: null });

  const selectedRule = config.rules.find((r) => r.id === selectedRuleId);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, ruleId: string) => {
    event.stopPropagation();
    setMenuAnchor({ element: event.currentTarget, ruleId });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ element: null, ruleId: null });
  };

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      deleteRule(ruleId);
    }
    handleMenuClose();
  };

  const handleDuplicateRule = (ruleId: string) => {
    duplicateRule(ruleId);
    handleMenuClose();
  };

  const handleToggleEnabled = (rule: Rule) => {
    updateRule(rule.id, { ...rule, enabled: !rule.enabled });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      moveRule(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < config.rules.length - 1) {
      moveRule(index, index + 1);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', gap: 3 }}>
      {/* Rules List */}
      <Paper
        sx={{
          width: 360,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Rules</Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={addRule}
            >
              Add Rule
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {config.rules.length} rule{config.rules.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        <List sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
          {config.rules.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                No rules yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addRule}
                sx={{ mt: 1 }}
              >
                Create First Rule
              </Button>
            </Box>
          ) : (
            config.rules.map((rule, index) => (
              <ListItem
                key={rule.id}
                button
                selected={selectedRuleId === rule.id}
                onClick={() => setSelectedRuleId(rule.id)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  border: 1,
                  borderColor: selectedRuleId === rule.id ? 'primary.main' : 'divider',
                  bgcolor: selectedRuleId === rule.id ? 'action.selected' : 'background.paper',
                  opacity: rule.enabled === false ? 0.6 : 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <DragIcon sx={{ cursor: 'grab', color: 'text.secondary' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          textDecoration: rule.enabled === false ? 'line-through' : 'none',
                        }}
                      >
                        {rule.name || `Rule ${index + 1}`}
                      </Typography>
                      {rule.enabled === false && (
                        <Chip label="disabled" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.7rem' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        icon={<FolderIcon sx={{ fontSize: '0.8rem !important' }} />}
                        label={rule.locations.length}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, height: 20, fontSize: '0.7rem' }}
                      />
                      <Chip
                        icon={<FilterIcon sx={{ fontSize: '0.8rem !important' }} />}
                        label={rule.filters?.length || 0}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, height: 20, fontSize: '0.7rem' }}
                      />
                      <Chip
                        icon={<ActionIcon sx={{ fontSize: '0.8rem !important' }} />}
                        label={rule.actions?.length || 0}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, rule.id)}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Rule Editor */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {selectedRule ? (
          <RuleEditor
            rule={selectedRule}
            onUpdate={(updated) => updateRule(selectedRule.id, updated)}
          />
        ) : (
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a rule to edit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Or create a new one to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addRule}
                sx={{ mt: 2 }}
              >
                Add Rule
              </Button>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor.element}
        open={Boolean(menuAnchor.element)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const rule = config.rules.find((r) => r.id === menuAnchor.ruleId);
            if (rule) handleToggleEnabled(rule);
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            {config.rules.find((r) => r.id === menuAnchor.ruleId)?.enabled === false ? (
              <VisibilityIcon fontSize="small" />
            ) : (
              <VisibilityOffIcon fontSize="small" />
            )}
          </ListItemIcon>
          {config.rules.find((r) => r.id === menuAnchor.ruleId)?.enabled === false
            ? 'Enable'
            : 'Disable'}
        </MenuItem>
        <MenuItem onClick={() => menuAnchor.ruleId && handleDuplicateRule(menuAnchor.ruleId)}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => menuAnchor.ruleId && handleDeleteRule(menuAnchor.ruleId)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default RuleEditorPage;

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
  IconButton,
  Divider,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Folder as FolderIcon,
  FilterAlt as FilterIcon,
  PlayArrow as ActionIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  FolderOpen as BrowseIcon,
} from '@mui/icons-material';
import { Rule, Location, Filter, Action } from '../types';
import { filterDefinitions, actionDefinitions, getFilterDefinition, getActionDefinition } from '../utils/definitions';
import { createEmptyFilter, createEmptyAction } from '../utils/yaml';
import FilterEditor from './FilterEditor';
import ActionEditor from './ActionEditor';

interface RuleEditorProps {
  rule: Rule;
  onUpdate: (rule: Rule) => void;
}

const RuleEditor: React.FC<RuleEditorProps> = ({ rule, onUpdate }) => {
  const [expandedSection, setExpandedSection] = useState<string | false>('locations');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null);
  const [editingAction, setEditingAction] = useState<Action | null>(null);

  const handleChange = (field: keyof Rule, value: any) => {
    onUpdate({ ...rule, [field]: value });
  };

  const handleLocationChange = (index: number, location: Location) => {
    const newLocations = [...rule.locations];
    newLocations[index] = location;
    handleChange('locations', newLocations);
  };

  const handleAddLocation = async () => {
    try {
      const result = await window.electronAPI.openFolderDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        handleChange('locations', [...rule.locations, { path: result.filePaths[0] }]);
      }
    } catch (error) {
      // Add a default location
      handleChange('locations', [...rule.locations, { path: '~/Downloads' }]);
    }
  };

  const handleRemoveLocation = (index: number) => {
    const newLocations = rule.locations.filter((_, i) => i !== index);
    handleChange('locations', newLocations);
  };

  const handleAddFilter = (type: string) => {
    const newFilter = createEmptyFilter(type);
    handleChange('filters', [...(rule.filters || []), newFilter]);
    setFilterDialogOpen(false);
  };

  const handleUpdateFilter = (filterId: string, filter: Filter) => {
    const newFilters = (rule.filters || []).map((f) =>
      f.id === filterId ? filter : f
    );
    handleChange('filters', newFilters);
  };

  const handleRemoveFilter = (filterId: string) => {
    const newFilters = (rule.filters || []).filter((f) => f.id !== filterId);
    handleChange('filters', newFilters);
    setEditingFilter(null);
  };

  const handleAddAction = (type: string) => {
    const newAction = createEmptyAction(type);
    handleChange('actions', [...(rule.actions || []), newAction]);
    setActionDialogOpen(false);
  };

  const handleUpdateAction = (actionId: string, action: Action) => {
    const newActions = (rule.actions || []).map((a) =>
      a.id === actionId ? action : a
    );
    handleChange('actions', newActions);
  };

  const handleRemoveAction = (actionId: string) => {
    const newActions = (rule.actions || []).filter((a) => a.id !== actionId);
    handleChange('actions', newActions);
    setEditingAction(null);
  };

  return (
    <Paper sx={{ height: '100%', overflow: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rule Name"
              value={rule.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter a descriptive name"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Targets</InputLabel>
              <Select
                value={rule.targets || 'files'}
                label="Targets"
                onChange={(e) => handleChange('targets', e.target.value)}
              >
                <MenuItem value="files">Files</MenuItem>
                <MenuItem value="dirs">Directories</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={rule.enabled !== false}
                  onChange={(e) => handleChange('enabled', e.target.checked)}
                />
              }
              label="Enabled"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Locations Section */}
      <Accordion
        expanded={expandedSection === 'locations'}
        onChange={() => setExpandedSection(expandedSection === 'locations' ? false : 'locations')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon color="primary" />
            <Typography variant="h6">Locations</Typography>
            <Chip label={rule.locations.length} size="small" sx={{ ml: 1 }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={rule.subfolders || false}
                  onChange={(e) => handleChange('subfolders', e.target.checked)}
                  size="small"
                />
              }
              label="Include subfolders"
            />
          </Box>
          
          <List>
            {rule.locations.map((location, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <FolderIcon />
                </ListItemIcon>
                <ListItemText>
                  <TextField
                    fullWidth
                    size="small"
                    value={location.path}
                    onChange={(e) =>
                      handleLocationChange(index, { ...location, path: e.target.value })
                    }
                    placeholder="~/Downloads"
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          size="small"
                          onClick={async () => {
                            try {
                              const result = await window.electronAPI.openFolderDialog();
                              if (!result.canceled && result.filePaths.length > 0) {
                                handleLocationChange(index, {
                                  ...location,
                                  path: result.filePaths[0],
                                });
                              }
                            } catch (error) {
                              console.error('Failed to open folder dialog:', error);
                            }
                          }}
                        >
                          <BrowseIcon fontSize="small" />
                        </IconButton>
                      ),
                    }}
                  />
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveLocation(index)}
                    disabled={rule.locations.length <= 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddLocation}
          >
            Add Location
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Filters Section */}
      <Accordion
        expanded={expandedSection === 'filters'}
        onChange={() => setExpandedSection(expandedSection === 'filters' ? false : 'filters')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon color="secondary" />
            <Typography variant="h6">Filters</Typography>
            <Chip label={rule.filters?.length || 0} size="small" sx={{ ml: 1 }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Filter Mode</InputLabel>
              <Select
                value={rule.filter_mode || 'all'}
                label="Filter Mode"
                onChange={(e) => handleChange('filter_mode', e.target.value)}
              >
                <MenuItem value="all">Match ALL filters</MenuItem>
                <MenuItem value="any">Match ANY filter</MenuItem>
                <MenuItem value="none">Match NONE</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {(rule.filters || []).length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No filters - all files/folders in locations will match
            </Typography>
          ) : (
            <List>
              {(rule.filters || []).map((filter, index) => (
                <ListItem
                  key={filter.id}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <ListItemIcon>
                      <DragIcon sx={{ cursor: 'grab' }} />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {filter.negated && (
                          <Chip label="NOT" size="small" color="error" variant="outlined" />
                        )}
                        <Chip
                          label={getFilterDefinition(filter.type)?.label || filter.type}
                          size="small"
                          color="secondary"
                        />
                        {Object.keys(filter.config).length > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {JSON.stringify(filter.config).substring(0, 50)}
                            {JSON.stringify(filter.config).length > 50 ? '...' : ''}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setEditingFilter(filter)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRemoveFilter(filter.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setFilterDialogOpen(true)}
          >
            Add Filter
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Actions Section */}
      <Accordion
        expanded={expandedSection === 'actions'}
        onChange={() => setExpandedSection(expandedSection === 'actions' ? false : 'actions')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ActionIcon color="success" />
            <Typography variant="h6">Actions</Typography>
            <Chip label={rule.actions?.length || 0} size="small" sx={{ ml: 1 }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          {(rule.actions || []).length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No actions defined - add at least one action
            </Typography>
          ) : (
            <List>
              {(rule.actions || []).map((action, index) => (
                <ListItem
                  key={action.id}
                  sx={{
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    mb: 1,
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <ListItemIcon>
                      <DragIcon sx={{ cursor: 'grab' }} />
                    </ListItemIcon>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={getActionDefinition(action.type)?.label || action.type}
                          size="small"
                          color="success"
                        />
                        {Object.keys(action.config).length > 0 && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {JSON.stringify(action.config).substring(0, 50)}
                            {JSON.stringify(action.config).length > 50 ? '...' : ''}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <IconButton size="small" onClick={() => setEditingAction(action)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleRemoveAction(action.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setActionDialogOpen(true)}
          >
            Add Action
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Tags Section */}
      <Accordion
        expanded={expandedSection === 'tags'}
        onChange={() => setExpandedSection(expandedSection === 'tags' ? false : 'tags')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Tags</Typography>
            <Chip label={rule.tags?.length || 0} size="small" sx={{ ml: 1 }} />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Autocomplete
            multiple
            freeSolo
            options={['always', 'never', 'cleanup', 'organize', 'backup', 'archive']}
            value={rule.tags || []}
            onChange={(_, newValue) => handleChange('tags', newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Add tags..."
                helperText="Tags can be used to run specific rules with --tags or exclude with --skip-tags"
              />
            )}
          />
        </AccordionDetails>
      </Accordion>

      {/* Add Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Filter</DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            {filterDefinitions.map((filter) => (
              <Grid item xs={6} sm={4} key={filter.name}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAddFilter(filter.name)}
                  sx={{
                    py: 1.5,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {filter.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {filter.description.substring(0, 40)}...
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Add Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Action</DialogTitle>
        <DialogContent>
          <Grid container spacing={1}>
            {actionDefinitions.map((action) => (
              <Grid item xs={6} sm={4} key={action.name}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAddAction(action.name)}
                  sx={{
                    py: 1.5,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {action.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description.substring(0, 40)}...
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Filter Dialog */}
      <Dialog
        open={Boolean(editingFilter)}
        onClose={() => setEditingFilter(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Filter: {editingFilter && getFilterDefinition(editingFilter.type)?.label}
        </DialogTitle>
        <DialogContent>
          {editingFilter && (
            <FilterEditor
              filter={editingFilter}
              onUpdate={(updated) => {
                handleUpdateFilter(editingFilter.id, updated);
                setEditingFilter(updated);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => editingFilter && handleRemoveFilter(editingFilter.id)}
            color="error"
          >
            Delete
          </Button>
          <Button onClick={() => setEditingFilter(null)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Action Dialog */}
      <Dialog
        open={Boolean(editingAction)}
        onClose={() => setEditingAction(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Action: {editingAction && getActionDefinition(editingAction.type)?.label}
        </DialogTitle>
        <DialogContent>
          {editingAction && (
            <ActionEditor
              action={editingAction}
              onUpdate={(updated) => {
                handleUpdateAction(editingAction.id, updated);
                setEditingAction(updated);
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => editingAction && handleRemoveAction(editingAction.id)}
            color="error"
          >
            Delete
          </Button>
          <Button onClick={() => setEditingAction(null)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default RuleEditor;

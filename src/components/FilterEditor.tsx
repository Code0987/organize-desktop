import React from 'react';
import {
  Box,
  TextField,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Filter } from '../types';
import { getFilterDefinition } from '../utils/definitions';

interface FilterEditorProps {
  filter: Filter;
  onUpdate: (filter: Filter) => void;
}

const FilterEditor: React.FC<FilterEditorProps> = ({ filter, onUpdate }) => {
  const definition = getFilterDefinition(filter.type);

  const handleConfigChange = (key: string, value: any) => {
    onUpdate({
      ...filter,
      config: { ...filter.config, [key]: value },
    });
  };

  const handleNegatedChange = (negated: boolean) => {
    onUpdate({ ...filter, negated });
  };

  if (!definition) {
    return (
      <Typography color="error">
        Unknown filter type: {filter.type}
      </Typography>
    );
  }

  return (
    <Box sx={{ pt: 1 }}>
      <FormControlLabel
        control={
          <Switch
            checked={filter.negated || false}
            onChange={(e) => handleNegatedChange(e.target.checked)}
          />
        }
        label="Negate filter (NOT)"
        sx={{ mb: 2 }}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {definition.description}
      </Typography>

      {definition.properties.map((prop) => (
        <Box key={prop.name} sx={{ mb: 2 }}>
          {prop.type === 'string' && (
            <TextField
              fullWidth
              label={prop.label}
              value={filter.config[prop.name] || ''}
              onChange={(e) => handleConfigChange(prop.name, e.target.value)}
              placeholder={prop.placeholder}
              helperText={prop.description}
              multiline={prop.name === 'pattern'}
              rows={prop.name === 'pattern' ? 2 : 1}
            />
          )}

          {prop.type === 'number' && (
            <TextField
              fullWidth
              type="number"
              label={prop.label}
              value={filter.config[prop.name] || ''}
              onChange={(e) =>
                handleConfigChange(
                  prop.name,
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder={prop.placeholder}
              helperText={prop.description}
            />
          )}

          {prop.type === 'boolean' && (
            <FormControlLabel
              control={
                <Switch
                  checked={filter.config[prop.name] ?? prop.default ?? false}
                  onChange={(e) => handleConfigChange(prop.name, e.target.checked)}
                />
              }
              label={prop.label}
            />
          )}

          {prop.type === 'select' && (
            <FormControl fullWidth>
              <InputLabel>{prop.label}</InputLabel>
              <Select
                value={filter.config[prop.name] || prop.default || ''}
                label={prop.label}
                onChange={(e) => handleConfigChange(prop.name, e.target.value)}
              >
                {prop.options?.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {prop.description && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {prop.description}
                </Typography>
              )}
            </FormControl>
          )}

          {prop.type === 'string[]' && (
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={filter.config[prop.name] || []}
              onChange={(_, newValue) => handleConfigChange(prop.name, newValue)}
              renderTags={(value, getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip label={option} size="small" {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={prop.label}
                  placeholder={prop.placeholder}
                  helperText={prop.description}
                />
              )}
            />
          )}

          {prop.type === 'code' && (
            <TextField
              fullWidth
              multiline
              rows={6}
              label={prop.label}
              value={filter.config[prop.name] || ''}
              onChange={(e) => handleConfigChange(prop.name, e.target.value)}
              placeholder={prop.placeholder}
              helperText={prop.description}
              InputProps={{
                sx: {
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          )}
        </Box>
      ))}

      {definition.properties.length === 0 && (
        <Typography color="text.secondary">
          This filter has no configurable options.
        </Typography>
      )}
    </Box>
  );
};

export default FilterEditor;

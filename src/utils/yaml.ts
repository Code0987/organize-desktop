import yaml from 'js-yaml';
import { v4 as uuidv4 } from 'uuid';
import { OrganizeConfig, Rule, Location, Filter, Action } from '../types';

// Helper to check if a value is serializable (not a function)
function isSerializable(value: any): boolean {
  return typeof value !== 'function' && typeof value !== 'symbol';
}

// Helper to clean an object of non-serializable values
function cleanObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'function' || typeof obj === 'symbol') {
    return undefined;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item)).filter(item => item !== undefined);
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (isSerializable(value)) {
        const cleanedValue = cleanObject(value);
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    return cleaned;
  }
  return obj;
}

// Convert internal config to YAML string
export function configToYaml(config: OrganizeConfig): string {
  const cleanConfig = {
    rules: config.rules.map(rule => ruleToYamlObject(rule))
  };
  // Clean the config to remove any functions before dumping
  const sanitized = cleanObject(cleanConfig);
  return yaml.dump(sanitized, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false
  });
}

// Convert YAML string to internal config
export function yamlToConfig(yamlContent: string): OrganizeConfig {
  const parsed = yaml.load(yamlContent) as any;
  
  if (!parsed || !parsed.rules) {
    return { rules: [] };
  }
  
  return {
    rules: parsed.rules.map((rule: any) => yamlObjectToRule(rule))
  };
}

// Convert internal rule to YAML-ready object
function ruleToYamlObject(rule: Rule): any {
  const result: any = {};
  
  if (rule.name) {
    result.name = rule.name;
  }
  
  if (rule.enabled === false) {
    result.enabled = false;
  }
  
  if (rule.targets && rule.targets !== 'files') {
    result.targets = rule.targets;
  }
  
  // Convert locations
  if (rule.locations.length === 1 && isSimpleLocation(rule.locations[0])) {
    result.locations = rule.locations[0].path;
  } else {
    result.locations = rule.locations.map(loc => locationToYamlObject(loc));
  }
  
  if (rule.subfolders) {
    result.subfolders = true;
  }
  
  if (rule.filter_mode && rule.filter_mode !== 'all') {
    result.filter_mode = rule.filter_mode;
  }
  
  // Convert filters
  if (rule.filters && rule.filters.length > 0) {
    result.filters = rule.filters.map(filter => filterToYamlObject(filter));
  }
  
  // Convert actions
  if (rule.actions && rule.actions.length > 0) {
    result.actions = rule.actions.map(action => actionToYamlObject(action));
  } else {
    result.actions = [];
  }
  
  if (rule.tags && rule.tags.length > 0) {
    result.tags = rule.tags;
  }
  
  return result;
}

// Check if location only has path
function isSimpleLocation(loc: Location): boolean {
  const keys = Object.keys(loc).filter(k => k !== 'path');
  return keys.every(k => (loc as any)[k] === undefined || (loc as any)[k] === null);
}

// Convert location to YAML object
function locationToYamlObject(loc: Location): any {
  if (isSimpleLocation(loc)) {
    return loc.path;
  }
  
  const result: any = { path: loc.path };
  
  if (loc.min_depth !== undefined && loc.min_depth !== null) {
    result.min_depth = loc.min_depth;
  }
  if (loc.max_depth !== undefined) {
    result.max_depth = loc.max_depth;
  }
  if (loc.search && loc.search !== 'depth') {
    result.search = loc.search;
  }
  if (loc.exclude_files && loc.exclude_files.length > 0) {
    result.exclude_files = loc.exclude_files;
  }
  if (loc.exclude_dirs && loc.exclude_dirs.length > 0) {
    result.exclude_dirs = loc.exclude_dirs;
  }
  if (loc.system_exclude_files) {
    result.system_exclude_files = loc.system_exclude_files;
  }
  if (loc.system_exclude_dirs) {
    result.system_exclude_dirs = loc.system_exclude_dirs;
  }
  if (loc.ignore_errors) {
    result.ignore_errors = true;
  }
  if (loc.filter && loc.filter.length > 0) {
    result.filter = loc.filter;
  }
  if (loc.filter_dirs && loc.filter_dirs.length > 0) {
    result.filter_dirs = loc.filter_dirs;
  }
  
  return result;
}

// Convert filter to YAML object
function filterToYamlObject(filter: Filter): any {
  const filterName = filter.negated ? `not ${filter.type}` : filter.type;
  
  // Check if filter has any non-default config (excluding functions)
  const configKeys = Object.keys(filter.config).filter(k => {
    const val = filter.config[k];
    return val !== undefined && val !== null && val !== '' && 
           typeof val !== 'function' &&
           !(Array.isArray(val) && val.length === 0);
  });
  
  if (configKeys.length === 0) {
    return filterName;
  }
  
  // Special cases for single-value filters
  if (configKeys.length === 1) {
    const key = configKeys[0];
    const val = filter.config[key];
    
    // For extension filter with just extensions
    if (filter.type === 'extension' && key === 'extensions') {
      if (Array.isArray(val) && val.length === 1) {
        return { [filterName]: val[0] };
      }
      return { [filterName]: val };
    }
    
    // For size filter with just conditions
    if (filter.type === 'size' && key === 'conditions') {
      return { [filterName]: val };
    }
    
    // For regex filter with just pattern
    if (filter.type === 'regex' && key === 'pattern') {
      return { [filterName]: val };
    }
    
    // For filecontent filter with just pattern
    if (filter.type === 'filecontent' && key === 'pattern') {
      return { [filterName]: val };
    }
    
    // For python filter with just code
    if (filter.type === 'python' && key === 'code') {
      return { [filterName]: val };
    }
  }
  
  // Full config - only include serializable values
  const cleanConfig: any = {};
  for (const key of configKeys) {
    const val = filter.config[key];
    if (typeof val !== 'function') {
      cleanConfig[key] = val;
    }
  }
  
  return { [filterName]: cleanConfig };
}

// Convert action to YAML object
function actionToYamlObject(action: Action): any {
  // Check if action has any non-default config (excluding functions)
  const configKeys = Object.keys(action.config).filter(k => {
    const val = action.config[k];
    return val !== undefined && val !== null && val !== '' &&
           typeof val !== 'function' &&
           !(Array.isArray(val) && val.length === 0);
  });
  
  // Actions without config
  if (configKeys.length === 0) {
    return action.type;
  }
  
  // Special cases for single-value actions
  if (configKeys.length === 1) {
    const key = configKeys[0];
    const val = action.config[key];
    
    // For move/copy/rename with just dest/name
    if (['move', 'copy'].includes(action.type) && key === 'dest') {
      return { [action.type]: val };
    }
    
    if (action.type === 'rename' && key === 'name') {
      return { [action.type]: val };
    }
    
    // For echo with just msg
    if (action.type === 'echo' && key === 'msg') {
      return { [action.type]: val };
    }
    
    // For shell with just command
    if (action.type === 'shell' && key === 'command') {
      return { [action.type]: val };
    }
    
    // For confirm with just msg
    if (action.type === 'confirm' && key === 'msg') {
      return { [action.type]: val };
    }
    
    // For python with just code
    if (action.type === 'python' && key === 'code') {
      return { [action.type]: val };
    }
    
    // For macos_tags with just tags
    if (action.type === 'macos_tags' && key === 'tags') {
      if (Array.isArray(val) && val.length === 1) {
        return { [action.type]: val[0] };
      }
      return { [action.type]: val };
    }
  }
  
  // Full config - only include serializable values
  const cleanConfig: any = {};
  for (const key of configKeys) {
    const val = action.config[key];
    if (typeof val !== 'function') {
      cleanConfig[key] = val;
    }
  }
  
  return { [action.type]: cleanConfig };
}

// Parse YAML rule to internal format
function yamlObjectToRule(obj: any): Rule {
  const rule: Rule = {
    id: uuidv4(),
    locations: [],
    actions: []
  };
  
  if (obj.name) rule.name = obj.name;
  if (obj.enabled !== undefined) rule.enabled = obj.enabled;
  if (obj.targets) rule.targets = obj.targets;
  if (obj.subfolders) rule.subfolders = obj.subfolders;
  if (obj.filter_mode) rule.filter_mode = obj.filter_mode;
  if (obj.tags) rule.tags = obj.tags;
  
  // Parse locations
  if (typeof obj.locations === 'string') {
    rule.locations = [{ path: obj.locations }];
  } else if (Array.isArray(obj.locations)) {
    rule.locations = obj.locations.map((loc: any) => {
      if (typeof loc === 'string') {
        return { path: loc };
      }
      return loc as Location;
    });
  }
  
  // Parse filters
  if (obj.filters) {
    rule.filters = obj.filters.map((f: any) => parseFilter(f));
  }
  
  // Parse actions
  if (obj.actions) {
    rule.actions = obj.actions.map((a: any) => parseAction(a));
  }
  
  return rule;
}

// Parse YAML filter
function parseFilter(obj: any): Filter {
  // Simple filter (just the name)
  if (typeof obj === 'string') {
    const negated = obj.startsWith('not ');
    const type = negated ? obj.slice(4).trim() : obj;
    return {
      id: uuidv4(),
      type: type as any,
      negated,
      config: {}
    };
  }
  
  // Filter with config
  const key = Object.keys(obj)[0];
  const negated = key.startsWith('not ');
  const type = negated ? key.slice(4).trim() : key;
  const value = obj[key];
  
  let config: Record<string, any> = {};
  
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    config = { ...value };
  } else if (value !== null && value !== undefined) {
    // Map value to appropriate config key based on filter type
    switch (type) {
      case 'extension':
        config.extensions = Array.isArray(value) ? value : [value];
        break;
      case 'size':
        config.conditions = value;
        break;
      case 'regex':
      case 'filecontent':
        config.pattern = value;
        break;
      case 'python':
        config.code = value;
        break;
      case 'mimetype':
        config.types = Array.isArray(value) ? value : [value];
        break;
      case 'macos_tags':
        config.tags = Array.isArray(value) ? value : [value];
        break;
      case 'exif':
        config.tags = value;
        break;
      default:
        // For other filters, try to infer the config
        if (typeof value === 'object') {
          config = { ...value };
        } else {
          config = { value };
        }
    }
  }
  
  return {
    id: uuidv4(),
    type: type as any,
    negated,
    config
  };
}

// Parse YAML action
function parseAction(obj: any): Action {
  // Simple action (just the name)
  if (typeof obj === 'string') {
    return {
      id: uuidv4(),
      type: obj as any,
      config: {}
    };
  }
  
  // Action with config
  const key = Object.keys(obj)[0];
  const value = obj[key];
  
  let config: Record<string, any> = {};
  
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    config = { ...value };
  } else if (value !== null && value !== undefined) {
    // Map value to appropriate config key based on action type
    switch (key) {
      case 'move':
      case 'copy':
      case 'hardlink':
      case 'symlink':
        config.dest = value;
        break;
      case 'rename':
        config.name = value;
        break;
      case 'echo':
      case 'confirm':
        config.msg = value;
        break;
      case 'shell':
        config.command = value;
        break;
      case 'python':
        config.code = value;
        break;
      case 'macos_tags':
        config.tags = Array.isArray(value) ? value : [value];
        break;
      case 'write':
        if (typeof value === 'string') {
          config.outfile = value;
        } else {
          config = { ...value };
        }
        break;
      default:
        if (typeof value === 'object') {
          config = { ...value };
        } else {
          config = { value };
        }
    }
  }
  
  return {
    id: uuidv4(),
    type: key as any,
    config
  };
}

// Validate YAML config
export function validateConfig(yamlContent: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const parsed = yaml.load(yamlContent) as any;
    
    if (!parsed) {
      errors.push('Config is empty');
      return { valid: false, errors };
    }
    
    if (!parsed.rules) {
      errors.push('Config must have a "rules" key');
      return { valid: false, errors };
    }
    
    if (!Array.isArray(parsed.rules)) {
      errors.push('"rules" must be an array');
      return { valid: false, errors };
    }
    
    parsed.rules.forEach((rule: any, index: number) => {
      if (!rule.locations) {
        errors.push(`Rule ${index + 1}: Missing "locations"`);
      }
      if (!rule.actions) {
        errors.push(`Rule ${index + 1}: Missing "actions"`);
      }
    });
    
  } catch (e: any) {
    errors.push(`YAML syntax error: ${e.message}`);
  }
  
  return { valid: errors.length === 0, errors };
}

// Create empty rule
export function createEmptyRule(): Rule {
  return {
    id: uuidv4(),
    name: 'New Rule',
    enabled: true,
    targets: 'files',
    locations: [{ path: '~/Downloads' }],
    subfolders: false,
    filter_mode: 'all',
    filters: [],
    actions: [{ id: uuidv4(), type: 'echo', config: { msg: 'Found: {path}' } }],
    tags: []
  };
}

// Create empty filter
export function createEmptyFilter(type: string): Filter {
  return {
    id: uuidv4(),
    type: type as any,
    negated: false,
    config: {}
  };
}

// Create empty action
export function createEmptyAction(type: string): Action {
  return {
    id: uuidv4(),
    type: type as any,
    config: {}
  };
}

// Default config template
export function getDefaultConfig(): string {
  return `# organize configuration file
# Documentation: https://organize.readthedocs.io/

rules:
  - name: "Example: Find PDFs in Downloads"
    locations:
      - ~/Downloads
    subfolders: true
    filters:
      - extension: pdf
    actions:
      - echo: "Found PDF: {path}"
`;
}

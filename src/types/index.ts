// Type definitions for organize-desktop

export interface Settings {
  pythonPath: string;
  organizePath: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  autoSave: boolean;
  recentConfigs: string[];
  defaultConfigDir: string;
  showSystemFiles: boolean;
  confirmDangerousActions: boolean;
  maxRecentFiles: number;
  maxLogHistory: number;
}

export interface PlatformInfo {
  platform: string;
  arch: string;
  version: string;
}

export interface OrganizeResult {
  code: number;
  stdout: string;
  stderr: string;
}

export interface OrganizeInstallStatus {
  installed: boolean;
  version?: string;
  error?: string;
}

// Run Log Types
export interface RunLog {
  id: string;
  timestamp: string;
  command: 'sim' | 'run';
  configName: string;
  configContent: string;
  output: string[];
  exitCode: number;
  duration: number; // in milliseconds
  success: boolean;
}

// Rule Types
export interface Rule {
  id: string;
  name?: string;
  enabled?: boolean;
  targets?: 'files' | 'dirs';
  locations: Location[];
  subfolders?: boolean;
  filter_mode?: 'all' | 'any' | 'none';
  filters?: Filter[];
  actions: Action[];
  tags?: string[];
}

export interface Location {
  path: string;
  min_depth?: number | null;
  max_depth?: number | null;
  search?: 'breadth' | 'depth';
  exclude_files?: string[];
  exclude_dirs?: string[];
  system_exclude_files?: string[];
  system_exclude_dirs?: string[];
  ignore_errors?: boolean;
  filter?: string[];
  filter_dirs?: string[];
}

// Filter Types
export type FilterType =
  | 'created'
  | 'date_added'
  | 'date_lastused'
  | 'duplicate'
  | 'empty'
  | 'exif'
  | 'extension'
  | 'filecontent'
  | 'hash'
  | 'lastmodified'
  | 'macos_tags'
  | 'mimetype'
  | 'name'
  | 'python'
  | 'regex'
  | 'size';

export interface Filter {
  id: string;
  type: FilterType;
  negated?: boolean;
  config: Record<string, any>;
}

// Action Types
export type ActionType =
  | 'confirm'
  | 'copy'
  | 'delete'
  | 'echo'
  | 'hardlink'
  | 'macos_tags'
  | 'move'
  | 'python'
  | 'rename'
  | 'shell'
  | 'symlink'
  | 'trash'
  | 'write';

export interface Action {
  id: string;
  type: ActionType;
  config: Record<string, any>;
}

// Config Types
export interface OrganizeConfig {
  rules: Rule[];
}

// Filter Definitions
export interface FilterDefinition {
  name: FilterType;
  label: string;
  description: string;
  supportsFiles: boolean;
  supportsDirs: boolean;
  properties: PropertyDefinition[];
}

export interface ActionDefinition {
  name: ActionType;
  label: string;
  description: string;
  supportsFiles: boolean;
  supportsDirs: boolean;
  properties: PropertyDefinition[];
}

export interface PropertyDefinition {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'string[]' | 'code';
  required?: boolean;
  default?: any;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
}

// Electron API Type
export interface ElectronAPI {
  getSettings: () => Promise<Settings>;
  setSetting: (key: string, value: any) => Promise<boolean>;
  getSetting: (key: string) => Promise<any>;
  
  // Log management
  getRunLogs: () => Promise<RunLog[]>;
  getRunLog: (logId: string) => Promise<RunLog | undefined>;
  deleteRunLog: (logId: string) => Promise<RunLog[]>;
  clearAllLogs: () => Promise<RunLog[]>;
  saveRunLog: (logEntry: RunLog) => Promise<string>;
  
  openFileDialog: (options?: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
  openFolderDialog: (options?: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
  saveFileDialog: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  fileExists: (filePath: string) => Promise<boolean>;
  getHomeDir: () => Promise<string>;
  runOrganize: (command: string, configPath?: string, options?: any) => Promise<OrganizeResult>;
  runOrganizeStdin: (command: string, configContent: string, options?: any) => Promise<OrganizeResult>;
  checkOrganizeInstalled: () => Promise<OrganizeInstallStatus>;
  getDefaultConfigPath: () => Promise<{ success: boolean; path?: string; error?: string }>;
  listConfigs: () => Promise<{ success: boolean; output?: string; error?: string }>;
  onOrganizeOutput: (callback: (data: string) => void) => void;
  onOrganizeError: (callback: (data: string) => void) => void;
  removeOrganizeListeners: () => void;
  openExternal: (url: string) => Promise<boolean>;
  revealInFinder: (filePath: string) => Promise<boolean>;
  getPlatform: () => Promise<PlatformInfo>;
  addRecentFile: (filePath: string) => Promise<string[]>;
  getRecentFiles: () => Promise<string[]>;
  clearRecentFiles: () => Promise<string[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

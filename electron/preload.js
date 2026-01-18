const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),

  // Log management
  getRunLogs: () => ipcRenderer.invoke('get-run-logs'),
  getRunLog: (logId) => ipcRenderer.invoke('get-run-log', logId),
  deleteRunLog: (logId) => ipcRenderer.invoke('delete-run-log', logId),
  clearAllLogs: () => ipcRenderer.invoke('clear-all-logs'),
  saveRunLog: (logEntry) => ipcRenderer.invoke('save-run-log', logEntry),

  // File dialogs
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  openFolderDialog: (options) => ipcRenderer.invoke('open-folder-dialog', options),
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),

  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  fileExists: (filePath) => ipcRenderer.invoke('file-exists', filePath),
  getHomeDir: () => ipcRenderer.invoke('get-home-dir'),

  // Organize CLI
  runOrganize: (command, configPath, options) => 
    ipcRenderer.invoke('run-organize', command, configPath, options),
  runOrganizeStdin: (command, configContent, options) => 
    ipcRenderer.invoke('run-organize-stdin', command, configContent, options),
  checkOrganizeInstalled: () => ipcRenderer.invoke('check-organize-installed'),
  getDefaultConfigPath: () => ipcRenderer.invoke('get-default-config-path'),
  listConfigs: () => ipcRenderer.invoke('list-configs'),

  // Output listeners
  onOrganizeOutput: (callback) => {
    ipcRenderer.on('organize-output', (event, data) => callback(data));
  },
  onOrganizeError: (callback) => {
    ipcRenderer.on('organize-error', (event, data) => callback(data));
  },
  removeOrganizeListeners: () => {
    ipcRenderer.removeAllListeners('organize-output');
    ipcRenderer.removeAllListeners('organize-error');
  },

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  revealInFinder: (filePath) => ipcRenderer.invoke('reveal-in-finder', filePath),

  // Platform info
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // Recent files
  addRecentFile: (filePath) => ipcRenderer.invoke('add-recent-file', filePath),
  getRecentFiles: () => ipcRenderer.invoke('get-recent-files'),
  clearRecentFiles: () => ipcRenderer.invoke('clear-recent-files')
});

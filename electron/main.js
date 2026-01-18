const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

// Initialize settings store
const store = new Store({
  defaults: {
    pythonPath: 'python3',
    organizePath: '',
    theme: 'system',
    fontSize: 14,
    autoSave: true,
    recentConfigs: [],
    defaultConfigDir: '',
    showSystemFiles: false,
    confirmDangerousActions: true,
    maxRecentFiles: 10
  }
});

let mainWindow;

function createWindow() {
  // Hide the default menu bar completely
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../assets/icon.png'),
    // Also hide menu bar on Windows/Linux
    autoHideMenuBar: true
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

  // DevTools are NOT opened by default - even in development
  // To open DevTools during development, press Ctrl+Shift+I (or Cmd+Option+I on macOS)

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// Settings handlers
ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('get-setting', (event, key) => {
  return store.get(key);
});

// File dialog handlers
ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'YAML Files', extensions: ['yaml', 'yml'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    ...options
  });
  return result;
});

ipcMain.handle('open-folder-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    ...options
  });
  return result;
});

ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'YAML Files', extensions: ['yaml', 'yml'] }
    ],
    ...options
  });
  return result;
});

// File operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-exists', async (event, filePath) => {
  return fs.existsSync(filePath);
});

ipcMain.handle('get-home-dir', () => {
  return require('os').homedir();
});

// Organize CLI handlers
ipcMain.handle('run-organize', async (event, command, configPath, options = {}) => {
  return new Promise((resolve) => {
    const pythonPath = store.get('pythonPath') || 'python3';
    const args = ['-m', 'organize', command];
    
    if (configPath) {
      args.push(configPath);
    }
    
    if (options.workingDir) {
      args.push('--working-dir', options.workingDir);
    }
    
    if (options.tags) {
      args.push('--tags', options.tags);
    }
    
    if (options.skipTags) {
      args.push('--skip-tags', options.skipTags);
    }
    
    if (options.format) {
      args.push('--format', options.format);
    }

    const childProcess = spawn(pythonPath, args, {
      env: { ...process.env },
      cwd: options.workingDir || require('os').homedir()
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      mainWindow.webContents.send('organize-output', data.toString());
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      mainWindow.webContents.send('organize-error', data.toString());
    });

    childProcess.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    childProcess.on('error', (error) => {
      resolve({ code: -1, stdout, stderr: error.message });
    });
  });
});

// Run organize with stdin config
ipcMain.handle('run-organize-stdin', async (event, command, configContent, options = {}) => {
  return new Promise((resolve) => {
    const pythonPath = store.get('pythonPath') || 'python3';
    const args = ['-m', 'organize', command, '--stdin'];
    
    if (options.workingDir) {
      args.push('--working-dir', options.workingDir);
    }
    
    if (options.tags) {
      args.push('--tags', options.tags);
    }
    
    if (options.skipTags) {
      args.push('--skip-tags', options.skipTags);
    }
    
    if (options.format) {
      args.push('--format', options.format);
    }

    const childProcess = spawn(pythonPath, args, {
      env: { ...process.env },
      cwd: options.workingDir || require('os').homedir()
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdin.write(configContent);
    childProcess.stdin.end();

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      mainWindow.webContents.send('organize-output', data.toString());
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      mainWindow.webContents.send('organize-error', data.toString());
    });

    childProcess.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    childProcess.on('error', (error) => {
      resolve({ code: -1, stdout, stderr: error.message });
    });
  });
});

// Check organize installation
ipcMain.handle('check-organize-installed', async () => {
  return new Promise((resolve) => {
    const pythonPath = store.get('pythonPath') || 'python3';
    exec(`${pythonPath} -m organize --version`, (error, stdout, stderr) => {
      if (error) {
        resolve({ installed: false, error: error.message });
      } else {
        resolve({ installed: true, version: stdout.trim() });
      }
    });
  });
});

// Get default config path
ipcMain.handle('get-default-config-path', async () => {
  return new Promise((resolve) => {
    const pythonPath = store.get('pythonPath') || 'python3';
    exec(`${pythonPath} -m organize show --path`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true, path: stdout.trim() });
      }
    });
  });
});

// List configs
ipcMain.handle('list-configs', async () => {
  return new Promise((resolve) => {
    const pythonPath = store.get('pythonPath') || 'python3';
    exec(`${pythonPath} -m organize list`, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message, configs: [] });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
});

// Open URL in browser
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
  return true;
});

// Reveal file in file manager
ipcMain.handle('reveal-in-finder', async (event, filePath) => {
  shell.showItemInFolder(filePath);
  return true;
});

// Get platform info
ipcMain.handle('get-platform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: process.version
  };
});

// Recent files management
ipcMain.handle('add-recent-file', (event, filePath) => {
  const recentConfigs = store.get('recentConfigs') || [];
  const maxRecent = store.get('maxRecentFiles') || 10;
  
  // Remove if already exists
  const filtered = recentConfigs.filter(f => f !== filePath);
  
  // Add to beginning
  filtered.unshift(filePath);
  
  // Keep only maxRecent items
  const updated = filtered.slice(0, maxRecent);
  
  store.set('recentConfigs', updated);
  return updated;
});

ipcMain.handle('get-recent-files', () => {
  return store.get('recentConfigs') || [];
});

ipcMain.handle('clear-recent-files', () => {
  store.set('recentConfigs', []);
  return [];
});

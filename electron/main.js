const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn, exec } = require('child_process');
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const os = require('os');

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
    autoHideMenuBar: true
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startUrl);

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

// Helper to send output to renderer
function sendOutput(message) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('organize-output', message);
  }
}

function sendError(message) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('organize-error', message);
  }
}

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
  return os.homedir();
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

    const workingDir = options.workingDir || os.homedir();
    
    // Log the command being executed
    sendOutput(`[DEBUG] Python path: ${pythonPath}\n`);
    sendOutput(`[DEBUG] Arguments: ${args.join(' ')}\n`);
    sendOutput(`[DEBUG] Working directory: ${workingDir}\n`);
    sendOutput(`[DEBUG] Full command: ${pythonPath} ${args.join(' ')}\n\n`);

    try {
      const childProcess = spawn(pythonPath, args, {
        cwd: workingDir,
        shell: true,  // Use shell to handle path resolution
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        sendOutput(text);
      });

      childProcess.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        sendError(text);
      });

      childProcess.on('close', (code) => {
        sendOutput(`\n[DEBUG] Process exited with code: ${code}\n`);
        resolve({ code: code || 0, stdout, stderr });
      });

      childProcess.on('error', (error) => {
        const errorMsg = `[ERROR] Failed to start process: ${error.message}\n`;
        sendError(errorMsg);
        sendError(`[ERROR] Make sure Python is installed and '${pythonPath}' is accessible.\n`);
        sendError(`[ERROR] You can configure the Python path in Settings.\n`);
        resolve({ code: -1, stdout, stderr: errorMsg + stderr });
      });
    } catch (error) {
      const errorMsg = `[ERROR] Exception spawning process: ${error.message}\n`;
      sendError(errorMsg);
      resolve({ code: -1, stdout: '', stderr: errorMsg });
    }
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

    const workingDir = options.workingDir || os.homedir();

    // Log the command being executed
    sendOutput(`[DEBUG] Python path: ${pythonPath}\n`);
    sendOutput(`[DEBUG] Arguments: ${args.join(' ')}\n`);
    sendOutput(`[DEBUG] Working directory: ${workingDir}\n`);
    sendOutput(`[DEBUG] Full command: ${pythonPath} ${args.join(' ')}\n`);
    sendOutput(`[DEBUG] Config content length: ${configContent.length} bytes\n\n`);
    sendOutput(`[DEBUG] Config preview:\n${configContent.substring(0, 500)}${configContent.length > 500 ? '...' : ''}\n\n`);

    try {
      const childProcess = spawn(pythonPath, args, {
        cwd: workingDir,
        shell: true,  // Use shell to handle path resolution
        env: { ...process.env, PYTHONUNBUFFERED: '1' }
      });

      let stdout = '';
      let stderr = '';

      // Handle stdin
      if (childProcess.stdin) {
        childProcess.stdin.on('error', (error) => {
          sendError(`[ERROR] stdin error: ${error.message}\n`);
        });
        
        try {
          childProcess.stdin.write(configContent);
          childProcess.stdin.end();
        } catch (error) {
          sendError(`[ERROR] Failed to write to stdin: ${error.message}\n`);
        }
      } else {
        sendError(`[ERROR] No stdin available\n`);
      }

      childProcess.stdout.on('data', (data) => {
        const text = data.toString();
        stdout += text;
        sendOutput(text);
      });

      childProcess.stderr.on('data', (data) => {
        const text = data.toString();
        stderr += text;
        sendError(text);
      });

      childProcess.on('close', (code) => {
        sendOutput(`\n[DEBUG] Process exited with code: ${code}\n`);
        resolve({ code: code || 0, stdout, stderr });
      });

      childProcess.on('error', (error) => {
        const errorMsg = `[ERROR] Failed to start process: ${error.message}\n`;
        sendError(errorMsg);
        sendError(`[ERROR] Make sure Python is installed and '${pythonPath}' is accessible.\n`);
        sendError(`[ERROR] You can configure the Python path in Settings.\n`);
        sendError(`[ERROR] Try running: ${pythonPath} --version\n`);
        resolve({ code: -1, stdout, stderr: errorMsg + stderr });
      });
    } catch (error) {
      const errorMsg = `[ERROR] Exception spawning process: ${error.message}\n`;
      sendError(errorMsg);
      resolve({ code: -1, stdout: '', stderr: errorMsg });
    }
  });
});

// Check organize installation
ipcMain.handle('check-organize-installed', async () => {
  return new Promise((resolve) => {
    const pythonPath = store.get('pythonPath') || 'python3';
    
    // First check if python exists
    exec(`${pythonPath} --version`, (pyError, pyStdout, pyStderr) => {
      if (pyError) {
        resolve({ 
          installed: false, 
          error: `Python not found at '${pythonPath}'. Error: ${pyError.message}` 
        });
        return;
      }
      
      // Then check if organize is installed
      exec(`${pythonPath} -m organize --version`, (error, stdout, stderr) => {
        if (error) {
          resolve({ 
            installed: false, 
            error: `organize not installed. Run: ${pythonPath} -m pip install organize-tool` 
          });
        } else {
          resolve({ installed: true, version: stdout.trim() });
        }
      });
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
  
  const filtered = recentConfigs.filter(f => f !== filePath);
  filtered.unshift(filePath);
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

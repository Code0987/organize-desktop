import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Settings, OrganizeConfig, Rule, OrganizeInstallStatus, PlatformInfo } from '../types';
import { yamlToConfig, configToYaml, getDefaultConfig, createEmptyRule } from '../utils/yaml';

interface AppContextType {
  // Settings
  settings: Settings | null;
  updateSettings: (key: string, value: any) => Promise<void>;
  
  // Config state
  config: OrganizeConfig;
  setConfig: (config: OrganizeConfig) => void;
  yamlContent: string;
  setYamlContent: (content: string) => void;
  
  // File state
  currentFilePath: string | null;
  setCurrentFilePath: (path: string | null) => void;
  isModified: boolean;
  setIsModified: (modified: boolean) => void;
  
  // Rule operations
  addRule: () => void;
  updateRule: (ruleId: string, rule: Rule) => void;
  deleteRule: (ruleId: string) => void;
  moveRule: (fromIndex: number, toIndex: number) => void;
  duplicateRule: (ruleId: string) => void;
  
  // File operations
  newConfig: () => void;
  openConfig: () => Promise<void>;
  saveConfig: () => Promise<boolean>;
  saveConfigAs: () => Promise<boolean>;
  loadConfig: (filePath: string) => Promise<void>;
  
  // Organize status
  organizeStatus: OrganizeInstallStatus | null;
  checkOrganizeStatus: () => Promise<void>;
  
  // Platform
  platform: PlatformInfo | null;
  
  // View mode
  viewMode: 'visual' | 'yaml';
  setViewMode: (mode: 'visual' | 'yaml') => void;
  
  // Selected rule
  selectedRuleId: string | null;
  setSelectedRuleId: (id: string | null) => void;
  
  // Output
  output: string[];
  addOutput: (line: string) => void;
  clearOutput: () => void;
  
  // Running state
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [config, setConfig] = useState<OrganizeConfig>({ rules: [] });
  const [yamlContent, setYamlContent] = useState(getDefaultConfig());
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [organizeStatus, setOrganizeStatus] = useState<OrganizeInstallStatus | null>(null);
  const [platform, setPlatform] = useState<PlatformInfo | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'yaml'>('visual');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize settings and check organize status
  useEffect(() => {
    const init = async () => {
      try {
        const loadedSettings = await window.electronAPI.getSettings();
        setSettings(loadedSettings);
        
        const platformInfo = await window.electronAPI.getPlatform();
        setPlatform(platformInfo);
        
        await checkOrganizeStatus();
        
        // Parse default config
        const defaultConfig = yamlToConfig(getDefaultConfig());
        setConfig(defaultConfig);
        if (defaultConfig.rules.length > 0) {
          setSelectedRuleId(defaultConfig.rules[0].id);
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };
    
    init();
  }, []);

  // Setup output listeners
  useEffect(() => {
    window.electronAPI.onOrganizeOutput((data) => {
      setOutput(prev => [...prev, data]);
    });
    
    window.electronAPI.onOrganizeError((data) => {
      setOutput(prev => [...prev, `[ERROR] ${data}`]);
    });
    
    return () => {
      window.electronAPI.removeOrganizeListeners();
    };
  }, []);

  const updateSettings = async (key: string, value: any) => {
    await window.electronAPI.setSetting(key, value);
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
  };

  const checkOrganizeStatus = async () => {
    try {
      const status = await window.electronAPI.checkOrganizeInstalled();
      setOrganizeStatus(status);
    } catch (error) {
      setOrganizeStatus({ installed: false, error: 'Failed to check' });
    }
  };

  const addRule = useCallback(() => {
    const newRule = createEmptyRule();
    setConfig(prev => ({
      ...prev,
      rules: [...prev.rules, newRule]
    }));
    setSelectedRuleId(newRule.id);
    setIsModified(true);
  }, []);

  const updateRule = useCallback((ruleId: string, updatedRule: Rule) => {
    setConfig(prev => ({
      ...prev,
      rules: prev.rules.map(r => r.id === ruleId ? updatedRule : r)
    }));
    setIsModified(true);
  }, []);

  const deleteRule = useCallback((ruleId: string) => {
    setConfig(prev => {
      const newRules = prev.rules.filter(r => r.id !== ruleId);
      // Select another rule if the deleted one was selected
      if (selectedRuleId === ruleId && newRules.length > 0) {
        setSelectedRuleId(newRules[0].id);
      } else if (newRules.length === 0) {
        setSelectedRuleId(null);
      }
      return { ...prev, rules: newRules };
    });
    setIsModified(true);
  }, [selectedRuleId]);

  const moveRule = useCallback((fromIndex: number, toIndex: number) => {
    setConfig(prev => {
      const newRules = [...prev.rules];
      const [removed] = newRules.splice(fromIndex, 1);
      newRules.splice(toIndex, 0, removed);
      return { ...prev, rules: newRules };
    });
    setIsModified(true);
  }, []);

  const duplicateRule = useCallback((ruleId: string) => {
    setConfig(prev => {
      const ruleIndex = prev.rules.findIndex(r => r.id === ruleId);
      if (ruleIndex === -1) return prev;
      
      const ruleToCopy = prev.rules[ruleIndex];
      const newRule: Rule = {
        ...JSON.parse(JSON.stringify(ruleToCopy)),
        id: crypto.randomUUID(),
        name: `${ruleToCopy.name || 'Rule'} (copy)`
      };
      
      const newRules = [...prev.rules];
      newRules.splice(ruleIndex + 1, 0, newRule);
      
      return { ...prev, rules: newRules };
    });
    setIsModified(true);
  }, []);

  const newConfig = useCallback(() => {
    const defaultYaml = getDefaultConfig();
    setYamlContent(defaultYaml);
    const newConfig = yamlToConfig(defaultYaml);
    setConfig(newConfig);
    setCurrentFilePath(null);
    setIsModified(false);
    if (newConfig.rules.length > 0) {
      setSelectedRuleId(newConfig.rules[0].id);
    } else {
      setSelectedRuleId(null);
    }
  }, []);

  const openConfig = useCallback(async () => {
    try {
      const result = await window.electronAPI.openFileDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        await loadConfig(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Failed to open config:', error);
    }
  }, []);

  const loadConfig = useCallback(async (filePath: string) => {
    try {
      const result = await window.electronAPI.readFile(filePath);
      if (result.success && result.content) {
        setYamlContent(result.content);
        const parsedConfig = yamlToConfig(result.content);
        setConfig(parsedConfig);
        setCurrentFilePath(filePath);
        setIsModified(false);
        await window.electronAPI.addRecentFile(filePath);
        
        if (parsedConfig.rules.length > 0) {
          setSelectedRuleId(parsedConfig.rules[0].id);
        } else {
          setSelectedRuleId(null);
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }, []);

  const saveConfig = useCallback(async (): Promise<boolean> => {
    if (!currentFilePath) {
      return saveConfigAs();
    }
    
    try {
      // Convert config to YAML if in visual mode
      const contentToSave = viewMode === 'visual' ? configToYaml(config) : yamlContent;
      const result = await window.electronAPI.writeFile(currentFilePath, contentToSave);
      if (result.success) {
        setIsModified(false);
        setYamlContent(contentToSave);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    }
  }, [currentFilePath, config, yamlContent, viewMode]);

  const saveConfigAs = useCallback(async (): Promise<boolean> => {
    try {
      const result = await window.electronAPI.saveFileDialog({
        defaultPath: currentFilePath || 'config.yaml'
      });
      
      if (!result.canceled && result.filePath) {
        const contentToSave = viewMode === 'visual' ? configToYaml(config) : yamlContent;
        const writeResult = await window.electronAPI.writeFile(result.filePath, contentToSave);
        if (writeResult.success) {
          setCurrentFilePath(result.filePath);
          setIsModified(false);
          setYamlContent(contentToSave);
          await window.electronAPI.addRecentFile(result.filePath);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to save config:', error);
      return false;
    }
  }, [currentFilePath, config, yamlContent, viewMode]);

  const addOutput = useCallback((line: string) => {
    setOutput(prev => [...prev, line]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput([]);
  }, []);

  // Sync YAML content with config when switching views
  useEffect(() => {
    if (viewMode === 'yaml') {
      setYamlContent(configToYaml(config));
    }
  }, [viewMode, config]);

  const value: AppContextType = {
    settings,
    updateSettings,
    config,
    setConfig,
    yamlContent,
    setYamlContent,
    currentFilePath,
    setCurrentFilePath,
    isModified,
    setIsModified,
    addRule,
    updateRule,
    deleteRule,
    moveRule,
    duplicateRule,
    newConfig,
    openConfig,
    saveConfig,
    saveConfigAs,
    loadConfig,
    organizeStatus,
    checkOrganizeStatus,
    platform,
    viewMode,
    setViewMode,
    selectedRuleId,
    setSelectedRuleId,
    output,
    addOutput,
    clearOutput,
    isRunning,
    setIsRunning
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

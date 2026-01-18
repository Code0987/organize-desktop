import { FilterDefinition, ActionDefinition } from '../types';

export const filterDefinitions: FilterDefinition[] = [
  {
    name: 'created',
    label: 'Created Date',
    description: 'Filter by file/folder creation date',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { name: 'days', label: 'Days', type: 'number', description: 'Number of days' },
      { name: 'hours', label: 'Hours', type: 'number', description: 'Number of hours' },
      { name: 'minutes', label: 'Minutes', type: 'number', description: 'Number of minutes' },
      { name: 'seconds', label: 'Seconds', type: 'number', description: 'Number of seconds' },
      { 
        name: 'mode', 
        label: 'Mode', 
        type: 'select', 
        default: 'older',
        options: [
          { value: 'older', label: 'Older than' },
          { value: 'newer', label: 'Newer than' }
        ]
      }
    ]
  },
  {
    name: 'date_added',
    label: 'Date Added (macOS)',
    description: 'Filter by date the file was added to a folder (macOS only)',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { name: 'days', label: 'Days', type: 'number' },
      { name: 'hours', label: 'Hours', type: 'number' },
      { name: 'minutes', label: 'Minutes', type: 'number' },
      { name: 'seconds', label: 'Seconds', type: 'number' },
      { 
        name: 'mode', 
        label: 'Mode', 
        type: 'select', 
        default: 'older',
        options: [
          { value: 'older', label: 'Older than' },
          { value: 'newer', label: 'Newer than' }
        ]
      }
    ]
  },
  {
    name: 'date_lastused',
    label: 'Date Last Used (macOS)',
    description: 'Filter by last used date (macOS only)',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { name: 'days', label: 'Days', type: 'number' },
      { name: 'hours', label: 'Hours', type: 'number' },
      { name: 'minutes', label: 'Minutes', type: 'number' },
      { name: 'seconds', label: 'Seconds', type: 'number' },
      { 
        name: 'mode', 
        label: 'Mode', 
        type: 'select', 
        default: 'older',
        options: [
          { value: 'older', label: 'Older than' },
          { value: 'newer', label: 'Newer than' }
        ]
      }
    ]
  },
  {
    name: 'duplicate',
    label: 'Duplicate',
    description: 'Match duplicate files',
    supportsFiles: true,
    supportsDirs: false,
    properties: [
      { 
        name: 'detect_original_by', 
        label: 'Detect Original By', 
        type: 'select',
        default: 'first_seen',
        options: [
          { value: 'first_seen', label: 'First Seen' },
          { value: 'name', label: 'Name' },
          { value: 'created', label: 'Created Date' },
          { value: 'lastmodified', label: 'Last Modified' }
        ]
      }
    ]
  },
  {
    name: 'empty',
    label: 'Empty',
    description: 'Match empty files or folders',
    supportsFiles: true,
    supportsDirs: true,
    properties: []
  },
  {
    name: 'exif',
    label: 'EXIF Data',
    description: 'Filter by EXIF metadata of images',
    supportsFiles: true,
    supportsDirs: false,
    properties: [
      { 
        name: 'tags', 
        label: 'Required Tags', 
        type: 'string', 
        placeholder: 'e.g., image.model, gps.gpsdate',
        description: 'EXIF tag to require or filter by. Leave empty to match any file with EXIF data.' 
      }
    ]
  },
  {
    name: 'extension',
    label: 'Extension',
    description: 'Filter by file extension',
    supportsFiles: true,
    supportsDirs: false,
    properties: [
      { 
        name: 'extensions', 
        label: 'Extensions', 
        type: 'string[]', 
        placeholder: 'e.g., pdf, jpg, png',
        description: 'File extensions to match (without dot). Leave empty to match all extensions.'
      }
    ]
  },
  {
    name: 'filecontent',
    label: 'File Content',
    description: 'Filter by text content of files (PDF, DOCX, etc.)',
    supportsFiles: true,
    supportsDirs: false,
    properties: [
      { 
        name: 'pattern', 
        label: 'Pattern', 
        type: 'string', 
        placeholder: 'e.g., Invoice.*Customer (?P<customer>\\w+)',
        description: 'Regex pattern to match in file content'
      }
    ]
  },
  {
    name: 'hash',
    label: 'Hash',
    description: 'Calculate file hash',
    supportsFiles: true,
    supportsDirs: false,
    properties: [
      { 
        name: 'algorithm', 
        label: 'Algorithm', 
        type: 'select',
        default: 'md5',
        options: [
          { value: 'md5', label: 'MD5' },
          { value: 'sha1', label: 'SHA-1' },
          { value: 'sha256', label: 'SHA-256' },
          { value: 'sha512', label: 'SHA-512' }
        ]
      }
    ]
  },
  {
    name: 'lastmodified',
    label: 'Last Modified',
    description: 'Filter by last modification date',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { name: 'days', label: 'Days', type: 'number' },
      { name: 'hours', label: 'Hours', type: 'number' },
      { name: 'minutes', label: 'Minutes', type: 'number' },
      { name: 'seconds', label: 'Seconds', type: 'number' },
      { 
        name: 'mode', 
        label: 'Mode', 
        type: 'select', 
        default: 'older',
        options: [
          { value: 'older', label: 'Older than' },
          { value: 'newer', label: 'Newer than' }
        ]
      }
    ]
  },
  {
    name: 'macos_tags',
    label: 'macOS Tags',
    description: 'Filter by macOS Finder tags',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'tags', 
        label: 'Tags', 
        type: 'string[]', 
        placeholder: 'e.g., Important (red), Work (*)',
        description: 'Tags to match. Use * for any color: "* (red)", or any name: "Invoice (*)"'
      }
    ]
  },
  {
    name: 'mimetype',
    label: 'MIME Type',
    description: 'Filter by MIME type',
    supportsFiles: true,
    supportsDirs: false,
    properties: [
      { 
        name: 'types', 
        label: 'MIME Types', 
        type: 'string[]', 
        placeholder: 'e.g., image, application/pdf',
        description: 'MIME types to match (e.g., "image", "application/pdf")'
      }
    ]
  },
  {
    name: 'name',
    label: 'Name',
    description: 'Filter by file/folder name',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'match', 
        label: 'Match Pattern', 
        type: 'string', 
        default: '*',
        placeholder: 'e.g., {year}-{month}-*',
        description: 'Simplematch pattern to match the name'
      },
      { 
        name: 'startswith', 
        label: 'Starts With', 
        type: 'string[]', 
        placeholder: 'e.g., Invoice, Order'
      },
      { 
        name: 'contains', 
        label: 'Contains', 
        type: 'string[]', 
        placeholder: 'e.g., important, urgent'
      },
      { 
        name: 'endswith', 
        label: 'Ends With', 
        type: 'string[]', 
        placeholder: 'e.g., _backup, _old'
      },
      { 
        name: 'case_sensitive', 
        label: 'Case Sensitive', 
        type: 'boolean', 
        default: true 
      }
    ]
  },
  {
    name: 'python',
    label: 'Python Code',
    description: 'Custom Python code filter',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'code', 
        label: 'Python Code', 
        type: 'code',
        placeholder: 'return {"result": path.stem[::-1]}',
        description: 'Python code that returns True/False or a dict with values'
      }
    ]
  },
  {
    name: 'regex',
    label: 'Regex',
    description: 'Match filename with regular expression',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'pattern', 
        label: 'Pattern', 
        type: 'string',
        required: true,
        placeholder: 'e.g., ^RG(?P<number>\\d{12})-sig\\.pdf$',
        description: 'Regular expression pattern to match'
      }
    ]
  },
  {
    name: 'size',
    label: 'Size',
    description: 'Filter by file or folder size',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'conditions', 
        label: 'Size Conditions', 
        type: 'string',
        placeholder: 'e.g., "> 1 MB, < 10 GB"',
        description: 'Size condition (e.g., "> 500 MB", "< 20k", ">= 1 GB, < 5 GB")'
      }
    ]
  }
];

export const actionDefinitions: ActionDefinition[] = [
  {
    name: 'confirm',
    label: 'Confirm',
    description: 'Ask for confirmation before continuing',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'msg', 
        label: 'Message', 
        type: 'string',
        default: 'Continue?',
        placeholder: 'Delete {name}?',
        description: 'Confirmation message to display'
      },
      { 
        name: 'default', 
        label: 'Default', 
        type: 'boolean', 
        default: true,
        description: 'Default answer if Enter is pressed'
      }
    ]
  },
  {
    name: 'copy',
    label: 'Copy',
    description: 'Copy file or folder to a new location',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'dest', 
        label: 'Destination', 
        type: 'string',
        required: true,
        placeholder: '~/Documents/{extension.upper()}/',
        description: 'Destination path (use trailing slash for folder)'
      },
      { 
        name: 'on_conflict', 
        label: 'On Conflict', 
        type: 'select',
        default: 'rename_new',
        options: [
          { value: 'skip', label: 'Skip' },
          { value: 'overwrite', label: 'Overwrite' },
          { value: 'trash', label: 'Move existing to Trash' },
          { value: 'rename_new', label: 'Rename new file' },
          { value: 'rename_existing', label: 'Rename existing file' }
        ]
      },
      { 
        name: 'rename_template', 
        label: 'Rename Template', 
        type: 'string',
        default: '{name} {counter}{extension}',
        description: 'Template for renaming on conflict'
      },
      { 
        name: 'autodetect_folder', 
        label: 'Auto-detect Folder', 
        type: 'boolean', 
        default: true 
      },
      { 
        name: 'continue_with', 
        label: 'Continue With', 
        type: 'select',
        default: 'copy',
        options: [
          { value: 'copy', label: 'Copied file' },
          { value: 'original', label: 'Original file' }
        ]
      }
    ]
  },
  {
    name: 'delete',
    label: 'Delete',
    description: 'Permanently delete file or folder',
    supportsFiles: true,
    supportsDirs: true,
    properties: []
  },
  {
    name: 'echo',
    label: 'Echo',
    description: 'Print a message to the output',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'msg', 
        label: 'Message', 
        type: 'string',
        required: true,
        placeholder: 'Found: {path}',
        description: 'Message to print (supports placeholders)'
      }
    ]
  },
  {
    name: 'hardlink',
    label: 'Hardlink',
    description: 'Create a hard link',
    supportsFiles: true,
    supportsDirs: false,
    properties: [
      { 
        name: 'dest', 
        label: 'Destination', 
        type: 'string',
        required: true,
        placeholder: '~/Links/{name}',
        description: 'Destination path for the hard link'
      },
      { 
        name: 'on_conflict', 
        label: 'On Conflict', 
        type: 'select',
        default: 'rename_new',
        options: [
          { value: 'skip', label: 'Skip' },
          { value: 'overwrite', label: 'Overwrite' },
          { value: 'trash', label: 'Move existing to Trash' },
          { value: 'rename_new', label: 'Rename new' },
          { value: 'rename_existing', label: 'Rename existing' }
        ]
      },
      { 
        name: 'rename_template', 
        label: 'Rename Template', 
        type: 'string',
        default: '{name} {counter}{extension}'
      },
      { 
        name: 'autodetect_folder', 
        label: 'Auto-detect Folder', 
        type: 'boolean', 
        default: true 
      }
    ]
  },
  {
    name: 'macos_tags',
    label: 'macOS Tags',
    description: 'Add macOS Finder tags',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'tags', 
        label: 'Tags', 
        type: 'string[]',
        required: true,
        placeholder: 'Important (red), Archive',
        description: 'Tags to add (optionally with color: red, orange, yellow, green, blue, purple, gray)'
      }
    ]
  },
  {
    name: 'move',
    label: 'Move',
    description: 'Move file or folder to a new location',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'dest', 
        label: 'Destination', 
        type: 'string',
        required: true,
        placeholder: '~/Documents/{extension.upper()}/',
        description: 'Destination path (use trailing slash for folder)'
      },
      { 
        name: 'on_conflict', 
        label: 'On Conflict', 
        type: 'select',
        default: 'rename_new',
        options: [
          { value: 'skip', label: 'Skip' },
          { value: 'overwrite', label: 'Overwrite' },
          { value: 'trash', label: 'Move existing to Trash' },
          { value: 'rename_new', label: 'Rename new file' },
          { value: 'rename_existing', label: 'Rename existing file' }
        ]
      },
      { 
        name: 'rename_template', 
        label: 'Rename Template', 
        type: 'string',
        default: '{name} {counter}{extension}',
        description: 'Template for renaming on conflict'
      },
      { 
        name: 'autodetect_folder', 
        label: 'Auto-detect Folder', 
        type: 'boolean', 
        default: true 
      }
    ]
  },
  {
    name: 'python',
    label: 'Python Code',
    description: 'Execute custom Python code',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'code', 
        label: 'Python Code', 
        type: 'code',
        required: true,
        placeholder: 'print("Processing:", path)',
        description: 'Python code to execute'
      },
      { 
        name: 'run_in_simulation', 
        label: 'Run in Simulation', 
        type: 'boolean',
        default: false,
        description: 'Whether to run this action during simulation'
      }
    ]
  },
  {
    name: 'rename',
    label: 'Rename',
    description: 'Rename file or folder',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'name', 
        label: 'New Name', 
        type: 'string',
        required: true,
        placeholder: '{name}.{extension.lower()}',
        description: 'New name for the file/folder (supports placeholders)'
      },
      { 
        name: 'on_conflict', 
        label: 'On Conflict', 
        type: 'select',
        default: 'rename_new',
        options: [
          { value: 'skip', label: 'Skip' },
          { value: 'overwrite', label: 'Overwrite' },
          { value: 'trash', label: 'Move existing to Trash' },
          { value: 'rename_new', label: 'Rename new' },
          { value: 'rename_existing', label: 'Rename existing' }
        ]
      },
      { 
        name: 'rename_template', 
        label: 'Rename Template', 
        type: 'string',
        default: '{name} {counter}{extension}'
      }
    ]
  },
  {
    name: 'shell',
    label: 'Shell Command',
    description: 'Execute a shell command',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'command', 
        label: 'Command', 
        type: 'string',
        required: true,
        placeholder: 'open "{path}"',
        description: 'Shell command to execute (supports placeholders)'
      },
      { 
        name: 'run_in_simulation', 
        label: 'Run in Simulation', 
        type: 'boolean',
        default: false,
        description: 'Whether to run this action during simulation'
      },
      { 
        name: 'ignore_errors', 
        label: 'Ignore Errors', 
        type: 'boolean',
        default: false,
        description: 'Continue even if the command fails'
      }
    ]
  },
  {
    name: 'symlink',
    label: 'Symlink',
    description: 'Create a symbolic link',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'dest', 
        label: 'Destination', 
        type: 'string',
        required: true,
        placeholder: '~/Links/{name}',
        description: 'Destination path for the symbolic link'
      },
      { 
        name: 'on_conflict', 
        label: 'On Conflict', 
        type: 'select',
        default: 'rename_new',
        options: [
          { value: 'skip', label: 'Skip' },
          { value: 'overwrite', label: 'Overwrite' },
          { value: 'trash', label: 'Move existing to Trash' },
          { value: 'rename_new', label: 'Rename new' },
          { value: 'rename_existing', label: 'Rename existing' }
        ]
      },
      { 
        name: 'rename_template', 
        label: 'Rename Template', 
        type: 'string',
        default: '{name} {counter}{extension}'
      },
      { 
        name: 'autodetect_folder', 
        label: 'Auto-detect Folder', 
        type: 'boolean', 
        default: true 
      }
    ]
  },
  {
    name: 'trash',
    label: 'Trash',
    description: 'Move file or folder to trash',
    supportsFiles: true,
    supportsDirs: true,
    properties: []
  },
  {
    name: 'write',
    label: 'Write',
    description: 'Write to a text file',
    supportsFiles: true,
    supportsDirs: true,
    properties: [
      { 
        name: 'outfile', 
        label: 'Output File', 
        type: 'string',
        required: true,
        placeholder: './results.txt',
        description: 'Path to the output file'
      },
      { 
        name: 'text', 
        label: 'Text', 
        type: 'string',
        required: true,
        placeholder: '{size.traditional} -- {relative_path}',
        description: 'Text to write (supports placeholders)'
      },
      { 
        name: 'mode', 
        label: 'Mode', 
        type: 'select',
        default: 'append',
        options: [
          { value: 'append', label: 'Append' },
          { value: 'prepend', label: 'Prepend' },
          { value: 'overwrite', label: 'Overwrite' }
        ]
      },
      { 
        name: 'newline', 
        label: 'Newline', 
        type: 'string',
        default: '\\n',
        description: 'Newline character to use'
      },
      { 
        name: 'clear_before_first_write', 
        label: 'Clear Before First Write', 
        type: 'boolean',
        default: false,
        description: 'Clear the file before the first write in a run'
      }
    ]
  }
];

export const getFilterDefinition = (type: string): FilterDefinition | undefined => {
  return filterDefinitions.find(f => f.name === type);
};

export const getActionDefinition = (type: string): ActionDefinition | undefined => {
  return actionDefinitions.find(a => a.name === type);
};

# Organize Desktop User Guide

## Overview

Organize Desktop is a graphical user interface for the powerful `organize` file management automation tool. It allows you to create, edit, run, and manage organize configurations through an intuitive visual or YAML-based editor.

## Interface Overview

### Main Navigation

The application consists of five main sections accessible from the left sidebar:

1. **Home** - Dashboard with quick actions and overview
2. **Visual Editor** - Drag-and-drop rule builder
3. **YAML Editor** - Direct configuration file editing
4. **Settings** - Application preferences
5. **Help & Docs** - Documentation and examples

### Toolbar

The top toolbar contains:

- **File operations**: New, Open, Save, Save As
- **Recent files**: Quick access to previously opened configs
- **organize status**: Shows if organize-tool is installed
- **Run controls**: Simulate and Run buttons

## Creating Rules

### Using the Visual Editor

The visual editor provides an intuitive interface for building rules without writing YAML.

#### Step 1: Add a New Rule

1. Navigate to **Visual Editor**
2. Click the **Add Rule** button
3. Enter a descriptive name for your rule

#### Step 2: Configure Locations

Locations specify where organize should look for files:

1. Expand the **Locations** section
2. Click **Add Location** or use the folder browser
3. Enable **Include subfolders** if needed

**Location Options:**
- Simple path: `~/Downloads`
- With depth: Configure min/max depth
- With exclusions: Exclude specific files/folders

#### Step 3: Add Filters

Filters determine which files the rule applies to:

1. Expand the **Filters** section
2. Click **Add Filter**
3. Choose a filter type from the gallery
4. Configure filter options

**Common Filters:**
- **Extension**: Match by file extension (pdf, jpg, etc.)
- **Size**: Match by file size ("> 1 MB", "< 500 KB")
- **Name**: Match by filename patterns
- **Created/Modified**: Match by date
- **Duplicate**: Find duplicate files

#### Step 4: Add Actions

Actions specify what to do with matched files:

1. Expand the **Actions** section
2. Click **Add Action**
3. Choose an action type
4. Configure action options

**Common Actions:**
- **Move**: Move files to a new location
- **Copy**: Copy files to a new location
- **Delete/Trash**: Remove files
- **Rename**: Rename files using templates
- **Echo**: Print messages (for testing)

### Using the YAML Editor

For users comfortable with YAML, the YAML Editor provides full control:

1. Navigate to **YAML Editor**
2. Write or paste your configuration
3. The editor validates syntax in real-time
4. Use Sync button to update from Visual Editor

**Basic YAML Structure:**
```yaml
rules:
  - name: "Rule Name"
    locations:
      - ~/Downloads
    filters:
      - extension: pdf
    actions:
      - move: ~/Documents/PDFs/
```

## Running Rules

### Simulation (Dry Run)

**Always simulate before running!**

1. Click the **Simulate** button in the toolbar
2. Review the output to see what would happen
3. No files are actually modified during simulation

### Running

1. Click the **Run** button in the toolbar
2. Organize executes your rules
3. Files are modified according to your actions
4. Check the output for results

### Using Tags

Tags allow selective rule execution:

1. Add tags to rules in the Visual Editor
2. Run with specific tags: `--tags=daily,cleanup`
3. Skip tags: `--skip-tags=dangerous`

**Special Tags:**
- `always`: Rule always runs
- `never`: Rule never runs (unless explicitly specified)

## Template Placeholders

Use placeholders in actions for dynamic values:

### Always Available
| Placeholder | Description |
|------------|-------------|
| `{path}` | Full file path |
| `{relative_path}` | Relative path from location |
| `{now()}` | Current datetime |
| `{today()}` | Current date |
| `{env.VAR}` | Environment variable |

### From Filters
| Placeholder | Source Filter | Description |
|------------|--------------|-------------|
| `{extension}` | extension | File extension |
| `{name}` | name | Filename (without extension) |
| `{size}` | size | File size info |
| `{created}` | created | Creation date |
| `{lastmodified}` | lastmodified | Modified date |
| `{regex.group}` | regex | Captured regex group |

### Formatting
Use Python methods on placeholders:
```yaml
# Uppercase extension
- move: "~/Files/{extension.upper()}/"

# Format date
- move: "~/Files/{created.strftime('%Y/%m')}/"

# Replace text
- rename: "{name.replace(' ', '_')}.{extension}"
```

## Filter Reference

### File Content Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `extension` | File extension | `extension: pdf` |
| `size` | File size | `size: "> 1 MB"` |
| `mimetype` | MIME type | `mimetype: image` |
| `filecontent` | Text content | `filecontent: Invoice` |
| `hash` | File hash | `hash` |

### Filename Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `name` | Filename matching | `name: startswith: Invoice` |
| `regex` | Regex pattern | `regex: '^RG\d+\.pdf$'` |

### Date Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `created` | Creation date | `created: days: 30` |
| `lastmodified` | Modified date | `lastmodified: hours: 24` |
| `date_added` | Added date (macOS) | `date_added: days: 7` |
| `date_lastused` | Last used (macOS) | `date_lastused: days: 14` |

### Special Filters

| Filter | Description |
|--------|-------------|
| `empty` | Empty files/folders |
| `duplicate` | Duplicate files |
| `exif` | Image EXIF data |
| `macos_tags` | Finder tags (macOS) |
| `python` | Custom Python code |

## Action Reference

### File Management

| Action | Description | Example |
|--------|-------------|---------|
| `move` | Move files | `move: ~/Archive/` |
| `copy` | Copy files | `copy: ~/Backup/` |
| `rename` | Rename files | `rename: "{name}_new.{extension}"` |
| `delete` | Permanently delete | `delete` |
| `trash` | Move to trash | `trash` |

### Link Creation

| Action | Description |
|--------|-------------|
| `symlink` | Create symbolic link |
| `hardlink` | Create hard link |

### Other Actions

| Action | Description | Example |
|--------|-------------|---------|
| `echo` | Print message | `echo: "Found: {path}"` |
| `confirm` | User confirmation | `confirm: "Delete?"` |
| `shell` | Shell command | `shell: 'open "{path}"'` |
| `python` | Python code | `python: print(path)` |
| `write` | Write to file | `write: outfile: log.txt` |
| `macos_tags` | Set tags (macOS) | `macos_tags: Important` |

## Configuration Management

### Saving Configurations

- **Ctrl+S / Cmd+S**: Save current config
- **Save As**: Save to a new location
- Configs are stored as YAML files

### Default Location

Configs are saved to platform-specific locations:
- **macOS**: `~/Library/Application Support/organize/`
- **Linux**: `~/.config/organize/`
- **Windows**: `%APPDATA%\organize\`

### Recent Files

Access recently opened configs from:
- The toolbar clock icon
- The Home page "Recent Files" section

## Settings

### Python Configuration

- **Python Path**: Path to Python executable
- Test connection to verify organize is installed

### Appearance

- **Theme**: Light, Dark, or System default
- **Font Size**: Editor font size

### Editor Settings

- **Auto-save**: Automatically save changes
- **Confirm dangerous actions**: Prompt before delete/run

## Troubleshooting

### organize not found

1. Ensure Python is installed
2. Install organize: `pip install organize-tool`
3. Check Python path in Settings
4. Click "Test Connection"

### Rules not matching files

1. Verify location paths are correct
2. Check filter conditions
3. Use Simulate to see what matches
4. Check the output for errors

### Permission errors

- Ensure you have read/write access to locations
- On macOS, grant Full Disk Access in System Preferences

### Getting more help

- Built-in Help page with examples
- Official docs: https://organize.readthedocs.io/
- GitHub issues: https://github.com/tfeldmann/organize/issues

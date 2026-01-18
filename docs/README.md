# Organize Desktop - User Documentation

Organize Desktop is a graphical user interface for the [organize](https://github.com/tfeldmann/organize) file management automation tool. It provides an intuitive way to create, edit, and run organize configurations without needing to manually edit YAML files.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
3. [Visual Editor](#visual-editor)
4. [YAML Editor](#yaml-editor)
5. [Running Rules](#running-rules)
6. [Filters Reference](#filters-reference)
7. [Actions Reference](#actions-reference)
8. [Placeholders](#placeholders)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- **Node.js 18+** - Required for running the Electron app
- **Python 3.9+** - Required for the organize CLI tool
- **organize-tool** - The Python package that powers file organization

### Install organize-tool

```bash
pip install organize-tool
```

### Running Organize Desktop

#### From Source

```bash
# Clone the repository
git clone <repository-url>
cd organize-desktop

# Install dependencies
npm install

# Start the app
npm start
```

#### Pre-built Binaries

Download the appropriate installer for your operating system:

- **Windows**: `Organize-Desktop-Setup.exe`
- **macOS**: `Organize-Desktop.dmg`
- **Linux**: `Organize-Desktop.AppImage`

## Getting Started

### Creating Your First Rule

1. Launch Organize Desktop
2. Click **"Visual Editor"** in the sidebar
3. Click **"Add Rule"** to create a new rule
4. Configure the rule:
   - **Locations**: Add folders to search
   - **Filters**: Add conditions to match files
   - **Actions**: Add what to do with matched files

### Simulating vs Running

Always **simulate** your rules before running them:

- **Simulate**: Shows what would happen without modifying files
- **Run**: Actually executes the actions on your files

## Visual Editor

The Visual Editor provides a drag-and-drop interface for building rules.

### Rule Components

#### Locations

Locations define where organize looks for files:

- Click the **folder icon** to browse for a folder
- Enable **"Include subfolders"** to search recursively
- Add multiple locations to search in several places

#### Filters

Filters determine which files match the rule:

- Click **"Add Filter"** to add a new filter
- Configure filter options by clicking the edit icon
- Use the **NOT** toggle to negate a filter

#### Actions

Actions define what happens to matched files:

- Click **"Add Action"** to add a new action
- Actions execute in order from top to bottom
- Use placeholders like `{path}`, `{extension}` in action parameters

### Rule Options

- **Name**: A descriptive name for the rule
- **Targets**: Files or Directories
- **Filter Mode**: ALL (AND), ANY (OR), or NONE
- **Tags**: For selective running with `--tags`

## YAML Editor

The YAML Editor provides direct access to the configuration file.

### Features

- Syntax highlighting
- Real-time validation
- Auto-completion
- Sync with Visual Editor

### Basic Structure

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

### From the App

- Click **"Simulate"** to preview changes
- Click **"Run"** to execute the rules
- Output appears in real-time in the output panel

### Command Line Options

The app uses the organize CLI internally:

```bash
organize sim [config]  # Simulate
organize run [config]  # Execute
```

### Tags

Use tags to run specific rules:

```yaml
rules:
  - name: "Daily cleanup"
    tags:
      - daily
    # ...
```

Run with tags: `organize run --tags=daily`

## Filters Reference

### File Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `extension` | Match by file extension | `extension: pdf` |
| `size` | Match by file size | `size: "> 1 MB"` |
| `name` | Match by filename | `name: startswith: Invoice` |
| `regex` | Match with regex | `regex: '^RG\d{12}'` |
| `mimetype` | Match by MIME type | `mimetype: image` |
| `filecontent` | Match by content | `filecontent: 'Invoice'` |

### Date Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `created` | Creation date | `created: days: 30` |
| `lastmodified` | Modified date | `lastmodified: hours: 24` |
| `date_added` | Added date (macOS) | `date_added: days: 7` |

### Other Filters

| Filter | Description |
|--------|-------------|
| `empty` | Empty files/folders |
| `duplicate` | Duplicate files |
| `exif` | EXIF metadata |
| `hash` | File hash |
| `macos_tags` | macOS Finder tags |
| `python` | Custom Python code |

## Actions Reference

### File Actions

| Action | Description | Example |
|--------|-------------|---------|
| `move` | Move file | `move: ~/Archive/` |
| `copy` | Copy file | `copy: ~/Backup/` |
| `rename` | Rename file | `rename: "{name}_backup.{extension}"` |
| `delete` | Permanently delete | `delete` |
| `trash` | Move to trash | `trash` |

### Link Actions

| Action | Description |
|--------|-------------|
| `symlink` | Create symbolic link |
| `hardlink` | Create hard link |

### Other Actions

| Action | Description | Example |
|--------|-------------|---------|
| `echo` | Print message | `echo: "Found: {path}"` |
| `confirm` | Ask confirmation | `confirm: "Delete?"` |
| `write` | Write to file | `write: outfile: log.txt` |
| `shell` | Run shell command | `shell: 'open "{path}"'` |
| `python` | Run Python code | `python: print(path)` |
| `macos_tags` | Set macOS tags | `macos_tags: Important` |

## Placeholders

### Always Available

| Placeholder | Description |
|------------|-------------|
| `{path}` | Full file path |
| `{relative_path}` | Relative path |
| `{now()}` | Current datetime |
| `{today()}` | Current date |
| `{env.VAR}` | Environment variable |

### From Filters

Each filter provides its own placeholders:

| Filter | Placeholder | Example |
|--------|------------|---------|
| `extension` | `{extension}` | `pdf` |
| `name` | `{name}` | `document` |
| `size` | `{size.traditional}` | `1.5 MB` |
| `created` | `{created}` | datetime object |
| `regex` | `{regex.group}` | captured value |

### Python Methods

Use Python methods on placeholders:

```yaml
- move: "~/Documents/{extension.upper()}/"
- rename: "{created.strftime('%Y-%m-%d')}_{name}.{extension}"
```

## Configuration

### Settings

Access settings via **Settings** in the sidebar:

- **Python Path**: Path to Python executable
- **Theme**: Light, Dark, or System
- **Font Size**: Editor font size
- **Auto-save**: Automatically save changes

### Config Location

Default config locations:

- **macOS**: `~/Library/Application Support/organize/config.yaml`
- **Linux**: `~/.config/organize/config.yaml`
- **Windows**: `%APPDATA%\organize\config.yaml`

## Troubleshooting

### organize not found

Make sure you have installed organize-tool:

```bash
pip install organize-tool
```

Check the Python path in Settings.

### Permission Errors

Make sure you have read/write permissions for the locations you're organizing.

### Files Not Matching

1. Check your filter conditions
2. Use "Simulate" to see matching files
3. Check the output for errors

### Getting Help

- Check the [organize documentation](https://organize.readthedocs.io/)
- Report issues on [GitHub](https://github.com/tfeldmann/organize/issues)

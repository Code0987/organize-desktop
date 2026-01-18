# Organize Desktop

<p align="center">
  <img src="assets/screenshot.png" alt="Organize Desktop Screenshot" width="800" />
</p>

A modern, cross-platform desktop application for the [organize](https://github.com/tfeldmann/organize) file management automation tool. Build powerful file organization rules with an intuitive visual editor or direct YAML editing.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)]()

## Features

### 🎨 Visual Rule Editor
- Drag-and-drop interface for building rules
- Intuitive filter and action configuration
- Real-time validation and preview

### 📝 YAML Editor
- Full Monaco editor with syntax highlighting
- Auto-completion and error detection
- Seamless sync with visual editor

### 🚀 Run & Simulate
- Simulate rules before execution (dry run)
- Real-time output display
- Tag-based rule selection

### ⚙️ Full organize Features
- 16 filters: extension, size, name, regex, duplicate, exif, and more
- 13 actions: move, copy, delete, trash, rename, shell, python, and more
- Template placeholders for dynamic paths
- Recursive folder scanning

### 🎯 Cross-Platform
- Windows, macOS, and Linux support
- Native look and feel
- Dark/Light theme modes

## Installation

### Prerequisites

1. **Python 3.9 or higher**
   
   Download from [python.org](https://python.org) or use your package manager.

2. **organize-tool**
   
   ```bash
   pip install organize-tool
   ```

### Option 1: Download Pre-built Binaries

Download the latest release for your platform:

- **Windows**: `Organize-Desktop-Setup-x.x.x.exe`
- **macOS**: `Organize-Desktop-x.x.x.dmg`
- **Linux**: `Organize-Desktop-x.x.x.AppImage`

### Option 2: Run from Source

```bash
# Clone the repository
git clone <repository-url>
cd organize-desktop

# Install dependencies
npm install

# Start the application
npm start
```

### Building from Source

```bash
# Build for your current platform
npm run build:electron

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

## Quick Start

### 1. Install organize-tool

```bash
pip install organize-tool
```

### 2. Launch Organize Desktop

Start the app and go to Settings to verify organize is detected.

### 3. Create Your First Rule

1. Go to **Visual Editor**
2. Click **Add Rule**
3. Add a location (e.g., `~/Downloads`)
4. Add a filter (e.g., `extension: pdf`)
5. Add an action (e.g., `move: ~/Documents/PDFs/`)

### 4. Simulate and Run

1. Click **Simulate** to preview changes
2. Review the output
3. Click **Run** to execute

## Usage

### Visual Editor

The visual editor provides an intuitive interface for building rules:

- **Rules Panel**: List of all rules with quick status
- **Rule Editor**: Configure locations, filters, and actions
- **Accordion Sections**: Organized by component type

### YAML Editor

For advanced users who prefer direct YAML editing:

- Full Monaco editor with YAML support
- Real-time validation
- Sync button to update from visual editor

### Configuration

Settings available:

- **Python Path**: Path to Python executable
- **Theme**: Light / Dark / System
- **Font Size**: Editor font size
- **Auto-save**: Automatically save changes

## Example Rules

### Sort Downloads by Extension

```yaml
rules:
  - name: "Sort by extension"
    locations: ~/Downloads
    filters:
      - extension
    actions:
      - move: "~/Downloads/{extension.upper()}/"
```

### Clean Old Files

```yaml
rules:
  - name: "Archive old files"
    locations: ~/Downloads
    filters:
      - lastmodified:
          days: 30
    actions:
      - move: ~/Archive/
```

### Find Duplicates

```yaml
rules:
  - name: "Remove duplicates"
    locations:
      - ~/Downloads
      - ~/Documents
    subfolders: true
    filters:
      - duplicate
    actions:
      - trash
```

### Organize Photos

```yaml
rules:
  - name: "Sort photos by date"
    locations: ~/Pictures
    subfolders: true
    filters:
      - extension:
          - jpg
          - png
      - created
    actions:
      - move: "~/Pictures/{created.strftime('%Y/%m')}/"
```

## Project Structure

```
organize-desktop/
├── electron/          # Electron main process
│   ├── main.js        # Main entry point
│   └── preload.js     # Preload script for IPC
├── public/            # Static assets
├── src/               # React application
│   ├── components/    # Reusable components
│   ├── context/       # React context providers
│   ├── pages/         # Page components
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── docs/              # Documentation
└── assets/            # Build assets (icons)
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
npm install
```

### Development Mode

```bash
npm start
```

This starts both the React development server and Electron.

### Building

```bash
# Build React app
npm run build

# Build Electron distributables
npm run build:electron
```

### Testing

```bash
npm test
```

## Technologies

- **Electron**: Cross-platform desktop framework
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Material UI**: Component library
- **Monaco Editor**: Code editing
- **js-yaml**: YAML parsing

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [organize](https://github.com/tfeldmann/organize) by Thomas Feldmann - The amazing CLI tool this app is built upon
- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Material UI](https://mui.com/)

## Support

- **Documentation**: See the [docs](docs/) folder
- **Issues**: Report bugs on GitHub
- **organize docs**: https://organize.readthedocs.io/

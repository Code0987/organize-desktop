# Quick Start Guide

Welcome to Organize Desktop! This guide will help you get started in minutes.

## Step 1: Install organize-tool

First, install the Python organize-tool package:

```bash
pip install organize-tool
```

Verify the installation:

```bash
organize --version
```

## Step 2: Launch Organize Desktop

Start the application and check that organize is detected:

1. Open Organize Desktop
2. Look for the green "organize vX.X.X" badge in the top right
3. If not detected, go to Settings and configure the Python path

## Step 3: Create Your First Rule

### Using the Visual Editor

1. Click **"Visual Editor"** in the sidebar
2. Click **"Add Rule"** button
3. Give your rule a name (e.g., "Sort PDFs")
4. Add a location:
   - Click **"Add Location"**
   - Browse to `~/Downloads`
5. Add a filter:
   - Click **"Add Filter"**
   - Select **"Extension"**
   - Enter `pdf`
6. Add an action:
   - Click **"Add Action"**
   - Select **"Move"**
   - Enter destination: `~/Documents/PDFs/`

### Using the YAML Editor

Go to **"YAML Editor"** and enter:

```yaml
rules:
  - name: "Sort PDFs"
    locations: ~/Downloads
    filters:
      - extension: pdf
    actions:
      - move: ~/Documents/PDFs/
```

## Step 4: Simulate

Before running your rules on real files:

1. Click the **"Simulate"** button in the toolbar
2. Review the output to see what would happen
3. Check that files would be moved correctly

## Step 5: Run

Once you're satisfied with the simulation:

1. Click the **"Run"** button
2. Watch the output as files are organized
3. Check your destination folder

## Step 6: Save Your Configuration

- Press `Ctrl+S` / `Cmd+S` to save
- Use **"Save As"** to create different configurations
- Recent files are accessible from the toolbar

## Common Rules

### Sort by File Type

```yaml
rules:
  - name: "Sort by type"
    locations: ~/Downloads
    filters:
      - extension
    actions:
      - move: "~/Downloads/{extension.upper()}/"
```

### Delete Old Files

```yaml
rules:
  - name: "Clean old downloads"
    locations: ~/Downloads
    filters:
      - lastmodified:
          days: 30
    actions:
      - trash
```

### Remove Duplicates

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

## Tips

1. **Always simulate first** - This prevents accidental file operations
2. **Start simple** - Begin with basic rules and add complexity
3. **Use descriptive names** - Makes rules easier to manage
4. **Check subfolders** - Enable if you want recursive processing
5. **Use tags** - Run specific groups of rules

## Getting Help

- **In-app help**: Click "Help & Docs" in the sidebar
- **Documentation**: https://organize.readthedocs.io/
- **Issues**: Report problems on GitHub

Happy organizing! 📁✨

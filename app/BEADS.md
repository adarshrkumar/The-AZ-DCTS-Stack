# Beads Integration Guide

## What is Beads?

Beads is a distributed, git-backed graph issue tracker designed specifically for AI coding agents. It provides persistent, structured memory for managing long-horizon tasks without losing context.

## Key Features

- **Git-backed storage**: Issues stored as JSONL files in `.beads/` directory
- **Dependency tracking**: Hierarchical task IDs (e.g., `bd-a3f8.1`) support epic-to-subtask relationships
- **Collision prevention**: Hash-based IDs prevent merge conflicts in multi-agent workflows
- **Local caching**: SQLite databases provide speed without sacrificing distributed functionality
- **Memory decay**: Automatic compaction summarizes completed tasks to preserve token efficiency

## Installation

Beads is already included in the `devDependencies` of this project. To install all dependencies:

```bash
npm install
```

## Initialization

### Standard Initialization

For projects that will commit Beads data to the repository:

```bash
npm run beads:init
```

Or from the root directory:

```bash
npm run beads:init
```

This creates a `.beads/` directory that will be tracked by git.

### Stealth Mode

For privacy-conscious development where you don't want to commit Beads files:

```bash
npm run beads:init:stealth
```

This enables local-only operation without committing files to the main repository.

## Configuration

The default Beads configuration is located at `app/.beadsconfig.json`. This file includes:

- **Default labels**: Pre-configured labels for organizing tasks (bug, feature, enhancement, etc.)
- **Priority levels**: Task prioritization system (critical, high, medium, low)
- **Agent settings**: Token limits, memory decay, and auto-compaction settings
- **Git integration**: Configuration for git-based workflows
- **Task defaults**: Default values for new tasks

### Customizing Configuration

Edit `.beadsconfig.json` to customize:

```json
{
  "agentSettings": {
    "maxContextTokens": 100000,
    "enableMemoryDecay": true,
    "autoCompaction": true
  }
}
```

## Usage

### Creating Tasks

```bash
bd create "Implement user authentication"
```

### Creating Subtasks

```bash
bd create "Add login form" --parent bd-a3f8
```

### Listing Tasks

```bash
bd list
```

### Viewing Task Details

```bash
bd show bd-a3f8
```

### Updating Tasks

```bash
bd update bd-a3f8 --status done
```

## Integration with AI Agents

Beads is designed to work seamlessly with AI coding agents like Claude Code. The agent can:

1. **Track long-running tasks**: Maintain context across multiple sessions
2. **Manage dependencies**: Understand task relationships and priorities
3. **Optimize memory usage**: Automatic compaction prevents token overflow
4. **Collaborate safely**: Hash-based IDs prevent conflicts in multi-agent workflows

## Directory Structure

After initialization, your project will have:

```
app/
├── .beads/
│   ├── issues/          # JSONL files for each issue
│   ├── cache.db         # SQLite cache for performance
│   └── config.json      # Runtime configuration
└── .beadsconfig.json    # Your custom configuration
```

## Best Practices

1. **Initialize early**: Run `npm run beads:init` when starting a new project
2. **Use hierarchical tasks**: Break large features into subtasks with parent relationships
3. **Label consistently**: Use the default labels or customize them for your workflow
4. **Commit regularly**: Beads files are small and merge-friendly
5. **Enable memory decay**: Let Beads automatically compact completed tasks

## Git Integration

Beads is designed to work with git:

- Issues are stored as individual JSONL files for easy merging
- Hash-based IDs prevent conflicts
- `.beads/` directory should be committed (unless using stealth mode)
- Compatible with standard git workflows (branches, PRs, etc.)

## Troubleshooting

### Beads not found

If you get a "bd: command not found" error, ensure dependencies are installed:

```bash
npm install
```

### Permission errors

Ensure you have write permissions in the project directory.

### Sync issues

If using multiple agents or devices, pull latest changes before creating new tasks:

```bash
git pull
```

## Learn More

- [Beads GitHub Repository](https://github.com/steveyegge/beads)
- [Beads Documentation](https://github.com/steveyegge/beads#readme)

## Quick Reference

```bash
# Initialize Beads
npm run beads:init

# Initialize in stealth mode
npm run beads:init:stealth

# Create a task
bd create "Task description"

# List all tasks
bd list

# Show task details
bd show <task-id>

# Update task status
bd update <task-id> --status done

# Create subtask
bd create "Subtask" --parent <parent-id>
```

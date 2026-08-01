---
name: list-components
description: List project components.
argument-hint: [subdirectory]
---

# list-components
List all React component files (.tsx, .ts, .jsx, .js) in the components folder.

If a [subdirectory] is provided via $ARGUMENTS, only list files in that subdirectory.

## When to use

- User asks to list, find, or inventory React components
- Before refactoring or adding a component in a feature area
- To check what already exists in a subdirectory

## Output Format

- Numbered list of files with relative paths
- Brief one-line description of each (infer from filename)
- Summary count at the end
- If no files found, say "No components found."


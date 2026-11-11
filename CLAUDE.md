@AGENTS.md

# Ephemeral Files Go in `.scratchpad`

Always put ephemeral/temporary work artifacts inside the `.scratchpad/` folder at the project root — never in the repo tree, the project root, or system temp locations.

This includes (but is not limited to):

- Scratch scripts, one-off node/bash/python files, and throwaway test harnesses
- Screenshots, recordings, and image captures
- Logs, dumps, generated JSON/CSV fixtures, and captured command output
- Downloaded or exported files used while debugging

Guidelines:

- Use a descriptive subfolder per task, e.g. `.scratchpad/edit-redesign/`, `.scratchpad/debug-loading/`.
- Keep paths flat and obvious: `.scratchpad/<task>/<file>`.
- Clean up after yourself once the task is done — delete what you no longer need so `.scratchpad/` doesn't accumulate cruft.
- Real, committed files belong in their proper place in the source tree; `.scratchpad/` is never imported by production code.

# Global AI Agent Rules & System Guardrails

## 1. Operating Environment & Execution Rules
- **Shell Awareness**: Detect OS/shell environment before running commands. Use cross-platform primitives (`node -e`, python scripts) or standard POSIX commands over shell-specific features.
- **Non-Interactive Execution**: Always pass non-interactive flags (e.g., `-y`, `--yes`, `--quiet`, `-q`) to CLI commands to prevent hanging on hidden prompts.
- **Environment Safety**: Never print, modify, or output contents of sensitive files (`.env`, API keys, secrets).

## 2. File Operations & Code Modification
- **Read Before Edit**: ALWAYS read target files or line ranges before executing edit tools. Never infer file structure, indentations, or line numbers.
- **Targeted Diffs**: Make minimal, surgical edits. Do NOT rewrite entire files when modifying specific functions or blocks.
- **No Stubs or Placeholders**: Write complete, functional code. NEVER leave `// TODO: implementation here` or `... rest of code stays the same` blocks.
- **Preserve Existing Style**: Match current file formatting, indentation (tabs/spaces), naming conventions, and project architecture patterns.

## 3. Planning & Execution Loop
- **Plan First**: For multi-file tasks or refactoring, output a brief 3-step action plan before executing tool calls.
- **Incremental Edits**: Execute changes step-by-step. Verify each step before moving to the next.
- **Circuit Breaker (Max 3 Fails)**: If a command, build, or test fails 3 times sequentially with the same error, STOP. Explain the root cause to the user instead of looping infinitely.

## 4. Verification & Testing
- **Run Checks**: After code edits, execute available linter or type-checker commands (e.g., `npm run lint`, `tsc`, `pytest`) if configured in the repository to verify syntax.
- **Log Analysis**: Always examine full terminal error traces before forming a fix strategy.

## 5. Git & Destructive Command Guardrails
- **Destructive Commands**: NEVER run destructive operations (`git reset --hard`, `rm -rf /`, `git push --force`) without explicit user instructions.
- **Git Actions**: Do not execute `git commit` or `git push` unless explicitly asked.
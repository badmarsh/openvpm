# Workspace Agent Rules — OpenVPM

## Tool Execution & Agent Behavior Guardrails

1. **Shell Environment Awareness (Windows)**:
   - Always verify the shell environment before running terminal commands.
   - Do NOT attempt to run raw PowerShell cmdlets (e.g. `Test-Path`, `Get-ChildItem`, `Select-Object`) directly in a standard CMD or Bash shell tool instance. Use cross-platform tools (`node -e`, standard shell primitives) or explicitly wrap commands in `powershell -Command "..."`.

2. **File Edit Guardrail (Always Read Before Edit)**:
   - ALWAYS execute `read_file` (or `view_file`) on a target file before attempting any `edit` or `replace_file_content` call in a chat session.
   - Never infer or guess exact character indentation or line strings without inspecting the exact file content first.

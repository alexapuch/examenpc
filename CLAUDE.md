# CLAUDE.md

This file provides guidance to AI assistants (Claude and others) working in this repository.

## Repository Overview

This repository (`alexapuch/examenpc`) is currently in its initial state with no source code committed yet. This CLAUDE.md establishes the foundational conventions and workflows that should be followed as the project evolves.

**Remote:** `http://local_proxy@127.0.0.1:29203/git/alexapuch/examenpc`
**Primary development branch:** `claude/add-claude-documentation-03xez`

---

## Git Workflow

### Branch Naming

- Feature branches: `feature/<short-description>`
- Bug fixes: `fix/<short-description>`
- AI-assisted branches: `claude/<description>-<session-id>`
- Documentation: `docs/<short-description>`

### Commit Messages

Use the Conventional Commits format:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`

Examples:
```
feat(auth): add JWT token validation
fix(api): handle null response from upstream
docs: update CLAUDE.md with project conventions
```

### Push Protocol

Always push with the upstream flag:

```bash
git push -u origin <branch-name>
```

If a push fails due to network errors, retry with exponential backoff (2s, 4s, 8s, 16s — up to 4 retries).

---

## Development Principles

### Code Quality

- Prefer simplicity over cleverness — the minimum complexity needed for the task
- Do not over-engineer: avoid premature abstractions, unnecessary helpers, or hypothetical future requirements
- Three similar lines of code is acceptable; abstract only when a clear pattern repeats 4+ times
- Only add error handling at system boundaries (user input, external APIs); trust internal code and framework guarantees
- Do not add comments unless the logic is genuinely non-obvious

### Security

- Never commit secrets, credentials, or API keys — use environment variables
- Validate all external input (user-submitted data, third-party API responses)
- Avoid common vulnerabilities: SQL injection, XSS, command injection (OWASP Top 10)
- Do not log sensitive data (passwords, tokens, PII)

### File Management

- Edit existing files rather than creating new ones whenever possible
- Do not create documentation files (README, guides) unless explicitly requested
- Remove unused code rather than commenting it out or leaving backwards-compatibility shims

---

## Dependency Management

As this project is initialized, the following conventions apply regardless of the chosen stack:

- Pin dependency versions in lock files (`package-lock.json`, `poetry.lock`, `Gemfile.lock`, etc.)
- Do not add dependencies for functionality that can be achieved with the standard library
- Audit new dependencies for security vulnerabilities before adding them
- Keep dev dependencies separate from runtime dependencies

---

## Testing

- Write tests for new behavior, not for implementation details
- Test files should live alongside the source they test or in a `tests/` / `__tests__/` directory
- Tests should be deterministic — no flaky network calls or time-dependent assertions without mocking
- Before committing, ensure all tests pass

---

## Environment Variables

- Store secrets and environment-specific configuration in `.env` files (never commit these)
- Provide a `.env.example` file with all required variable names but no real values
- Document each variable with a comment in `.env.example`

Example `.env.example`:
```
# Database connection string
DATABASE_URL=

# Secret key for signing tokens (min 32 chars)
SECRET_KEY=

# External API base URL
API_BASE_URL=https://api.example.com
```

---

## AI Assistant Guidelines

### When Given an Ambiguous Task

1. Read the relevant existing code before proposing or making changes
2. Ask for clarification on requirements rather than guessing at scope
3. State your assumptions explicitly before implementing

### What to Avoid

- Do not push to branches other than the one specified for the task
- Do not force-push, reset --hard, or run destructive git operations without explicit user permission
- Do not skip pre-commit hooks (`--no-verify`)
- Do not batch file changes without explaining what changed and why
- Do not make "improvements" beyond what was requested (no unsolicited refactors, cleanups, or extra features)

### Confirming Risky Actions

Always ask the user before:
- Deleting files or branches
- Force-pushing or amending published commits
- Modifying CI/CD pipelines
- Pushing to `main` or `master`
- Sending messages or creating PRs/issues on shared systems

### Tool Preferences

- Use dedicated tools (Read, Edit, Write, Grep, Glob) instead of shell equivalents (`cat`, `grep`, `find`)
- Run independent operations in parallel where possible
- Track multi-step work with the TodoWrite tool

---

## Updating This File

When the project stack is chosen and the first source files are committed, update this CLAUDE.md to include:

- The specific language/framework and version
- How to install dependencies
- How to run the development server
- How to run tests and linters
- The database/storage setup (if applicable)
- Any environment-specific configuration steps
- Architecture overview (directory structure and responsibilities)

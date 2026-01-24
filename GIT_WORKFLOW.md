# Git Workflow & Branch Strategy

## Branch Overview

This project uses a structured Git workflow with two main branches:

```
┌─────────────────────────────────────────────────────────────┐
│  MAIN BRANCH (Production)                                   │
│  - Production-ready code only                               │
│  - Deployed to: server.sclsandbox.xyz                       │
│  - Protected branch (requires PR review)                    │
│  - Tags: v1.0.0, v1.0.1, etc.                              │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ (Merge when ready for production)
         │ Pull Request + Code Review
         │
┌─────────────────────────────────────────────────────────────┐
│  DEVELOP BRANCH (Development)                               │
│  - Default development branch                               │
│  - Your local development work                              │
│  - Runs on: localhost                                       │
│  - All feature branches merge here                          │
│  - Continuous integration/testing                           │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ (Feature development)
         │
    ┌────┼────┬────────┐
    │    │    │        │
┌────────┴──┐ │ ┌──────▼────┐ ┌──────┐
│feature-1  │ │ │feature-2  │ │bugfix│
│(your      │ │ │(your      │ │(your │
│feature)   │ │ │feature)   │ │fixes)│
└───────────┘ │ └───────────┘ └──────┘
              │
        ┌─────┴─────┐
        │           │
  (feature branch strategy)
```

---

## Branches

### `main` (Production)
- **Purpose**: Production-ready, stable code
- **Deployed to**: Production server (sclsandbox.xyz)
- **Protection**: ✅ Requires PR review before merging
- **Merge from**: develop branch via Pull Request only
- **Tagging**: Use semantic versioning (v1.0.0, v1.0.1, etc.)

### `develop` (Development)
- **Purpose**: Integration branch for development
- **Deployed to**: Your localhost for testing
- **Default branch**: For local development
- **Merge from**: Feature branches, bugfixes via PR
- **Usage**: Always work on feature branches, merge to develop via PR

### Feature/Bugfix Branches
- **Naming**: `feature/feature-name` or `bugfix/bugfix-name`
- **Based on**: develop branch
- **Merge back to**: develop branch via PR

---

## Workflow: Local Development (Your Laptop)

### 1️⃣ Start New Development Work

```bash
# Ensure you're on develop with latest code
git checkout develop
git pull origin develop

# Create a new feature branch
git checkout -b feature/awesome-feature
# or for bugfixes:
git checkout -b bugfix/fix-login-bug
```

### 2️⃣ Work on Your Feature

```bash
# Make changes, test locally
git add .
git commit -m "Add awesome feature"

# Keep pushing to your feature branch
git push origin feature/awesome-feature
```

### 3️⃣ Test on Development Environment

```bash
# Switch to develop
git checkout develop
git pull origin develop

# Run development environment
./scripts/start-dev.bat    # Windows
./scripts/start-dev.sh     # Linux/Mac

# Test your changes
# Access: http://localhost:3000
```

### 4️⃣ Create Pull Request

```bash
# Push your feature branch
git push origin feature/awesome-feature

# Go to GitHub and create a Pull Request:
# - From: feature/awesome-feature
# - To: develop
# - Add description of changes
# - Request review
```

### 5️⃣ Merge to Develop

```bash
# After PR approval:
git checkout develop
git pull origin develop
git merge feature/awesome-feature
git push origin develop

# Delete feature branch
git branch -d feature/awesome-feature
git push origin --delete feature/awesome-feature
```

---

## Workflow: Production Deployment (Server)

### 1️⃣ Prepare for Production Release

```bash
# Ensure develop is stable and tested
git checkout develop
git pull origin develop

# Create release PR
# - From: develop
# - To: main
# - Title: "Release v1.0.0"
# - Description: List all changes, features, bugfixes
```

### 2️⃣ Review & Approval

- Code review required
- All tests must pass
- QA sign-off (if applicable)
- Security review (if applicable)

### 3️⃣ Merge to Production

```bash
# On main branch
git checkout main
git pull origin main

# Merge the release PR
# (This can be done via GitHub UI)

# Create a version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags
```

### 4️⃣ Deploy to Production

```bash
# On production server
git checkout main
git pull origin main

# Load production environment
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

---

## Common Tasks

### Check Current Branch
```bash
git branch -a
```

### Switch Between Branches
```bash
# Local branch
git checkout develop
git checkout feature/my-feature

# Remote branch
git checkout --track origin/feature/remote-feature
```

### Update Your Branch with Latest develop
```bash
git checkout feature/my-feature
git fetch origin
git merge origin/develop
# Resolve conflicts if any
git push origin feature/my-feature
```

### Cancel/Abandon a Feature
```bash
# Don't push/merge it
git checkout develop
git branch -d feature/abandoned-feature
# Optionally delete from remote:
git push origin --delete feature/abandoned-feature
```

### View Commit History
```bash
# Current branch
git log --oneline

# Specific branch
git log --oneline develop

# Graph view (all branches)
git log --graph --all --oneline
```

### Undo Commits (Before Pushing)
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

---

## Branch Protection Rules (GitHub)

### For `main` Branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Dismiss stale pull request approvals
- ✅ Require code owners review

### For `develop` Branch:
- Recommended: Require pull request reviews
- Recommended: Protect from force pushes

---

## Commit Message Convention

### Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions/changes
- `chore`: Build, dependencies, configuration

### Examples:
```bash
# Feature
git commit -m "feat(dashboard): add module cards with RBAC"

# Bugfix
git commit -m "fix(login): resolve invalid token verification"

# Documentation
git commit -m "docs: update environment setup guide"

# Multiple line commit
git commit -m "feat(auth): implement SSO integration

- Add token generation endpoint
- Add token verification endpoint
- Add Moodle integration
- Add comprehensive logging"
```

---

## Quick Reference

### Your Daily Workflow (Development)
```bash
# Start your day
git checkout develop && git pull origin develop

# Create feature branch
git checkout -b feature/what-you-are-building

# Work, commit, push
git add . && git commit -m "your changes"
git push origin feature/what-you-are-building

# When done, create Pull Request to develop
# After approval, merge and delete branch
```

### Release/Deployment (Server)
```bash
# When ready for production
# 1. Create PR from develop → main
# 2. Get approval
# 3. Merge to main
# 4. Tag version: git tag -a v1.0.0 -m "Release v1.0.0"
# 5. Deploy on server with production environment
```

---

## Common Scenarios

### Scenario 1: Feature Requires Latest develop Code
```bash
git checkout feature/my-feature
git fetch origin
git merge origin/develop
# Resolve conflicts
git push origin feature/my-feature
```

### Scenario 2: Need to Switch Branches But Have Uncommitted Changes
```bash
# Save changes temporarily
git stash

# Switch branch
git checkout develop

# Resume changes later
git checkout feature/my-feature
git stash pop
```

### Scenario 3: Accidentally Committed to main
```bash
# Get last commit hash
git log --oneline -5

# Revert it on main
git revert <commit-hash>

# Create it on a feature branch instead
git checkout develop
git checkout -b feature/my-feature
git cherry-pick <commit-hash>
```

---

## Troubleshooting

### "Your branch and 'origin/develop' have diverged"
```bash
# Fetch latest and rebase
git fetch origin
git rebase origin/develop
# If conflicts, resolve and: git rebase --continue
```

### "Permission denied (publickey)"
```bash
# SSH key issue - ensure keys are added
# Use HTTPS URL instead:
git remote set-url origin https://github.com/syedsanaulhaq/scl-institute.git
```

### "fatal: refusing to merge unrelated histories"
```bash
# When pulling from a fork or different repo
git pull --allow-unrelated-histories origin develop
```

---

## Tools & Resources

- **GitHub**: https://github.com/syedsanaulhaq/scl-institute
- **VS Code Git Integration**: Built-in Git features in VS Code
- **Branch Visualization**: 
  ```bash
  git log --graph --all --oneline --decorate
  ```

---

## Key Takeaways

✅ **main** = Production (server) - Do NOT work here directly
✅ **develop** = Development (laptop) - Your default working branch
✅ Always create features on separate branches
✅ Use Pull Requests for code review before merging
✅ Follow commit message conventions
✅ Tag releases on main branch with version numbers

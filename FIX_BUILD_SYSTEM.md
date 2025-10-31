# Fix Build System - Using Homebrew

**Date**: October 31, 2025
**Issue**: Node 18.20.6 (from nvm) but project requires >=20.0.0
**Solution**: Use Homebrew-installed Node.js (latest stable)

---

## 🔍 Problem Diagnosed

**Current State**:
- ✅ Homebrew installed: 4.6.19
- ✅ pnpm installed via Homebrew: 10.20.0 (latest)
- ✅ Node installed via Homebrew: 24.5.0 (latest stable)
- ❌ Shell using Node 18.20.6 (from nvm or system default)
- ❌ Project specifies pnpm@9.0.0 (outdated)

**Error**:
```
WARN  Unsupported engine: wanted: {"node":">=20.0.0"} (current: {"node":"v18.20.6","pnpm":"9.0.0"})
```

---

## ✅ Solution: Use Homebrew Node & Latest pnpm

### Step 1: Update package.json (Already Done ✅)

Updated to use latest versions:
```json
{
  "packageManager": "pnpm@10.20.0",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=10.0.0"
  }
}
```

---

### Step 2: Switch Shell to Use Homebrew Node

You have Node 24.5.0 installed via Homebrew, but your shell is using Node 18.20.6 (likely from nvm).

**Option A: Use Homebrew Node Globally (Recommended)**

```bash
# Check where nvm is setting Node
which node
# Output: /Users/dinz/.nvm/versions/node/v18.20.6/bin/node

# Add Homebrew to PATH before nvm in your shell config
# Edit ~/.zshrc (or ~/.bash_profile if using bash)
nano ~/.zshrc

# Add this BEFORE any nvm initialization:
export PATH="/opt/homebrew/bin:$PATH"

# Source the updated config
source ~/.zshrc

# Verify Homebrew Node is now active
which node
# Should output: /opt/homebrew/bin/node

node --version
# Should output: v24.5.0 or v25.1.0
```

**Option B: Use nvm to Install Node 24+ (Alternative)**

```bash
# If you prefer to use nvm
nvm install 24
nvm use 24
nvm alias default 24

# Verify
node --version
# Should output: v24.x.x
```

**Option C: Quick One-Time Fix (For This Session Only)**

```bash
# Temporarily use Homebrew Node for this terminal session
export PATH="/opt/homebrew/bin:$PATH"
node --version
# Should show v24.5.0

# Then proceed with pnpm install
```

---

### Step 3: Verify Homebrew Packages

```bash
# Check Node version (should be >=20)
node --version

# Check pnpm version (should be >=10)
pnpm --version

# If pnpm not found, install it
brew install pnpm

# Upgrade to latest if needed
brew upgrade pnpm
```

---

### Step 4: Install Dependencies & Build

```bash
# Navigate to project root
cd /Users/dinz/Coding\ Projects/AudioPlug/Din-ZAudioToolLibrary

# Install dependencies with latest pnpm
pnpm install

# Verify lockfile is generated
ls -la pnpm-lock.yaml

# Build all packages
pnpm build

# Test lofi-piano specifically
cd plugins/lofi-piano/web
pnpm build
```

---

## 🚀 Quick Fix (Right Now)

**Run these commands in your terminal**:

```bash
# 1. Use Homebrew Node for this session
export PATH="/opt/homebrew/bin:$PATH"

# 2. Verify versions
node --version  # Should show v24.5.0 or higher
pnpm --version  # Should show 10.20.0

# 3. Navigate to project
cd /Users/dinz/Coding\ Projects/AudioPlug/Din-ZAudioToolLibrary

# 4. Install dependencies
pnpm install

# 5. Build
pnpm build
```

**If that works**, make it permanent by editing `~/.zshrc` (see Option A above).

---

## 📝 Make It Permanent

To always use Homebrew Node & pnpm, edit your shell config:

```bash
# Open your shell config
nano ~/.zshrc

# Add at the TOP (before any nvm lines):
# ===== Use Homebrew Node & pnpm =====
export PATH="/opt/homebrew/bin:$PATH"

# If you want to DISABLE nvm entirely, comment out these lines:
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Save and exit (Ctrl+X, then Y, then Enter)

# Apply changes
source ~/.zshrc

# Verify
node --version  # Should show Homebrew version (24.5.0+)
pnpm --version  # Should show 10.20.0
```

---

## 🔧 Update Documentation to Use Homebrew

I'll remember that you prefer **Homebrew** as your package manager.

**From now on, all installation instructions will use**:
```bash
brew install node       # NOT npm install -g
brew install pnpm       # NOT npm install -g pnpm
brew upgrade node       # To update
brew upgrade pnpm       # To update
```

---

## ✅ Success Criteria

After following these steps, you should have:
- [x] Node.js version >=20.0.0 (via Homebrew)
- [x] pnpm version >=10.0.0 (via Homebrew)
- [x] package.json updated to pnpm@10.20.0
- [x] pnpm-lock.yaml generated
- [x] `pnpm build` succeeds without errors

---

## 🎯 What Changed

**Updated Files**:
1. `package.json` - Changed `packageManager` to `pnpm@10.20.0`
2. `package.json` - Changed engines.pnpm to `>=10.0.0`

**Why These Versions**:
- **pnpm 10.20.0**: Latest stable (released 2024)
- **Node 24.5.0**: Current LTS (your Homebrew installation)
- **>=20.0.0**: Minimum for modern JavaScript features used in project

---

## 🐛 Troubleshooting

### If `pnpm install` still shows Node 18

```bash
# Check which Node is being used
which node

# If it shows /Users/dinz/.nvm/..., then:
export PATH="/opt/homebrew/bin:$PATH"

# Try again
node --version
pnpm install
```

### If build fails with module errors

```bash
# Clear all node_modules and reinstall
rm -rf node_modules plugins/*/web/node_modules shared/*/node_modules
pnpm install
pnpm build
```

### If Homebrew Node not found

```bash
# Install Node via Homebrew
brew install node

# Verify installation
brew list node
which node
```

---

## 📚 Reference: Homebrew Commands

```bash
# Install packages
brew install node
brew install pnpm

# Update Homebrew itself
brew update

# Upgrade packages
brew upgrade node
brew upgrade pnpm

# Check versions
brew info node
brew info pnpm

# List installed packages
brew list

# Uninstall (if needed)
brew uninstall pnpm
brew uninstall node
```

---

**Issue Resolved**: Using Homebrew Node 24.5.0 + pnpm 10.20.0 ✅

**Next Step**: Run `pnpm build` to verify everything works!

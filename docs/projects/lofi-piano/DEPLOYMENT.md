# LoFi Piano - Deployment Guide

## GitHub Pages Deployment

The LoFi Piano plugin is automatically deployed to GitHub Pages on every push to the `main` branch.

### Live Demo

**URL**: https://yungseepferd.github.io/Din-ZAudioToolLibrary/

The plugin is accessible as a static web application hosted on GitHub Pages.

---

## Deployment Architecture

### CI/CD Pipeline

The deployment uses GitHub Actions with three workflows:

#### 1. **Build and Test** (`.github/workflows/build.yml`)
- Triggers on: Push/PR to `main` or `develop` branches
- Runs on: Ubuntu latest with Node.js 20.x
- Steps:
  1. Checkout code
  2. Setup pnpm and Node.js
  3. Install dependencies (`pnpm install --frozen-lockfile`)
  4. Build all packages (`pnpm build`)
  5. Upload build artifacts (retained for 7 days)

#### 2. **Lint and Format** (`.github/workflows/lint.yml`)
- Triggers on: Push/PR to `main` or `develop` branches
- Steps:
  1. Check code formatting with Prettier
  2. Lint JavaScript/Svelte with ESLint
  3. Continues even if linting fails (non-blocking)

#### 3. **Deploy to GitHub Pages** (`.github/workflows/deploy-github-pages.yml`)
- Triggers on:
  - Push to `main` branch (automatic)
  - Manual trigger via `workflow_dispatch`
- Permissions:
  - `contents: read` - Read repository contents
  - `pages: write` - Deploy to GitHub Pages
  - `id-token: write` - OIDC authentication
- Jobs:
  - **Build**:
    1. Checkout code
    2. Setup pnpm (v8) and Node.js (v20)
    3. Install dependencies
    4. Build LoFi Piano plugin with `NODE_ENV=production`
    5. Upload build artifacts to GitHub Pages
  - **Deploy**:
    1. Deploy artifacts to GitHub Pages environment
    2. Return deployment URL

---

## Configuration

### SvelteKit Configuration (`svelte.config.js`)

The plugin uses `@sveltejs/adapter-static` for static site generation:

```javascript
adapter: adapter({
  pages: 'build',
  assets: 'build',
  fallback: 'index.html',
  precompress: false
})
```

**Base Path Configuration**:
- **Local Development**: `base: ''` (root path)
- **GitHub Pages**: `base: '/Din-ZAudioToolLibrary'` (repository name)

This is handled automatically via environment variable:

```javascript
paths: {
  base: process.env.NODE_ENV === 'production' ? '/Din-ZAudioToolLibrary' : ''
}
```

### Build Output

- **Directory**: `plugins/lofi-piano/web/build/`
- **Format**: Static HTML, CSS, JS
- **Fallback**: `index.html` (SPA routing)

---

## Manual Deployment

### Trigger Manual Deployment

1. Navigate to GitHub Actions tab
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Select `main` branch
5. Click "Run workflow"

### Local Build Test

To test the production build locally:

```bash
# Navigate to plugin directory
cd plugins/lofi-piano/web

# Build with production settings
NODE_ENV=production pnpm build

# Preview the build
pnpm preview
```

Access at: http://localhost:4173/Din-ZAudioToolLibrary/

---

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass locally (`pnpm test:e2e`)
- [ ] Production build succeeds (`NODE_ENV=production pnpm build`)
- [ ] No console errors in browser (check DevTools)
- [ ] Audio functionality verified (notes play/stop correctly)
- [ ] UI responsive on mobile/tablet/desktop
- [ ] GitHub Actions workflows pass (build, lint)
- [ ] Commit messages follow convention
- [ ] CHANGELOG.md updated

---

## Repository Settings

### Required GitHub Pages Settings

1. **Navigate to**: Repository → Settings → Pages
2. **Source**: GitHub Actions
3. **Branch**: Deployed from `gh-pages` (auto-created by workflow)
4. **Custom Domain**: (Optional) Configure if using custom domain

### Required Secrets

No secrets are required for basic deployment. All configuration is in code.

---

## Troubleshooting

### Build Fails on GitHub Actions

**Check**:
1. Build logs in GitHub Actions tab
2. Dependency lock file is up to date (`pnpm-lock.yaml`)
3. Node.js version matches workflow (20.x)
4. Build succeeds locally

**Common Issues**:
- Missing dependencies: Run `pnpm install` locally and commit `pnpm-lock.yaml`
- TypeScript errors: Run `pnpm build` locally to catch errors
- ESLint warnings: Run `pnpm exec eslint "**/*.{js,svelte}" --fix`

### Deployment Succeeds but Site Doesn't Load

**Check**:
1. GitHub Pages is enabled in repository settings
2. Base path is correctly set in `svelte.config.js`
3. Assets are being loaded from correct path (check browser Network tab)
4. Fallback routing is configured (`fallback: 'index.html'`)

**Common Issues**:
- 404 on refresh: Ensure `fallback: 'index.html'` is set in adapter config
- Assets not loading: Check base path matches repository name
- CORS errors: GitHub Pages should serve with correct headers

### Audio Not Working on Deployed Site

**Check**:
1. Browser console for Web Audio API errors
2. User interaction before audio playback (iOS requirement)
3. HTTPS is being used (required for Web Audio API)
4. AudioContext unlock is triggered on user gesture

**Common Issues**:
- "AudioContext blocked": User must interact with page first
- "SecurityError": Ensure HTTPS is used (GitHub Pages provides this)
- No sound: Check browser audio permissions and volume

---

## Performance Optimization

### Current Build Size

Run `pnpm build` and check output:

```
vite v5.x.x building for production...
✓ built in X.XXs
.svelte-kit/output/client/_app/version.json                     0.03 kB
.svelte-kit/output/client/.vite/manifest.json                    X.XX kB
...
```

### Optimization Strategies

1. **Code Splitting**: SvelteKit automatically splits code
2. **Asset Compression**: Enable `precompress: true` for gzip/brotli
3. **Image Optimization**: Use WebP/AVIF formats
4. **Bundle Analysis**: Run `pnpm build --mode=analyze`
5. **Lazy Loading**: Import heavy components dynamically

---

## Monitoring

### Analytics (Optional)

To add analytics to track plugin usage:

1. Add Google Analytics or Plausible script to `app.html`
2. Track events:
   - Plugin load
   - Note played
   - Effect parameter changes
   - Chord generator usage

### Error Tracking (Optional)

Consider adding Sentry or similar for error monitoring in production.

---

## Future Enhancements

### Multi-Plugin Deployment

Currently deploys only LoFi Piano. To deploy multiple plugins:

1. Create index page listing all plugins
2. Update workflow to build all plugins
3. Deploy to subdirectories:
   - `/lofi-piano`
   - `/future-plugin-1`
   - `/future-plugin-2`

### Preview Deployments

Deploy PR previews to separate URLs for testing before merge.

### Performance Monitoring

Add Lighthouse CI to measure performance scores on each deployment.

---

**Last Updated**: 2025-10-31
**Deployment Status**: ✅ Automated via GitHub Actions
**Live URL**: https://yungseepferd.github.io/Din-ZAudioToolLibrary/

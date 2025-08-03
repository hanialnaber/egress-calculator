# Version Management Quick Reference

## 🚀 Current Status
- **Production (main):** v2.1.0
- **Development (dev):** v2.1.0
- **Next Version:** v2.2.0 (when ready)

## 📋 Version Workflow Checklist

### Starting New Development:
```bash
git checkout dev
# Work on features...
```

### Before Merging to Main:
1. **Update Version Number**
   ```bash
   python update_version.py 2.2.0 "Description of changes"
   ```

2. **Update Changelog**
   - Edit `__changelog__` in `app.py`
   - Update `VERSION.md` with detailed changes

3. **Test Application**
   ```bash
   streamlit run app.py
   ```

4. **Commit with Version**
   ```bash
   git add .
   git commit -m "v2.2.0: feat: Description of main features"
   git push origin dev
   ```

### Merging to Main:
```bash
git checkout main
git merge dev -m "Merge v2.2.0 from dev to main

Brief description of release
- Feature 1
- Feature 2  
- Bug fixes"

git push origin main
```

### Tagging Release:
```bash
git tag -a v2.2.0 -m "Release v2.2.0: Brief description"
git push origin v2.2.0
```

### Back to Development:
```bash
git checkout dev
```

## 📝 Commit Message Templates

### Feature Commits:
```
v{version}: feat: Add new feature description
v{version}: fix: Fix specific bug description
v{version}: docs: Update documentation
v{version}: style: UI/UX improvements
v{version}: refactor: Code restructuring
```

### Merge Commits:
```
Merge v{version} from dev to main

Release v{version} - Release Title

Major Features:
- Feature 1 description
- Feature 2 description

Bug Fixes:
- Fix 1 description
- Fix 2 description

Technical Improvements:
- Tech improvement 1
- Tech improvement 2
```

## 🏷️ Version Numbering

### Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR (3.0.0):** Breaking changes, complete rewrites
- **MINOR (2.X.0):** New features, enhancements (backwards compatible)
- **PATCH (2.1.X):** Bug fixes, small improvements (backwards compatible)

### Examples:
- `v2.1.1` - Bug fix for travel distance error
- `v2.2.0` - Add new calculation type (Business occupancy subcategories)
- `v3.0.0` - Complete UI redesign with breaking changes

## 🛠️ Helper Scripts

### Update Version:
```bash
python update_version.py 2.2.0 "Add new features"
```

### Check Current Version:
```bash
grep "__version__" app.py
```

### View Recent Versions:
```bash
git tag --sort=-version:refname | head -10
```

---

*Keep this file updated with each release for team reference*

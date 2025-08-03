# Egress Calculator - Version History

## Current Version: 2.1.0
**Release Date:** August 3, 2025  
**Branch:** dev → main

## Version History

### Version 2.1.0 (2025-08-03)
**Features:**
- ✨ Added step-by-step calculation logic with educational transparency
- 📚 Enhanced calculation explanations with IBC code references and notes
- 💡 Added design recommendations based on calculated values
- 📄 Professional calculation summary for export with version tracking
- 🔧 Version display in UI header and sidebar
- 📋 Comprehensive changelog system

**Bug Fixes:**
- 🐛 Fixed NoneType error in travel distance comparison
- 🎨 Maintained original sidebar layout per user preference

**Technical:**
- 📦 Added version constant and build date tracking
- 📊 Enhanced project export with version metadata
- 🏗️ Improved code organization and documentation

---

### Version 2.0.0 (2025-08-02)
**Features:**
- 🔄 Complete rewrite from HTML/CSS/JS to Python/Streamlit
- 🏢 Multi-building project support with navigation
- 🌍 Unit conversion system (Imperial ↔ Metric)
- 💾 Project save/load functionality with JSON export/import
- 📈 Calculation history tracking with 50-item limit
- 🎨 Professional UI design with sidebar navigation
- 📖 IBC code references with direct links
- 🔧 Advanced options for travel distance and door calculations
- 🌐 Streamlit Cloud deployment ready

**Technical:**
- ⚡ Enhanced performance with session state management
- 📊 Comprehensive error handling and validation
- 🔒 Type hints and documentation throughout codebase
- 🎯 Professional architectural calculation accuracy

---

## Version Management Workflow

### Development Process:
1. **Feature Development:** Work in `dev` branch
2. **Version Update:** Update version number in app.py and VERSION.md
3. **Commit Format:** `v{version}: {description}`
4. **Merge to Main:** Include version in merge commit message
5. **Release:** Tag main branch with version number

### Commit Message Format:
```
v{version}: {type}: {description}

Examples:
v2.1.0: feat: Add step-by-step calculation logic
v2.1.0: fix: Resolve NoneType error in travel distance
v2.1.0: docs: Update version tracking system
```

### Merge Message Format:
```
Merge v{version} from dev to main

{Brief summary of changes}
- Feature 1
- Feature 2
- Bug fixes
```

### Branching Strategy:
- **main:** Production-ready releases
- **dev:** Active development and testing
- **feature/xxx:** Specific feature branches (optional)

### Release Checklist:
- [ ] Update version number in app.py
- [ ] Update VERSION.md with changes
- [ ] Update __build_date__ in app.py
- [ ] Add changelog entries
- [ ] Test all functionality
- [ ] Commit with version prefix
- [ ] Merge to main with version in message
- [ ] Tag release on GitHub
- [ ] Deploy to production

## Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., 2.1.0)
- **MAJOR:** Breaking changes or complete rewrites
- **MINOR:** New features, enhancements (backwards compatible)
- **PATCH:** Bug fixes, small improvements (backwards compatible)

## Deployment Versions

### Production (main branch):
- Current: v2.0.0
- Next: v2.1.0 (pending merge)

### Development (dev branch):
- Current: v2.1.0 (ready for merge)

### Streamlit Cloud:
- URL: [To be deployed]
- Version: Will match main branch

---

*Last updated: August 3, 2025*

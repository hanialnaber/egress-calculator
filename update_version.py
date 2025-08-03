#!/usr/bin/env python3
"""
Version Management Script for Egress Calculator
Helps automate version updates and ensures consistency
"""

import re
import sys
from datetime import datetime
from pathlib import Path

def update_version(new_version: str, description: str = ""):
    """Update version across all files"""
    
    # Update app.py
    app_file = Path("app.py")
    if app_file.exists():
        content = app_file.read_text()
        
        # Update version
        content = re.sub(
            r'__version__ = "[^"]*"',
            f'__version__ = "{new_version}"',
            content
        )
        
        # Update build date
        today = datetime.now().strftime("%Y-%m-%d")
        content = re.sub(
            r'__build_date__ = "[^"]*"',
            f'__build_date__ = "{today}"',
            content
        )
        
        app_file.write_text(content)
        print(f"✅ Updated app.py to version {new_version}")
    
    # Update VERSION.md
    version_file = Path("VERSION.md")
    if version_file.exists():
        content = version_file.read_text()
        
        # Update current version line
        content = re.sub(
            r'## Current Version: [^\n]*',
            f'## Current Version: {new_version}',
            content
        )
        
        # Update release date
        today = datetime.now().strftime("%B %d, %Y")
        content = re.sub(
            r'\*\*Release Date:\*\* [^\n]*',
            f'**Release Date:** {today}',
            content
        )
        
        version_file.write_text(content)
        print(f"✅ Updated VERSION.md to version {new_version}")
    
    print(f"""
🎉 Version updated to {new_version}

Next steps:
1. Add changelog entries to app.py __changelog__ dict
2. Update VERSION.md with detailed changes
3. Test the application
4. Commit with: git commit -m "v{new_version}: {description}"
5. Merge to main: git checkout main && git merge dev
""")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python update_version.py <version> [description]")
        print("Example: python update_version.py 2.2.0 'Add new features'")
        sys.exit(1)
    
    version = sys.argv[1]
    description = sys.argv[2] if len(sys.argv) > 2 else "Version update"
    
    update_version(version, description)

#!/usr/bin/env python3
import os
import glob

def update_file(filepath, replacements):
    """Update a file with multiple replacements"""
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements.items():
            content = content.replace(old, new)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ {os.path.basename(filepath)}")
        return True
    except Exception as e:
        print(f"✗ Error with {filepath}: {e}")
        return False

# Define replacements
replacements = {
    'theme_classic': 'theme_scl',
    "'classic'": "'scl'",
    'Classic': 'SCL',
    'classic/': 'scl/',
    'Bas Brands': 'SCL Institute',
}

# Files to update
files_to_update = [
    '/opt/scl-docker-moodle/theme/scl/version.php',
    '/opt/scl-docker-moodle/theme/scl/config.php',
    '/opt/scl-docker-moodle/theme/scl/lib.php',
    '/opt/scl-docker-moodle/theme/scl/settings.php',
    '/opt/scl-docker-moodle/theme/scl/lang/en/theme_classic.php',
]

print("Updating SCL theme files...")
for filepath in files_to_update:
    update_file(filepath, replacements)

# Rename language file if it hasn't been renamed
lang_file_old = '/opt/scl-docker-moodle/theme/scl/lang/en/theme_classic.php'
lang_file_new = '/opt/scl-docker-moodle/theme/scl/lang/en/theme_scl.php'

if os.path.exists(lang_file_old) and not os.path.exists(lang_file_new):
    os.rename(lang_file_old, lang_file_new)
    print(f"✓ Renamed language file")

# Copy purple SCSS
purple_scss = '/mnt/c/SCL\ System/scl-institute/scl_theme.scss'
if os.path.exists(purple_scss.replace('\\ ', ' ')):
    try:
        with open(purple_scss.replace('\\ ', ' '), 'r') as f:
            scss_content = f.read()
        with open('/opt/scl-docker-moodle/theme/scl/scss/scl.scss', 'w') as f:
            f.write(scss_content)
        print(f"✓ Applied purple SCSS styling")
    except:
        print("Note: SCSS file not found, using standard styling")

print("\n✓ Theme update complete!")

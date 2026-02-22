#!/usr/bin/env python3
import os
import sys

def update_file(filepath, replacements):
    """Update a file with multiple replacements"""
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Updated: {filepath}")
    return True

# Define replacements for SCL theme
replacements = {
    'theme_classic': 'theme_scl',
    "'classic'": "'scl'",
    'classic/': 'scl/',
}

# Update config.php
config_file = '/opt/scl-docker-moodle/theme/scl/config.php'
update_file(config_file, replacements)

# Also ensure parents is set to classic
with open(config_file, 'r', encoding='utf-8') as f:
    content = f.read()

if "['boost']" in content:
    content = content.replace("['boost']", "['classic']")
    with open(config_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("✓ Updated parents to classic")

print("Theme update complete!")

#!/usr/bin/env python3
import re

with open('script.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the start and end of the block to remove
start_idx = None
end_idx = None

for i, line in enumerate(lines):
    if 'function getUploadElements()' in line:
        start_idx = i - 1  # Include blank line before
    if start_idx is not None and 'function copyUploadedImageUrl()' in line:
        # Find the closing brace for this function
        for j in range(i, len(lines)):
            if lines[j].strip() == '}' and (j == len(lines) - 1 or lines[j+1].strip().startswith('function ') or lines[j+1].strip() == ''):
                end_idx = j + 1
                break

if start_idx is not None and end_idx is not None:
    # Remove the lines
    new_lines = lines[:start_idx] + lines[end_idx:]
    
    with open('script.js', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"✓ Removed lines {start_idx+1} to {end_idx}")
else:
    print("Could not find the block to remove")

#!/usr/bin/env python3
import re

# Read the file
with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all those functions and replace with simple updateProductImagePreview
old_pattern = r'(?s)function getUploadElements\(\).*?async function copyUploadedImageUrl\(\)[^}]*\n  \}\n'
new_code = '''
function updateProductImagePreview() {
  const urlInput = document.getElementById('product-image-url');
  const preview = document.getElementById('product-image-preview');
  const dropzone = document.getElementById('product-image-dropzone');
  if (!urlInput || !preview || !dropzone) return;

  const url = String(urlInput.value || '').trim();
  if (url && url.startsWith('http')) {
    preview.src = url;
    preview.classList.remove('hidden');
    const text = dropzone.querySelector('.dropzone-text');
    if (text) text.classList.add('hidden');
  } else {
    preview.classList.add('hidden');
    const text = dropzone.querySelector('.dropzone-text');
    if (text) text.classList.remove('hidden');
  }
}

'''

content = re.sub(old_pattern, new_code, content)

# Write back
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ script.js simplified!")

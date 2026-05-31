#!/usr/bin/env python3
import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove old getUploadElements through copyUploadedImageUrl functions
# This is a big block to remove
old_upload_block = r'function getUploadElements\(\).*?async function copyUploadedImageUrl\(\)[^}]*\}\s*?\n'
content = re.sub(old_upload_block, '', content, flags=re.DOTALL)

# 2. Fix setProductImageValue to not use getUploadElements anymore
old_set_image = r'function setProductImageValue\(value\) \{\s*CURRENT_PRODUCT_IMAGE_URL = value \|\| \'\';\s*const \{ urlInput \} = getUploadElements\(\);[^}]*updateUploadPreview[^}]*\}'
new_set_image = '''function setProductImageValue(value) {
  const urlInput = document.getElementById('product-image-url');
  if (urlInput) urlInput.value = value || '';
  updateProductImagePreview(value || '');
}'''
content = re.sub(old_set_image, new_set_image, content, flags=re.DOTALL)

# 3. Remove references to LAST_UPLOADED_IMAGE_URL in openProductForm
# Line 754 sets it to LAST_UPLOADED_IMAGE_URL || '' - change to ''
content = content.replace(
    "setProductImageValue(LAST_UPLOADED_IMAGE_URL || '');",
    "setProductImageValue('');"
)

# 4. Remove bindImageUploadSection() calls
content = re.sub(r'\s*bindImageUploadSection\(\);?\s*', '', content)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Old upload functions removed!")
print("✓ setProductImageValue updated!")

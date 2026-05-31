import os, glob, re

files = glob.glob(r'c:\Users\aarez\OneDrive\Documents\Desktop\PlantTalk Ai\app\src\screens\*.jsx')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove 'Upgrade to Pro' block using regex.
    content = re.sub(r'<div className=\"mt-auto[^>]*>.*?Upgrade to Pro.*?</button>\s*</div>', '', content, flags=re.DOTALL)
    
    # For Settings.jsx, remove 'System API Access'
    if 'Settings.jsx' in f:
        content = re.sub(r'\{/\* System Token \*/\}\s*<div.*?System API Access.*?</div>\s*</div>\s*</div>', '', content, flags=re.DOTALL)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

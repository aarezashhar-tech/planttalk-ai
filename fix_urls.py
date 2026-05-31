import os
import glob

directory = r'c:\Users\aarez\OneDrive\Documents\Desktop\PlantTalk Ai\app\src'
count = 0
for filepath in glob.glob(directory + '/**/*.jsx', recursive=True) + glob.glob(directory + '/**/*.js', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'http://localhost:8000/api' in content:
        content = content.replace('http://localhost:8000/api', '/api')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
        print(f"Updated {filepath}")
print(f"Total files updated: {count}")

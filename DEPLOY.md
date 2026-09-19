# AI STUDY — Netlify Deploy Guide

## Steps:

### 1. GitHub pe push karo:
```bash
git init
git add .
git commit -m "AI STUDY v1.0.0"
git remote add origin https://github.com/yourusername/ai-study.git
git push -u origin main
```

### 2. Netlify mein:
1. netlify.com pe jao
2. "Add new site" → "Import from Git"
3. GitHub repo select karo
4. Build settings:
   - Build command: npm run build
   - Publish directory: dist
5. "Deploy site" click karo

### 3. Environment Variables add karo:
1. Site settings → Environment variables
2. Add: GEMINI_API_KEY = your_key_here
3. Redeploy karo

### 4. Custom domain (optional):
Site settings → Domain management

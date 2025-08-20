# 🎨 Sogni AI Integration Guide

## ✅ Integration Status

The Sogni AI image generation has been successfully integrated into the wellness NFT application. Here's what has been implemented:

### 🔧 Fixed Issues

1. **✅ Added Missing Dependencies**: `@sogni-ai/sogni-client` added to package.json
2. **✅ Created Environment Template**: `env.example` with required credentials
3. **✅ Added CORS Configuration**: Allows playground to call sogni-api
4. **✅ Connected Real API**: Replaced mock image generation with actual Sogni API calls
5. **✅ Fixed React Hooks**: Corrected useBalance hook in LandingPage component
6. **✅ Created Modal Component**: Added missing Modal component for feature details

### 🏗️ Architecture

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Playground        │    │   Sogni API         │    │   Sogni AI Service  │
│   (localhost:3000)  │───▶│   (localhost:3002)  │───▶│   (Cloud)           │
│                     │    │                     │    │                     │
│ • User selects theme│    │ • Receives prompt   │    │ • Generates image   │
│ • Calls API         │    │ • Calls Sogni AI    │    │ • Returns URL       │
│ • Displays image    │◀───│ • Returns image URL │◀───│                     │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🚀 Setup Instructions

### 1. Install Sogni API Dependencies

```bash
cd packages/sogni-api
./setup.sh
```

Or manually:
```bash
cd packages/sogni-api
npm install
cp env.example .env.local
```

### 2. Configure Sogni AI Credentials

Edit `packages/sogni-api/.env.local`:

```env
SOGNI_APP_ID=your_sogni_app_id_here
SOGNI_USER=your_sogni_username_here
SOGNI_PASS=your_sogni_password_here
```

### 3. Start Services

#### Terminal 1 - Sogni API Service
```bash
cd packages/sogni-api
npm run dev
# Runs on http://localhost:3002
```

#### Terminal 2 - Playground Application
```bash
cd packages/playground
npm run dev
# Runs on http://localhost:3000
```

### 4. Test Integration

```bash
cd packages/sogni-api
node test-api.js
```

Or test manually:
```bash
curl -X POST http://localhost:3002/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"wellness NFT artwork, nature theme"}'
```

## 🎯 How It Works

### User Flow
1. **User Opens App**: Visits playground at `localhost:3000`
2. **Selects Theme**: Chooses wellness artwork theme (nature, geometric, etc.)
3. **Generates Image**: Clicks "Generate Image" button
4. **API Call**: Frontend calls `localhost:3002/api/generate`
5. **Sogni Processing**: API forwards request to Sogni AI service
6. **Image Return**: Generated image URL returned and displayed
7. **NFT Ready**: Image ready for NFT minting

### Technical Flow
```typescript
// 1. User triggers image generation
const generateWellnessImage = async () => {
  const prompt = "nature wellness NFT artwork, high quality, digital art";
  
  // 2. Call Sogni API
  const data = await apiGenerateImage(prompt);
  
  // 3. Display generated image
  setGeneratedImageUrl(data.imageUrls[0]);
};
```

## 📁 File Changes Made

### Sogni API Service
- `packages/sogni-api/package.json` - Added @sogni-ai/sogni-client dependency
- `packages/sogni-api/next.config.ts` - Added CORS configuration
- `packages/sogni-api/app/api/generate/route.ts` - Enhanced error handling and logging
- `packages/sogni-api/env.example` - Environment template
- `packages/sogni-api/README.md` - Updated documentation
- `packages/sogni-api/setup.sh` - Automated setup script
- `packages/sogni-api/test-api.js` - Integration test script

### Playground Application
- `packages/playground/lib/api.ts` - Added generateWellnessImage function
- `packages/playground/components/demo/LandingPage.tsx` - Connected to real API
- `packages/playground/components/demo/Modal.tsx` - New modal component

## 🔍 Testing

### Manual Testing
1. Start both services (sogni-api and playground)
2. Open `http://localhost:3000` in browser
3. Navigate to wellness journey
4. Select an image theme
5. Click "Generate Image"
6. Verify real image is generated (not placeholder)

### Automated Testing
```bash
cd packages/sogni-api
node test-api.js
```

## 🐛 Troubleshooting

### Issue: NPM Installation Fails
**Solution**: Try these steps:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: CORS Errors
**Solution**: Verify `next.config.ts` has CORS headers configured

### Issue: Sogni API Authentication
**Solution**: Check `.env.local` has correct credentials

### Issue: Port Conflicts
**Solution**: Services run on different ports:
- Playground: 3000
- Sogni API: 3002
- Backend: 3001

## 🔐 Security Notes

- Environment files (`.env.local`) are gitignored
- CORS is configured for development (localhost)
- For production, restrict CORS to specific domains
- Sogni AI credentials should be kept secure

## 🚀 Production Deployment

### Environment Variables
Set these in your production environment:
```env
SOGNI_APP_ID=prod_app_id
SOGNI_USER=prod_username
SOGNI_PASS=prod_password
```

### CORS Configuration
Update `next.config.ts` for production domains:
```typescript
headers: [
  { key: "Access-Control-Allow-Origin", value: "https://your-domain.com" },
]
```

## 🎉 Success Indicators

✅ **Integration Complete** when:
- Sogni API service starts without errors
- Playground connects to API successfully
- Real images generate (not placeholders)
- No CORS errors in browser console
- Test script returns image URLs

## 📞 Support

If you encounter issues:
1. Check both services are running
2. Verify environment variables
3. Test API endpoint directly
4. Check browser console for errors
5. Review Sogni AI documentation for credential setup

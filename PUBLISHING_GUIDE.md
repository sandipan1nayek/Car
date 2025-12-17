# 📱 UBAR App - Publishing Guide

## ✅ App Configuration Complete

Your app is now configured with:
- **App Name**: UBAR - Ride Sharing
- **Package**: com.ubar.ridesharing
- **Version**: 1.0.0
- **EAS Project ID**: f7931b24-047a-4ed4-97c3-2fd173560845

## 🚀 Publishing Options

### Option 1: Build APK (Android) - EAS Build

To build an installable APK:

```bash
cd mobile
eas build --platform android --profile preview
```

**Follow the prompts:**
1. Generate new Android Keystore? → **Yes**
2. Wait for build to complete (15-20 minutes)
3. Download APK from the provided link
4. Install on Android device

### Option 2: Expo Go (Development)

Currently running! Users can:
1. Install **Expo Go** app from Play Store
2. Scan the QR code shown in terminal
3. App loads instantly for testing

### Option 3: Google Play Store (Production)

For official Play Store release:

```bash
cd mobile
eas build --platform android --profile production
```

Then submit:
```bash
eas submit --platform android
```

## 📋 Pre-Publishing Checklist

Before publishing, ensure:

### Backend (Production Ready)
- ✅ MongoDB Atlas configured
- ✅ Environment variables set in `.env`
- ⚠️ Update `FRONTEND_URL` to production URL
- ⚠️ Deploy backend to cloud service (Railway, Render, Heroku)
- ⚠️ Get production backend URL

### Mobile App
- ⚠️ Update API_URL in `mobile/src/services/api.js`
  ```javascript
  const API_URL = 'https://your-backend-url.com/api';
  ```
- ✅ App icons and splash screen configured
- ✅ Permissions (location) added
- ✅ Package name set

### Required Services
- ⚠️ **Google Maps API Key** (for production maps)
  - Get key from: https://console.cloud.google.com/
  - Add to `.env`: `GOOGLE_MAPS_API_KEY=your_key`
  
- ⚠️ **Cloudinary** (for image uploads)
  - Sign up: https://cloudinary.com/
  - Add credentials to `.env`

- ⚠️ **Resend** (for emails)
  - Sign up: https://resend.com/
  - Add API key to `.env`

## 🔧 Backend Deployment

### Deploy to Railway (Recommended)

1. Push code to GitHub
2. Go to https://railway.app/
3. Create new project → Deploy from GitHub
4. Select your repository
5. Add environment variables from `.env`
6. Deploy!
7. Get your production URL

### Update Mobile App API URL

After backend is deployed:

```bash
cd mobile/src/services/api.js
```

Change:
```javascript
const API_URL = 'https://your-railway-app.railway.app/api';
```

## 📦 Current Build Commands

### Android APK (for testing)
```bash
cd mobile
eas build --platform android --profile preview
```

### Android AAB (for Play Store)
```bash
cd mobile
eas build --platform android --profile production
```

### iOS (requires Apple Developer account)
```bash
cd mobile
eas build --platform ios --profile production
```

## 🌐 Current Status

- ✅ **Development**: Running with Expo Go
- ✅ **Backend**: Running locally on port 5000
- ⏳ **Production**: Ready for deployment
- 📱 **Build**: EAS configured and ready

## 📝 Next Steps

1. **Test thoroughly** with current Expo Go setup
2. **Deploy backend** to Railway/Render
3. **Update API URL** in mobile app
4. **Build APK** with `eas build`
5. **Distribute** APK or publish to Play Store

## 🆘 Troubleshooting

### Build fails with keystore error
```bash
eas credentials
```
Select "Android" → "Remove keystore" → Try build again

### App can't connect to backend
- Check API_URL in `mobile/src/services/api.js`
- Ensure backend is running and accessible
- Check firewall/network settings

## 📱 Testing the Current App

Your app is ready to test right now:

1. Open **Expo Go** on your Android phone
2. Scan the QR code in the terminal
3. App loads with all features working!

**Test Accounts:**
- Admin: saniya.cse123125@bppimt.ac.in / Saniya@1
- Manager: sandipan.cse123123@bppimt.ac.in / Sandipan@1
- Real Driver: rupnandan.cse123113@bppimt.ac.in / (password they set)

---

**Note**: For production release, you MUST deploy the backend and update API URLs before building the final APK.

# 🚀 QUICK START GUIDE

Get the ride-sharing app running in 5 minutes!

---

## ⚡ FASTEST WAY TO TEST

### Step 1: Start Backend (1 minute)
```bash
cd backend
npm install
node createAdmin.js
npm run dev
```

✅ **Backend running at:** http://localhost:5000

---

### Step 2: Start Mobile App (2 minutes)
```bash
cd mobile
npm install
npm start
```

✅ **Scan QR code** with Expo Go app on your phone!

---

### Step 3: Test on Phone (2 minutes)

1. **Download Expo Go:**
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scan QR Code:**
   - Android: Open Expo Go → Scan QR
   - iOS: Open Camera → Scan QR → Tap notification

3. **Login/Signup:**
   - Create new account or
   - Use admin: admin@carapp.com / Admin@123

4. **Book a Ride:**
   - Tap "Select Pickup Location"
   - Choose any location
   - Tap "Select Dropoff Location"
   - Choose destination
   - See fare → Book Ride!

---

## 🔧 Configuration (if needed)

### For Physical Device Testing:

1. **Find your IP:**
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. **Update these files:**
   
   **mobile/src/services/api.js:**
   ```javascript
   const API_URL = 'http://YOUR_IP:5000/api';
   ```
   
   **mobile/src/services/socket.js:**
   ```javascript
   const SOCKET_URL = 'http://YOUR_IP:5000';
   ```

---

## 📱 WHAT TO TEST

### Customer Flow:
1. ✅ Signup → Create account
2. ✅ Login → Access app
3. ✅ Home → Book ride
4. ✅ Wallet → Add money
5. ✅ Profile → View info

### Driver Flow (if driver approved):
1. ✅ Driver tab → See dashboard
2. ✅ Go Online → Toggle status
3. ✅ View Earnings → See stats

---

## 🎯 DEMO LOCATIONS

Choose from these preset locations:
- Times Square, NY
- Central Park, NY
- Statue of Liberty, NY
- Brooklyn Bridge, NY
- Empire State Building, NY

---

## ⚠️ TROUBLESHOOTING

**App won't connect?**
- Check backend is running (port 5000)
- Use IP address instead of localhost
- Same WiFi for phone and computer

**Maps not showing?**
- Normal for first run
- Try Android emulator or iOS simulator
- Or build standalone app

**QR code not scanning?**
- Make sure Expo Go is installed
- Try camera app instead (iOS)
- Or press 'w' for web version

---

## 📚 FULL DOCUMENTATION

- **Complete Guide:** [README_COMPLETE.md](README_COMPLETE.md)
- **API Docs:** [backend/README_API.md](backend/README_API.md)
- **Mobile Guide:** [mobile/README.md](mobile/README.md)
- **Final Report:** [PROJECT_FINAL_REPORT.md](PROJECT_FINAL_REPORT.md)

---

## 🎉 YOU'RE READY!

**Backend:** 🟢 Running  
**Mobile:** 🟢 QR Code Ready  
**Status:** ✅ All Systems Go

**Now scan the QR code and start testing!**

---

**Need Help?** Check the documentation files above!

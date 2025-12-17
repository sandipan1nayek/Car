# UBAR - Ride Sharing App Project Plan

**Project Type:** Mobile Application (Uber-like)  
**Platform:** Expo CLI (React Native)  
**Deployment:** Expo Go  
**Budget:** $0 (100% Free Tier Stack)  
**Date:** December 17, 2025

---

## 🎯 PROJECT OVERVIEW

A full-featured ride-sharing mobile application with role-based access control where all users start as customers and can be granted additional privileges (Driver, Manager, Admin) with conditional UI overlays.

---

## 🏗️ ARCHITECTURE MODEL

### **Base Role + Privileged Feature Overlay**

**Core Concept:**
- Everyone who logs in is a **Customer** (base role)
- Special roles (Driver, Manager, Admin) are **additive privileges**
- Single unified app with conditional UI sections
- Security enforced at backend, not frontend visibility

**Why This Design:**
- Reduces code duplication
- Single app, multiple personas
- Clean UX without role-switching
- Industry-standard pattern

---

## 👥 ROLE SYSTEM (DETAILED)

### **User Schema Structure**
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  name: String,
  phone: String,
  profilePicture: String (URL),
  
  // Base Role
  role_base: "customer", // Everyone is customer
  
  // Privilege Flags (Additive)
  is_driver: Boolean (default: false),
  is_manager: Boolean (default: false),
  is_admin: Boolean (default: false),
  
  // Driver Specific
  driver_application_status: null | "pending" | "approved" | "rejected",
  driver_status: "offline" | "online",
  driver_documents: {
    license: String (URL),
    vehicle_registration: String (URL),
    insurance: String (URL)
  },
  vehicle_info: {
    make: String,
    model: String,
    year: Number,
    plate: String,
    color: String
  },
  driver_rating: Number (default: 5.0),
  total_rides_completed: Number (default: 0),
  
  // Wallet
  wallet_balance: Number (default: 0),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 ROLE DEFINITIONS & ACCESS MATRIX

### **1. CUSTOMER (Base Role - Everyone)**
**Access:**
- ✅ Book rides
- ✅ View ride history
- ✅ Chat support
- ✅ Manage wallet (add money, view transactions)
- ✅ Rate drivers
- ✅ Edit profile
- ✅ Apply for driver role

**UI Visible:**
- Home (Book Ride)
- Chat
- Wallet
- Profile

**Cannot See:**
- Driver Section
- Manager Panel
- Admin Panel

---

### **2. DRIVER (Customer + Driver Privileges)**
**How to Become Driver:**
1. Customer applies via "Become a Driver" in Profile
2. Submits documents (license, vehicle, insurance)
3. Admin reviews and approves/rejects
4. Upon approval: `is_driver = true`

**Additional Access:**
- ✅ All customer features
- ✅ Go online/offline
- ✅ Receive ride requests (real-time)
- ✅ Accept/Reject rides
- ✅ Navigate to pickup location
- ✅ Start/End trip
- ✅ View earnings dashboard
- ✅ Update vehicle info
- ✅ View driver-specific ratings

**Additional UI:**
- Profile → **[Driver Section]** button appears
  - Go Online/Offline toggle
  - Active Ride Screen
  - Ride Requests Screen
  - Earnings Dashboard
  - Driver Statistics

**Backend Behavior:**
- Only drivers with `is_driver=true` AND `driver_status="online"` are shown in ride matching
- Offline drivers are hidden from customers

---

### **3. MANAGER (Customer + Manager Privileges)**
**How Created:**
- Manually created by Admin in backend/database
- Cannot signup as manager

**Additional Access:**
- ✅ All customer features
- ✅ View all users list
- ✅ Monitor all active rides in real-time
- ✅ Access support chat system
- ✅ View driver locations on map
- ✅ Generate reports (daily/weekly)
- ✅ Handle customer complaints

**Additional UI:**
- Profile → **[Manager Panel]** button appears
  - Users Management
  - Active Rides Monitor
  - Support Chat Inbox
  - Reports & Analytics
  - Driver Locations Map

**Email Notifications:**
- New support chat message
- Urgent ride issue reported
- Daily summary report (optional)

---

### **4. ADMIN (Customer + Admin Privileges)**
**How Created:**
- Manually created in backend/database
- Super user with full control

**Additional Access:**
- ✅ All customer features
- ✅ Approve/Reject driver applications
- ✅ Suspend/Unsuspend users
- ✅ Create/Remove managers
- ✅ View all feedback/ratings
- ✅ System analytics dashboard
- ✅ Enforce platform rules
- ✅ Manage pricing/fare rules

**Additional UI:**
- Profile → **[Admin Panel]** button appears
  - Driver Applications (Pending/Approved/Rejected)
  - User Management (Suspend/Unsuspend)
  - Manager Management (Create/Remove)
  - Feedback & Ratings Review
  - System Analytics
  - Platform Settings

**Email Notifications:**
- New driver application submitted
- New user feedback/complaint received
- Critical system alerts

---

## 🔒 SECURITY MODEL

### **Frontend (UI Visibility)**
```javascript
// Conditional Rendering
{user.is_driver && <DriverSectionButton />}
{user.is_manager && <ManagerPanelButton />}
{user.is_admin && <AdminPanelButton />}
```

**⚠️ Frontend security is NOT real security - only for UX**

---

### **Backend (Real Security)**
```javascript
// Middleware on every protected route
const requireDriver = (req, res, next) => {
  if (!req.user.is_driver) return res.status(403).json({ error: "Forbidden" });
  next();
};

const requireManager = (req, res, next) => {
  if (!req.user.is_manager) return res.status(403).json({ error: "Forbidden" });
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user.is_admin) return res.status(403).json({ error: "Forbidden" });
  next();
};
```

**Protected Routes:**
- `/api/driver/*` → requires `is_driver = true`
- `/api/manager/*` → requires `is_manager = true`
- `/api/admin/*` → requires `is_admin = true`

**Even if a customer:**
- Modifies frontend code
- Guesses API endpoints
- Sends manual requests

**They will be blocked by backend role checks.**

---

## 📱 APP STRUCTURE

### **Navigation Architecture**

```
App Root
├─ Auth Stack (if not logged in)
│  ├─ Login Screen
│  ├─ Signup Screen
│  └─ Forgot Password Screen
│
└─ Main App (if logged in)
   ├─ Tab Navigator (Bottom Tabs - Everyone sees this)
   │  ├─ Home Tab
   │  │  ├─ Map Screen (Book Ride)
   │  │  └─ Ride Details Screen
   │  │
   │  ├─ Chat Tab
   │  │  ├─ Chat List Screen
   │  │  └─ Chat Conversation Screen
   │  │
   │  ├─ Wallet Tab
   │  │  ├─ Wallet Screen
   │  │  ├─ Add Money Screen
   │  │  └─ Transaction History Screen
   │  │
   │  └─ Profile Tab
   │     ├─ Profile Screen
   │     ├─ Edit Profile Screen
   │     ├─ Settings Screen
   │     ├─ Ride History Screen
   │     └─ [Conditional Role Buttons]
   │
   ├─ Driver Stack (only if is_driver = true)
   │  ├─ Driver Dashboard Screen
   │  ├─ Go Online/Offline Screen
   │  ├─ Incoming Ride Request Screen
   │  ├─ Active Trip Screen
   │  ├─ Earnings Screen
   │  └─ Driver Stats Screen
   │
   ├─ Manager Stack (only if is_manager = true)
   │  ├─ Manager Dashboard Screen
   │  ├─ Users List Screen
   │  ├─ Active Rides Monitor Screen
   │  ├─ Support Chat System Screen
   │  └─ Reports Screen
   │
   └─ Admin Stack (only if is_admin = true)
      ├─ Admin Dashboard Screen
      ├─ Driver Applications Screen
      ├─ Application Detail Screen
      ├─ User Management Screen
      ├─ Manager Management Screen
      ├─ Feedback Review Screen
      └─ System Analytics Screen
```

---

## 🎨 UI/UX DESIGN THEME

### **Color Scheme (Modern Minimal - Uber Inspired)**
```
Primary Color:    #000000 (Black)
Accent Color:     #00D9A3 (Teal Green)
Background:       #FFFFFF (White)
Surface:          #F7F7F7 (Light Gray)
Text Primary:     #333333 (Dark Gray)
Text Secondary:   #888888 (Medium Gray)
Error:            #FF3B30 (Red)
Success:          #34C759 (Green)
Warning:          #FF9500 (Orange)
```

### **Design Principles**
- **Minimalist:** Clean, uncluttered interface
- **Bold Typography:** Clear headings, readable fonts
- **Rounded Corners:** 12px for cards, 24px for buttons
- **Floating Action Buttons:** For primary actions
- **Full-Screen Map:** Maximizes visibility
- **Bottom Sheets:** For ride details, driver info
- **Subtle Shadows:** For depth (elevation: 2-4)

### **Typography**
- **Headings:** Bold, 24-32px
- **Body Text:** Regular, 16px
- **Captions:** Regular, 14px
- **Buttons:** SemiBold, 16px

### **Components**
- **Buttons:** Full-width, rounded, bold text
- **Cards:** White background, rounded, subtle shadow
- **Input Fields:** Outlined, rounded, with icons
- **Maps:** Full-screen with floating overlay
- **Tabs:** Bottom navigation with icons + labels

---

## ⚡ CORE FEATURES (DETAILED)

### **1. AUTHENTICATION**
- **Signup:** Email, Password, Name, Phone
- **Login:** Email + Password
- **Forgot Password:** Email-based reset
- **JWT Token:** Stored securely in AsyncStorage
- **Auto-login:** If token exists and valid
- **Logout:** Clear token, redirect to login

---

### **2. HOME - BOOK RIDE (Customer)**

**Flow:**
1. User opens app → sees map with current location
2. Search pickup location (autocomplete)
3. Search destination location (autocomplete)
4. App calculates distance and fare
5. Shows fare estimate + available vehicle types
6. User confirms booking
7. Backend searches for nearby online drivers
8. Request sent to nearest driver via Socket.io
9. Driver accepts → Customer sees driver details
10. Real-time driver location tracking
11. Driver arrives → Starts trip
12. Customer sees route progress
13. Driver completes trip
14. Both rate each other
15. Payment deducted from wallet

**Features:**
- ✅ Current location detection (GPS)
- ✅ Search location (Google Places Autocomplete)
- ✅ Distance calculation (Google Directions API)
- ✅ Fare estimation (distance × rate + base fare)
- ✅ Real-time driver location (Socket.io)
- ✅ Trip status updates (Requested → Assigned → En Route → Completed)
- ✅ In-app navigation (Google Maps)
- ✅ Cancel ride (before driver arrives)
- ✅ Emergency button (SOS - sends alert to manager)

**Fare Calculation Logic:**
```javascript
baseFare = 50 (currency units)
perKmRate = 15
minimumFare = 50

estimatedFare = baseFare + (distance_km × perKmRate)
if (estimatedFare < minimumFare) estimatedFare = minimumFare

// Add surge pricing (optional for demo)
if (high_demand) estimatedFare *= 1.5
```

---

### **3. DRIVER SECTION**

**A. Apply to be Driver (Customer)**
- Form: Name, Phone, Email (pre-filled)
- Upload Documents:
  - Driver's License (front/back)
  - Vehicle Registration
  - Insurance Certificate
- Vehicle Details: Make, Model, Year, Plate, Color
- Submit → Status: "Pending"
- Email sent to Admin

**B. Driver Dashboard (After Approval)**
- **Go Online/Offline Toggle:**
  - Online: Driver visible to customers, receives requests
  - Offline: Driver hidden, no requests
- **Current Status Indicator:**
  - "Available" (online, no active ride)
  - "En Route to Pickup"
  - "Trip in Progress"
  - "Offline"

**C. Incoming Ride Request Screen**
- Shows when customer books ride
- Display:
  - Customer name
  - Pickup location (distance from driver)
  - Destination
  - Estimated fare
  - Estimated time to pickup
- Actions:
  - Accept (30 second timer)
  - Reject
- If rejected/timeout → request goes to next nearest driver

**D. Active Trip Screen**
- **Pickup Phase:**
  - Customer details
  - Pickup location with navigation
  - ETA to pickup
  - "Call Customer" button
  - "Start Trip" button (enabled when near pickup)
  
- **Trip Phase:**
  - Destination with navigation
  - Customer in car
  - Trip timer
  - Distance covered
  - "End Trip" button

**E. Earnings Dashboard**
- Today's earnings
- Weekly earnings
- Monthly earnings
- Total earnings
- Ride count
- Average rating
- Graph visualization

---

### **4. WALLET SYSTEM**

**For Customers:**
- **Balance Display:** Current wallet balance
- **Add Money:** 
  - Enter amount
  - Payment simulation (for demo - instant credit)
  - Real integration: Stripe/PayPal/Razorpay
- **Transaction History:**
  - Type: "Ride Payment" / "Added Money" / "Refund"
  - Amount
  - Date/Time
  - Balance after transaction
- **Auto-deduction:** After ride completes

**For Drivers:**
- **Earnings Balance:** Money earned from rides
- **Withdraw:** Transfer to bank (simulation for demo)
- **Transaction History:**
  - Earnings per ride
  - Withdrawals
  - Date/Time
- **Auto-credit:** After ride completes (85% to driver, 15% platform fee)

---

### **5. CHAT SUPPORT**

**Customer → Support:**
- Open chat from Chat tab
- Send message → goes to Manager inbox
- Real-time messaging (Socket.io)
- Message status: Sent, Delivered, Read

**Manager Inbox:**
- List of all chat conversations
- Unread count badge
- Click to open conversation
- Reply to customer
- Mark as resolved
- Email notification when new message arrives

---

### **6. RATING SYSTEM**

**After Ride Completion:**
- Both customer and driver rate each other
- 1-5 stars
- Optional comment
- Cannot skip (required to close ride)

**Rating Display:**
- Driver profile shows average rating
- Customer can see driver rating before ride
- Admin can view all ratings and comments

---

### **7. MANAGER PANEL**

**Dashboard:**
- Total users count
- Active rides count
- Total rides today
- Revenue today

**Users Management:**
- Search users by name/email/phone
- View user details
- View user ride history
- View user ratings

**Active Rides Monitor:**
- Real-time list of ongoing rides
- Map view with all active rides
- Driver and customer locations
- Ride status

**Support Chat System:**
- Inbox with all customer chats
- Unread messages highlighted
- Reply to customers
- Mark as resolved

**Reports:**
- Daily ride report
- Weekly revenue report
- Driver performance report
- Download as CSV

---

### **8. ADMIN PANEL**

**Dashboard:**
- Total users
- Total drivers
- Pending driver applications
- Total rides
- Revenue (all-time)
- Active rides now

**Driver Applications:**
- **Pending Tab:**
  - List of pending applications
  - Click to view details
  - View uploaded documents
  - Approve/Reject buttons
  - Email sent on action
  
- **Approved Tab:**
  - List of approved drivers
  
- **Rejected Tab:**
  - List of rejected applications

**User Management:**
- Search all users
- View user details
- Suspend user (cannot login)
- Unsuspend user
- Delete user (soft delete)

**Manager Management:**
- Create new manager account
- Email, Password, Name, Phone
- Set `is_manager = true`
- Remove manager (set `is_manager = false`)
- List all managers

**Feedback Review:**
- All ratings and comments
- Filter by:
  - Low ratings (1-2 stars)
  - Driver-specific
  - Date range
- Take action on bad drivers (suspend)

**System Analytics:**
- Total revenue (all-time)
- Rides per day (graph)
- Active users (graph)
- Top drivers (by earnings/ratings)
- Peak hours analysis

---

## 📧 EMAIL NOTIFICATION SYSTEM

### **Email Service: Resend.com**
- **Free Tier:** 3,000 emails/month
- **API Key:** Stored in .env
- **Library:** Nodemailer + Resend

### **Email Templates**

**1. Driver Application Submitted → Admin**
```
Subject: 🚗 New Driver Application - [Driver Name]

Hi Admin,

A new driver application has been submitted:

Driver Details:
- Name: John Doe
- Email: john@example.com
- Phone: +1234567890
- Vehicle: Toyota Camry 2022

Please review and approve/reject in the Admin Panel.

[View Application]

---
UBAR Platform
```

**2. Driver Application Approved → Driver**
```
Subject: ✅ Your Driver Application is Approved!

Hi [Driver Name],

Congratulations! Your driver application has been approved.

You can now:
✅ Go online in the Driver Section
✅ Start accepting ride requests
✅ Earn money on every trip

Get started now by opening the app and going online!

[Open App]

---
UBAR Platform
```

**3. Driver Application Rejected → Driver**
```
Subject: ❌ Driver Application Update

Hi [Driver Name],

We regret to inform you that your driver application has not been approved at this time.

Reason: [Admin comment]

You can reapply after addressing the issues.

For questions, contact support@ubar.com

---
UBAR Platform
```

**4. New Support Message → Manager**
```
Subject: 💬 New Support Chat from Customer

Hi Manager,

A new support message has been received:

Customer: Jane Smith
Email: jane@example.com
Message: "I was overcharged for my last ride"
Time: 2:30 PM, Dec 17, 2025

Please respond promptly in the Manager Panel.

[View Message]

---
UBAR Platform
```

**5. Ride Completed → Customer (Receipt)**
```
Subject: 🚗 Ride Receipt - UBAR

Hi [Customer Name],

Your ride has been completed successfully!

Ride Details:
- Date: Dec 17, 2025
- Pickup: 123 Main St
- Drop-off: 456 Park Ave
- Distance: 8.5 km
- Duration: 23 minutes
- Fare: $85.00

Driver: John Doe ⭐ 4.8

Thank you for choosing UBAR!

[View Full Receipt]

---
UBAR Platform
```

**6. Weekly Earnings Summary → Driver**
```
Subject: 💰 Your Weekly Earnings Summary

Hi [Driver Name],

Here's your earnings summary for this week:

📊 This Week (Dec 11-17):
- Total Earnings: $450.00
- Rides Completed: 32
- Average per Ride: $14.06
- Hours Online: 28.5h
- Rating: ⭐ 4.9

Keep up the great work!

[View Detailed Report]

---
UBAR Platform
```

### **Email Notification Triggers**

| Event | Recipient | Template |
|-------|-----------|----------|
| Driver applies | All Admins | driver_application_submitted |
| Admin approves driver | Driver | driver_approved |
| Admin rejects driver | Driver | driver_rejected |
| New support chat message | All Managers | support_message_received |
| Ride completed | Customer | ride_receipt |
| Weekly summary (Sunday) | All Drivers | weekly_earnings |
| User suspended | User | account_suspended |
| Critical system error | All Admins | system_alert |

### **Email Preferences (In User Profile)**
```javascript
email_preferences: {
  ride_receipts: Boolean (default: true),
  promotional: Boolean (default: true),
  weekly_summary: Boolean (default: true), // for drivers
  critical_alerts: true, // cannot disable for admin/manager
}
```

---

## 🛠️ TECH STACK (100% FREE)

### **Frontend**
| Technology | Purpose | Free Tier |
|------------|---------|-----------|
| **Expo SDK 51+** | React Native framework | ✅ Free forever |
| **React Navigation** | App navigation | ✅ Free |
| **React Native Maps** | Map display | ✅ Free |
| **Expo Location** | GPS tracking | ✅ Free |
| **Socket.io-client** | Real-time communication | ✅ Free |
| **Axios** | API requests | ✅ Free |
| **AsyncStorage** | Local storage (tokens) | ✅ Free |
| **React Native Paper** | UI components | ✅ Free |
| **React Native Vector Icons** | Icons | ✅ Free |

### **Backend**
| Technology | Purpose | Free Tier |
|------------|---------|-----------|
| **Node.js + Express** | API server | ✅ Free |
| **Socket.io** | Real-time events | ✅ Free |
| **JWT (jsonwebtoken)** | Authentication | ✅ Free |
| **Bcrypt** | Password hashing | ✅ Free |
| **Mongoose** | MongoDB ORM | ✅ Free |
| **Nodemailer** | Email sending | ✅ Free |
| **Multer** | File uploads | ✅ Free |
| **Cors** | Cross-origin requests | ✅ Free |
| **Dotenv** | Environment variables | ✅ Free |

### **Database**
| Service | Free Tier | Limits |
|---------|-----------|--------|
| **MongoDB Atlas** | ✅ Free | 512MB storage, Shared cluster |

### **Storage (for profile pics, documents)**
| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Cloudinary** | ✅ Free | 25GB storage, 25GB bandwidth/month |

### **Maps & Location**
| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Google Maps API** | ✅ Free | $200 credit/month (~28,000 map loads) |
| **Google Places API** | ✅ Free | Included in $200 credit |
| **Google Directions API** | ✅ Free | Included in $200 credit |

### **Email Service**
| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Resend.com** | ✅ Free | 3,000 emails/month, 100/day |
| **SendGrid (Backup)** | ✅ Free | 100 emails/day |

### **Deployment**
| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Expo Go** | Mobile app hosting | ✅ Free forever |
| **Render.com** | Backend hosting | ✅ Free (750hrs/month) |

---

## 📊 DATA FLOW DIAGRAMS

### **1. RIDE BOOKING FLOW (End-to-End)**

```
[CUSTOMER APP]
1. Open app → Map loads with current location
2. Tap "Where to?" → Enter destination
3. App calculates route → Shows fare estimate
4. Customer confirms booking
   ↓
   [API: POST /api/rides/create]
   ↓
[BACKEND]
5. Create ride in DB (status: "REQUESTED")
6. Find online drivers within 5km radius
7. Sort by distance (nearest first)
8. Send Socket.io event to nearest driver
   ↓
   [Socket.io: "ride_request" → Driver App]
   ↓
[DRIVER APP]
9. Driver receives notification + ride details
10. Driver has 30 seconds to Accept/Reject
11. Driver clicks "Accept"
   ↓
   [API: POST /api/rides/:id/accept]
   ↓
[BACKEND]
12. Update ride status → "ASSIGNED"
13. Send Socket.io event to customer
   ↓
   [Socket.io: "ride_assigned" → Customer App]
   ↓
[CUSTOMER APP]
14. Shows driver details (name, photo, car, rating)
15. Shows driver location in real-time
   ↓
[DRIVER APP]
16. Driver starts navigation to pickup
17. Sends location updates every 5 seconds
   ↓
   [Socket.io: "driver_location" → Customer App]
   ↓
[CUSTOMER APP]
18. Updates driver location on map
   ↓
[DRIVER APP]
19. Driver arrives at pickup
20. Clicks "Start Trip"
   ↓
   [API: POST /api/rides/:id/start]
   ↓
[BACKEND]
21. Update ride status → "EN_ROUTE"
22. Send Socket.io event to customer
   ↓
[CUSTOMER & DRIVER APPS]
23. Trip in progress (real-time location tracking)
   ↓
[DRIVER APP]
24. Driver arrives at destination
25. Clicks "End Trip"
   ↓
   [API: POST /api/rides/:id/complete]
   ↓
[BACKEND]
26. Calculate final fare (distance × rate)
27. Deduct from customer wallet
28. Add to driver wallet (85% of fare)
29. Update ride status → "COMPLETED"
30. Send Socket.io events
31. Send email receipt to customer
   ↓
[CUSTOMER & DRIVER APPS]
32. Show rating screen
33. Both rate each other
   ↓
   [API: POST /api/rides/:id/rate]
   ↓
[BACKEND]
34. Update ratings
35. Close ride
```

---

### **2. DRIVER APPLICATION FLOW**

```
[CUSTOMER APP - Profile Screen]
1. Customer clicks "Become a Driver"
2. Fills form + uploads documents
3. Submits application
   ↓
   [API: POST /api/driver/apply]
   ↓
[BACKEND]
4. Save application (status: "PENDING")
5. Send email to all admins
   ↓
   [Email: "New Driver Application"]
   ↓
[ADMIN EMAIL]
6. Admin receives email notification
7. Opens Admin Panel in app
   ↓
[ADMIN APP]
8. Views pending application
9. Reviews documents
10. Clicks "Approve" or "Reject"
   ↓
   [API: POST /api/admin/driver/:id/approve]
   ↓
[BACKEND]
11. Update user: is_driver = true
12. Update application status = "APPROVED"
13. Send email to driver
   ↓
   [Email: "Application Approved"]
   ↓
[DRIVER EMAIL]
14. Driver receives approval email
15. Opens app
   ↓
[DRIVER APP]
16. Sees new "Driver Section" button in Profile
17. Clicks to enter Driver Section
18. Can now go online and accept rides
```

---

### **3. REAL-TIME LOCATION TRACKING**

```
[DRIVER APP - When Online]
1. Start location tracking (every 5 seconds)
2. Send location to backend
   ↓
   [Socket.io: "driver_location_update"]
   ↓
[BACKEND]
3. Save to DriverLocation collection
4. If driver has active ride:
   → Forward to customer via Socket.io
   ↓
   [Socket.io: "driver_location" → Customer App]
   ↓
[CUSTOMER APP]
5. Update driver marker on map
6. Recalculate ETA
7. Show on UI
```

---

### **4. CHAT SUPPORT FLOW**

```
[CUSTOMER APP - Chat Tab]
1. Customer types message
2. Sends message
   ↓
   [Socket.io: "customer_message"]
   ↓
[BACKEND]
3. Save message to DB
4. Find all online managers
5. Forward message to managers
6. Send email to all managers
   ↓
   [Socket.io: "new_support_message" → Manager App]
   [Email: "New Support Message"]
   ↓
[MANAGER APP]
7. Manager receives notification
8. Opens chat conversation
9. Types reply
   ↓
   [Socket.io: "manager_reply"]
   ↓
[BACKEND]
10. Save reply to DB
11. Forward to customer
   ↓
   [Socket.io: "support_reply" → Customer App]
   ↓
[CUSTOMER APP]
12. Customer sees reply in real-time
```

---

## 🚀 DEVELOPMENT ROADMAP

### **Phase 1: Backend Foundation (Day 1-2)**
- ✅ Set up Node.js + Express server
- ✅ Connect MongoDB Atlas
- ✅ Create User/Ride/Driver models (Mongoose schemas)
- ✅ Implement JWT authentication (signup, login, logout)
- ✅ Create basic API structure
- ✅ Set up Socket.io server
- ✅ Configure CORS and middleware
- ✅ Set up Cloudinary for image uploads
- ✅ Integrate Resend for emails
- ✅ Deploy backend to Render.com

**Deliverables:**
- API running on Render.com
- Database connected
- Basic auth working
- Socket.io server running

---

### **Phase 2: Customer Features (Day 3-4)**
- ✅ Expo project setup
- ✅ Navigation structure (Tab + Stack)
- ✅ Authentication screens (Login, Signup)
- ✅ Home screen with map
- ✅ Current location detection
- ✅ Search location (Google Places Autocomplete)
- ✅ Ride booking flow
- ✅ Real-time driver tracking
- ✅ Wallet system (add money, view balance)
- ✅ Ride history screen
- ✅ Rating screen
- ✅ Profile management
- ✅ Chat support

**Deliverables:**
- Fully functional customer app
- Can book rides
- Can track driver
- Can chat with support
- Can manage wallet

---

### **Phase 3: Driver Features (Day 5-6)**
- ✅ Driver application form
- ✅ Document upload (license, vehicle, insurance)
- ✅ Driver Section UI
- ✅ Go online/offline toggle
- ✅ Receive ride requests (Socket.io)
- ✅ Accept/Reject ride
- ✅ Navigation to pickup
- ✅ Start/End trip
- ✅ Earnings dashboard
- ✅ Driver statistics

**Deliverables:**
- Driver can apply
- Driver can go online
- Driver can accept rides
- Driver can complete trips
- Driver can view earnings

---

### **Phase 4: Manager Panel (Day 7)**
- ✅ Manager dashboard
- ✅ Users list with search
- ✅ Active rides monitor (real-time map)
- ✅ Support chat system (inbox)
- ✅ Reports generation
- ✅ Email notifications

**Deliverables:**
- Manager can view all users
- Manager can monitor rides
- Manager can handle support chats
- Manager receives email alerts

---

### **Phase 5: Admin Panel (Day 8-9)**
- ✅ Admin dashboard
- ✅ Driver applications screen
- ✅ Application detail view
- ✅ Approve/Reject functionality
- ✅ User management (suspend/unsuspend)
- ✅ Manager management (create/remove)
- ✅ Feedback review system
- ✅ System analytics
- ✅ Email notifications

**Deliverables:**
- Admin can approve drivers
- Admin can manage users
- Admin can create managers
- Admin can view analytics
- Email system fully functional

---

### **Phase 6: Testing & Polish (Day 10-11)**
- ✅ End-to-end testing (all flows)
- ✅ Fix bugs
- ✅ Optimize performance
- ✅ Add loading states
- ✅ Error handling
- ✅ UI/UX improvements
- ✅ Add animations
- ✅ Test on multiple devices
- ✅ Socket.io stability testing

**Deliverables:**
- Stable app with no critical bugs
- Smooth user experience
- All features tested

---

### **Phase 7: Deployment & Demo Prep (Day 12)**
- ✅ Publish to Expo Go
- ✅ Generate shareable link
- ✅ Create demo accounts:
  - Customer account
  - Driver account
  - Manager account
  - Admin account
- ✅ Prepare demo script
- ✅ Create README with setup instructions
- ✅ Record demo video (optional)

**Deliverables:**
- App accessible via Expo Go link
- Demo-ready with test accounts
- Documentation complete

---

## 📋 API ENDPOINTS

### **Authentication**
```
POST   /api/auth/signup          - Create new user
POST   /api/auth/login           - Login user
POST   /api/auth/logout          - Logout user
GET    /api/auth/me              - Get current user
POST   /api/auth/forgot-password - Send reset email
POST   /api/auth/reset-password  - Reset password
```

### **User (Customer)**
```
GET    /api/user/profile         - Get profile
PUT    /api/user/profile         - Update profile
PUT    /api/user/profile-picture - Upload profile picture
GET    /api/user/rides           - Get ride history
GET    /api/user/wallet          - Get wallet balance
POST   /api/user/wallet/add      - Add money to wallet
GET    /api/user/transactions    - Get transaction history
```

### **Rides**
```
POST   /api/rides/create         - Create new ride request
POST   /api/rides/:id/cancel     - Cancel ride
GET    /api/rides/:id            - Get ride details
POST   /api/rides/:id/rate       - Rate ride
GET    /api/rides/fare-estimate  - Calculate fare estimate
```

### **Driver (Protected - requires is_driver=true)**
```
POST   /api/driver/apply         - Apply to be driver
GET    /api/driver/application   - Get application status
PUT    /api/driver/vehicle       - Update vehicle info
POST   /api/driver/online        - Go online
POST   /api/driver/offline       - Go offline
POST   /api/driver/rides/:id/accept - Accept ride
POST   /api/driver/rides/:id/reject - Reject ride
POST   /api/driver/rides/:id/start  - Start trip
POST   /api/driver/rides/:id/complete - Complete trip
GET    /api/driver/earnings      - Get earnings
GET    /api/driver/stats         - Get driver statistics
POST   /api/driver/location      - Update driver location
```

### **Manager (Protected - requires is_manager=true)**
```
GET    /api/manager/dashboard    - Get dashboard stats
GET    /api/manager/users        - Get all users
GET    /api/manager/users/:id    - Get user details
GET    /api/manager/rides        - Get all rides
GET    /api/manager/rides/active - Get active rides
GET    /api/manager/chats        - Get support chats
POST   /api/manager/chats/:id/reply - Reply to chat
GET    /api/manager/reports      - Generate reports
```

### **Admin (Protected - requires is_admin=true)**
```
GET    /api/admin/dashboard               - Get dashboard stats
GET    /api/admin/driver-applications     - Get all applications
GET    /api/admin/driver-applications/:id - Get application details
POST   /api/admin/driver-applications/:id/approve - Approve driver
POST   /api/admin/driver-applications/:id/reject  - Reject driver
GET    /api/admin/users                   - Get all users
POST   /api/admin/users/:id/suspend       - Suspend user
POST   /api/admin/users/:id/unsuspend     - Unsuspend user
GET    /api/admin/managers                - Get all managers
POST   /api/admin/managers/create         - Create new manager
DELETE /api/admin/managers/:id            - Remove manager
GET    /api/admin/feedback                - Get all feedback
GET    /api/admin/analytics               - Get system analytics
```

### **Chat**
```
GET    /api/chat/conversations   - Get user's conversations
GET    /api/chat/:id/messages    - Get conversation messages
POST   /api/chat/send            - Send message
```

### **Socket.io Events**

**Client → Server:**
```
driver_location_update    - Driver sends location
customer_message          - Customer sends chat message
manager_reply             - Manager replies to chat
driver_online             - Driver goes online
driver_offline            - Driver goes offline
```

**Server → Client:**
```
ride_request              - New ride request to driver
ride_assigned             - Ride assigned to customer
ride_started              - Trip started
ride_completed            - Trip completed
driver_location           - Driver location update to customer
new_support_message       - New chat message to manager
support_reply             - Manager reply to customer
```

---

## 🎯 SUCCESS METRICS (FOR DEMO)

### **What Makes a Good Demo:**
1. ✅ App opens smoothly (no crashes)
2. ✅ All navigation works (tabs, screens)
3. ✅ Ride booking flow is seamless
4. ✅ Real-time tracking is smooth
5. ✅ Driver can accept and complete rides
6. ✅ Admin can approve drivers
7. ✅ Manager can view active rides
8. ✅ Emails are sent correctly
9. ✅ UI looks professional
10. ✅ No obvious bugs during demo

### **Demo Script (15-20 minutes):**

**Part 1: Customer Journey (5 min)**
- Open app as customer
- Show map with current location
- Book a ride
- Show fare estimate
- Confirm booking

**Part 2: Driver Journey (5 min)**
- Switch to driver account
- Go online
- Show incoming ride request
- Accept ride
- Navigate to pickup
- Start trip
- Complete trip

**Part 3: Admin Functions (5 min)**
- Switch to admin account
- Show pending driver applications
- Approve a driver application
- Show email sent
- View system analytics

**Part 4: Manager Functions (3 min)**
- Switch to manager account
- Show active rides monitor
- Show support chat inbox
- Reply to customer message

**Part 5: Real-time Demo (2 min)**
- Show customer and driver apps side-by-side
- Demonstrate real-time location tracking
- Show Socket.io updates

---

## 🔧 ENVIRONMENT VARIABLES

### **Backend (.env)**
```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ubar

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:19006

# Fare Calculation
BASE_FARE=50
PER_KM_RATE=15
MINIMUM_FARE=50
PLATFORM_FEE_PERCENTAGE=15

# Socket.io
SOCKET_PORT=5001
```

### **Frontend (app.config.js or .env)**
```bash
# Backend API
API_URL=https://your-backend-url.render.com
SOCKET_URL=https://your-backend-url.render.com

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 🚨 IMPORTANT NOTES & LIMITATIONS

### **Free Tier Limitations:**
1. **Render.com:** Backend sleeps after 15 min of inactivity (takes 30-60s to wake up)
2. **MongoDB Atlas:** 512MB storage (enough for demo, ~10,000 users)
3. **Google Maps:** $200/month credit (~28,000 map loads)
4. **Resend:** 3,000 emails/month (enough for demo)
5. **Cloudinary:** 25GB storage (plenty for profile pics)

### **Expo Go Limitations:**
- Cannot use native modules not included in Expo SDK
- Some sensors may not work on web
- Push notifications require separate setup (Firebase Cloud Messaging)

### **For Production (Future):**
- Use paid hosting (AWS, GCP, Azure)
- Implement actual payment gateway (Stripe, PayPal, Razorpay)
- Add push notifications (FCM/APNs)
- Build standalone apps (iOS/Android)
- Add SMS OTP for phone verification
- Implement actual KYC for drivers
- Add insurance and legal compliance
- Set up CI/CD pipeline
- Add monitoring (Sentry, LogRocket)
- Implement caching (Redis)
- Add rate limiting
- Set up CDN for assets
- Add SSL certificates
- Implement data backups

### **Security Considerations:**
- Never commit .env files
- Use environment variables for all secrets
- Implement rate limiting on APIs
- Hash all passwords with bcrypt
- Validate all inputs on backend
- Use HTTPS in production
- Implement JWT refresh tokens
- Add CSRF protection
- Sanitize user inputs
- Implement proper error handling (don't expose stack traces)

---

## 📞 SUPPORT & CONTACT

**Project Creator:** Sandipan Nayek  
**Project Name:** UBAR  
**Project Type:** Ride Sharing Mobile App  
**Tech Lead:** GitHub Copilot (Claude Sonnet 4.5)  
**Start Date:** December 17, 2025

---

## ✅ NEXT STEPS

1. **Confirm Plan:** Review this document and confirm all features
2. **Set Up Accounts:**
   - MongoDB Atlas account
   - Google Cloud account (for Maps API)
   - Resend.com account (for emails)
   - Cloudinary account (for image uploads)
   - Render.com account (for backend hosting)
3. **Start Development:** Say "START" to begin building
4. **Timeline:** 10-12 days for complete prototype
5. **Demo Preparation:** Create test accounts and demo script

---

**STATUS: ✅ PLAN COMPLETE - READY TO BUILD**

**Waiting for your confirmation to start development.**


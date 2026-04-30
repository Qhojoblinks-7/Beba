# Beba - Rider Dashboard Implementation Summary

## URGENT FIX (April 27, 2026): Blank Screen Resolution

The app was showing a blank screen because the root route `/` had no matching screen.

**Changes Made:**
1. Created `frontend/app/index.jsx` - Login screen at root route `/`
   - Uses mock API (any credentials work via `USE_MOCK_DATA = true`)
   - Demo credentials: `0555123456` / `demo123`
   - After login: `router.replace('/(tabs)/rider-dashboard')`
2. Created `frontend/babel.config.js` - Required for Metro bundler transpilation
3. Cleaned up unused imports across codebase (0 lint errors, 6 warnings)

**Result:** App now loads with login screen. All 4 tab screens (Dashboard, Earnings, History, Settings) work.

**Verification:**
- Linter: 0 errors, 6 warnings (unused variables only)
- All routes: `/` (login), `/login`, `/rider-dashboard`, `/earnings`, `/history`, `/settings`
- API mocking enabled - no backend needed

---

## Original Architecture

The Rider Dashboard uses a **layered, map-first architecture**:

1. **Base Layer**: Google Map with custom dark style
2. **Header**: Online/Offline toggle and branding
3. **Earnings Card**: High-visibility financial summary
4. **Bottom Sheet**: Expandable panel (20%/50%/95% heights) containing active order, heatmap, and order list

## Files Created

### Backend (Django REST Framework)
- `backend/core/models.py` - 6 models: User (custom), Vehicle, Order, TripMetrics, LocationLog, Review
- `backend/core/serializers.py` - Serializers for all models plus EarningsSummary and DemandCenter
- `backend/core/views.py` - API endpoints:
  - `RiderProfileView` - GET /api/riders/me/
  - `RiderEarningsView` - GET /api/riders/earnings/
  - `RiderActiveOrderView` - GET /api/riders/active-order/
  - `NearbyOrdersView` - GET /api/riders/nearby-orders/?lat=...&lng=...
  - `OrderAcceptView` - POST /api/orders/{id}/accept/
  - `OrderStartPickupView` - POST /api/orders/{id}/start-pickup/
  - `OrderCompleteView` - POST /api/orders/{id}/complete/
  - `LocationUpdateView` - POST /api/location/update/
  - `HeatmapDemandView` - GET /api/heatmap/demand-centers/
- `backend/core/urls.py` - URL routing
- `backend/config/settings.py` - DRF, CORS, custom User model configured

### Frontend (React Native / Expo)

#### Main Screen
- `frontend/app/rider-dashboard.tsx` - Full-screen dashboard with MapView, floating header, earnings card, and animated bottom sheet

#### Components
- `frontend/components/Header.tsx` - "Beba Rider" title with online/offline Switch
- `frontend/components/EarningsCard.tsx` - Daily total, completed trips, wait fees in dark green
- `frontend/components/ActiveOrderCard.tsx` - Priority banner, geofence distance/grace period timer with animated circular progress
- `frontend/components/HeatmapGrid.tsx` - 3x3 grid showing demand intensity for Circle, Kaneshie, Accra Central
- `frontend/components/NearbyOrdersList.tsx` - Scrollable list of nearby orders with accept buttons and haptic feedback
- `frontend/components/BottomSheetContent.tsx` - Animated container with snap points 20%, 50%, 95%

#### Services & Hooks
- `frontend/services/api.ts` - Axios instance with JWT auth, base URL config for emulator (10.0.2.2:8000)
- `frontend/hooks/useRiderData.ts` - React Query hook fetching earnings, active order, nearby orders, heatmap data; includes mutations for accept/pickup/complete
- `frontend/utils/geofence.ts` - Haversine distance calculator, geofence check, time/distance formatting

#### Configuration
- `frontend/app.json` - Added expo-location permission plugin
- `frontend/package.json` - All dependencies installed:
  - Backend: djangorestframework, simplejwt, etc.
  - Frontend: react-native-maps, expo-location, @tanstack/react-query, axios, lucide-react-native, react-native-svg, expo-secure-store

## Key Features

### 1. Geofence Logic
- Rider must be within **50m** of pickup to start timer
- Circular progress bar shows:
  - Outside 50m: distance display
  - Inside 50m: 5-minute grace period countdown
- Backend validates geofence on `start-pickup` endpoint

### 2. Priority System
- Food orders have `priority_weight = 30` (Parcel 10, Document 20)
- Active order card shows pulsing red banner for FOOD PRIORITY
- Nearby orders list shows red badge and 🔥 icon

### 3. Demand Heatmap
- 3 cells represent key hubs
- Intensity (green brightness) indicates order volume
- Rider gets visual cue to move to hot zones

### 4. Earnings Card
- Dark forest green (#1a4d2e) with electric lime (#cdff2c) accents
- Shows: Daily Total (GH₵), Completed Trips, Wait Fees Earned
- Encourages patience (wait fees)

### 5. High-Contrast UI
- Map styled with dark theme for outdoor sun glare
- Large buttons (min 60px) for sweaty/gloved operation
- Haptic feedback on order accept (success vibration)
- Electric lime alerts for high-priority items

### 6. Real-Time Updates
- React Query refetches every 30 seconds
- Mutations invalidate cache, instantly updating UI
- Location logged via POST /api/location/update/

## Technical Implementation Notes

### Bottom Sheet Behavior
- Custom Animated implementation using `useRef` + `Animated.spring`
- Snap points: 20% (collapsed), 50% (analytics), 95% (full)
- Drag handle at top for manual expand

### Map Integration
- `showsUserLocation={true}` and `followsUserLocation={true}`
- Custom JSON style (dark palette)
- Markers for active pickup (red) and nearby orders (color by category)

### Data Flow
```
Location (expo-location)
    └─> useRiderData(riderLocation)
         ├─> GET /api/riders/earnings/
         ├─> GET /api/riders/active-order/
         ├─> GET /api/riders/nearby-orders/?lat&lng
         └─> GET /api/heatmap/demand-centers/
                ↓
         Render: Header + EarningsCard + BottomSheetContent
                └─> ActiveOrderCard / HeatmapGrid / NearbyOrdersList
```

### Authentication
- JWT tokens stored via `expo-secure-store`
- Axios interceptor adds `Authorization: Bearer <token>` header
- 401 responses clear token and redirect to login

## Backend Business Logic

### Order Priority
```python
PRIORITY_WEIGHTS = {
    Category.FOOD: 30,
    Category.PARCEL: 10,
    Category.DOCUMENT: 20,
}
```
Auto-assigned in `Order.save()`.

### Geofence Calculation
Backend uses Haversine formula (same as frontend) in `OrderStartPickupView`.

### Earnings
Daily sum of `TripMetrics.total_fare` where `status=DELIVERED` and `updated_at__date=today`.
Wait fees: `trip_metrics.wait_time_minutes * 0.50` (GH₵ 0.50 per minute).

### Demand Heatmap
Counts orders created in last 15 minutes within ~1km radius of Circle, Kaneshie, Accra Central coordinates.

## Getting Started

### Backend
```bash
cd backend
venv\Scripts\python manage.py runserver
# API available at http://localhost:8000
```

### Frontend
```bash
cd frontend
npm start
# Scan QR with Expo Go (Android) or Simulator (iOS)
```

### Emulator Setup
- Android: Backend runs at `10.0.2.2:8000` (automatically handled in api.ts)
- iOS: Use `localhost:8000` or tunnel

## Next Steps
1. Implement login/registration screens (use phone_number + password with SimpleJWT)
2. Add real rider location tracking interval (POST /api/location/update/ every 10s)
3. Implement order completion flow with actual duration recording
4. Add push notifications for new food orders (Expo Notifications + Django Channels)
5. Add radar chart for rider efficiency (integrates Review model data)
6. Create admin panel for managing orders and riders (Django Admin already available)

# Beba Rider App - Order Flow

This document describes the complete order delivery flow in the Beba rider mobile application.

## Overview

The Beba rider app facilitates on-demand delivery services by connecting riders (delivery partners) with customers who have packages, food, or documents that need to be transported. The app uses a React Native frontend with a Django REST API backend.

---

## Order Status Flow

The delivery order progresses through the following statuses:

```
PENDING → PICKED_UP → IN_TRANSIT → DELIVERED
```

### 1. PENDING (Order Created)

- Customer creates a delivery order with pickup and dropoff locations
- Order is assigned priority weight based on category:
  - **Food**: Priority weight 30 (highest)
  - **Document**: Priority weight 20 (medium)
  - **Parcel**: Priority weight 10 (lowest)
- Order appears in the rider's available delivery list

### 2. PICKED_UP (Rider Accepts & Picks Up)

- Rider views available deliveries in the Delivery Tracking screen
- Rider accepts and picks up the package from the sender
- Rider verifies item count and notes any special instructions

### 3. IN_TRANSIT (Active Delivery)

- Rider navigates to the delivery destination using GPS
- Rider can call or message the recipient
- Wait time is tracked if rider arrives before the recipient

### 4. DELIVERED (Delivery Complete)

- Rider arrives at the destination and taps "Arrived"
- Rider waits for customer (max 10 mins)
- If customer doesn't arrive after 10 mins:
  - Rider taps "Return Item" button in the app
  - **Trip price is recalculated**: (distance × 2) + base fare
  - New price is displayed on both rider and customer apps
- **QR Code Verification**: Rider scans QR code on customer's phone to verify recipient identity
- Rider scans the new QR code to confirm successful handoff
- Trip is marked as complete
- Earnings are calculated and displayed

---

## Rider Status Flow

Riders also have their own status in the app:

```
OFFLINE → ONLINE → ON_TRIP → OFFLINE
```

### 1. OFFLINE

- Order search is turned off
- Cannot receive new delivery requests
- To go online: Rider presses the yellow "Turn on order search" button in the StatusSheet

### 2. ONLINE (Ready)

- Rider is active and can receive order notifications
- Can view available deliveries in Delivery Tracking screen
- Can navigate to pickup locations
- Status shown in the bottom sheet as "Online"

### 3. ON_TRIP (Active Delivery)

- Rider has an active delivery in progress
- Views trip details including:
  - Recipient name and contact
  - Delivery address and gate codes
  - Item count and special notes
  - Estimated payout and wait fees
- Can track delivery progress via the map

---

## App Screens & Flow

### Home Screen (`Home.jsx`)

- Shows map with rider's current location
- Bottom sheet (StatusSheet) shows online/offline status
- Rider taps yellow button to toggle status

### Delivery Tracking Screen (`DeliveryTrackingScreen.jsx`)

- Shows active delivery and its status
- Quick actions: Navigate, Call Customer
- List of recent deliveries with order IDs
- Route and destination information

### Active Trip Screen (`ActiveTrip.jsx`)

- Full trip details during active delivery:
  - Contact name and phone number
  - Delivery address with gate code
  - Customer notes (e.g., "Wait at main entrance")
  - Item count verification
  - ETA and distance to destination
- Actions available:
  - Navigate (opens maps app)
  - Call (dials customer)
  - Message (opens chat)
  - Start Trip
  - Complete Delivery
- Earnings breakdown including wait fees

### Trip Details Screen (`TripDetails.jsx`)

- Post-delivery summary showing:
  - Trip date and time
  - Pickup address (From)
  - Intermediate stop address
  - Delivery address (To)
  - Financial breakdown:
    - Trip price (base fare)
    - Fees (distance, wait time)
    - Total earnings

---

## Key Features

1. **Priority-Based Order Matching**
   - Food deliveries get highest priority (weight: 30)
   - Documents get medium priority (weight: 20)
   - Parcels get lowest priority (weight: 10)

2. **Wait Time Limits**
   - Maximum wait time at pickup location:
     - **Food**: 5 minutes max
     - **Parcel/Document**: 10 minutes max
   - Automatic wait fee calculation starts after limit

3. **Wait Fee Calculation**
   - Rider can start a wait timer upon arrival
   - Wait fees are automatically calculated
   - Displayed in the Active Trip screen

4. **Live Location Tracking**
   - Rider location is tracked via LocationLog model
   - Customers can see rider position on map

5. **Earnings Tracking**
   - TripMetrics model stores:
     - Distance traveled
     - Expected vs actual duration
     - Base fare + distance fare + wait fees
     - Total fare

6. **Delivery Verification**
   - Rider verifies item count before pickup
   - Can add notes if items are missing/damaged

7. **Return Item Flow (After 10 Mins Wait)**
   - Rider waits at destination (max 10 mins)
   - If customer doesn't arrive, "Return Item" button appears in rider's app
   - Rider taps "Return Item" button
   - **Trip price is recalculated**: (distance × 2) + base fare
   - New price is displayed on both rider and customer apps

8. **QR Code Verification (Recipient Confirmation)**
   - Triggered when rider taps "Arrived" button
   - Rider scans QR code on customer's phone to verify recipient identity
   - Rider scans the new QR code to confirm successful handoff
   - Prevents delivery to wrong person

9. **Distance-Based Fare**
   - Trip price is calculated as: (distance × 2) + base fare
   - Distance rate is doubled (multiplier of 2)

---

## Data Models

### Order (Backend)

| Field             | Description                               |
| ----------------- | ----------------------------------------- |
| `customer`        | Customer who placed the order             |
| `rider`           | Rider assigned to the delivery            |
| `category`        | FOOD, PARCEL, or DOCUMENT                 |
| `status`          | PENDING, PICKED_UP, IN_TRANSIT, DELIVERED |
| `priority_weight` | Auto-assigned based on category           |
| `pickup_address`  | Pickup location                           |
| `dropoff_address` | Delivery destination                      |
| `created_at`      | Order creation timestamp                  |

### TripMetrics (Backend)

| Field               | Description              |
| ------------------- | ------------------------ |
| `order`             | Associated order         |
| `distance_km`       | Total trip distance      |
| `expected_duration` | Estimated minutes        |
| `actual_duration`   | Actual trip minutes      |
| `wait_time_minutes` | Wait time at destination |
| `base_fare`         | Base pickup fare         |
| `distance_fare`     | Distance-based fee       |
| `delay_fare`        | Additional delay fee     |
| `total_fare`        | Final total earnings     |

---

## Dependencies

- **Frontend**: React Native (Expo), React Navigation, Lucide Icons
- **Backend**: Django REST Framework, SQLite (development)
- **Maps**: Google Maps integration for navigation
- **Location**: Geolocation tracking for rider

---

## Related Files

- `BebaRiderApp/screens/Home.jsx` - Main home screen
- `BebaRiderApp/screens/ActiveTrip.jsx` - Active delivery view
- `BebaRiderApp/screens/DeliveryTrackingScreen.jsx` - Delivery list
- `BebaRiderApp/components/organisms/TripDetails.jsx` - Trip summary
- `BebaRiderApp/hooks/useTripTimer.js` - Wait timer hook
- `BebaRiderApp/hooks/useLocation.js` - Location tracking hook

---

_Last Updated: January 2026_

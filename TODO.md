# Fix React Native Errors TODO

## Plan Steps:
│   ├── api/                # Network layer (Axios/Fetch)
│   │   ├── client.js       # Base config for your Django server
│   │   └── services.js     # Functions for login, fetching orders, etc.
│   ├── components/         # Reusable UI pieces
│   │   ├── atoms/          # BebaButton.jsx, BebaText.jsx (Using your Type Style)
│   │   ├── molecules/      # TripCard.jsx, StatItem.jsx
│   │   └── organisms/      # MapView.jsx, EarningsChart.jsx
│   ├── constants/          # The App's "DNA"
│   │   ├── theme.js        # Color palette (#174E4F, #00A63E, etc.)
│   │   └── typography.js   # 32px Medium, 14px Regular, etc.
│   ├── context/            # State Management (React Context API)
│   │   ├── AuthContext.js  # User login/MoMo verification state
│   │   └── OrderContext.js # Active trip & geofencing data
│   ├── hooks/              # Custom logic for "Beba" functionality
│   │   ├── useLocation.js  # Real-time GPS/Geofencing logic
│   │   └── useWaitTimer.js # The logic that starts the GH₵ clock
│   ├── navigation/         # Routing logic
│   │   ├── AppStack.jsx    # The main flow (Home -> Active -> History)
│   │   └── TabStack.jsx    # Bottom navigation (Home, Earnings, Settings)
│   ├── screens/            # Full-page views
│   │   ├── Home.jsx        # Map + Finding orders
│   │   ├── ActiveTrip.jsx  # Navigation & PIN verification
│   │   ├── History.jsx     # Timeline & Map snippets
│   │   ├── Earnings.jsx    # Analytics & Trend lines
│   │   └── Settings.jsx    # Pilot & Gear config
│   └── utils/              # Helper functions
│       ├── distance.js     # Haversine formula for distance calculation
│       └── currency.js     # Formatter for GH₵ (Cedis)
├── App.js                  # App entry point
├── app.json                # Expo config (Permissions for GPS)
└── package.json
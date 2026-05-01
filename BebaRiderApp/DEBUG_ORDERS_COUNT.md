# Debugging Nearby Orders Count

## 1. Check Django DB directly
```bash
# Navigate to backend
cd backend

# Open Django shell
python manage.py shell
```

In the shell:
```python
from core.models import Order
from django.conf import settings

# Count PENDING orders with no rider
count = Order.objects.filter(status=Order.Status.PENDING, rider__isnull=True).count()
print(f"Pending orders without rider: {count}")

# List them
orders = Order.objects.filter(status=Order.Status.PENDING, rider__isnull=True)
for o in orders:
    print(f"ID: {o.id}, Status: {o.status}, Rider: {o.rider}, Pickup: {o.pickup_address}")
```

## 2. Check if using correct database
```python
print(settings.DATABASES)
```

## 3. Clear all PENDING orders (if test data)
```python
Order.objects.filter(status=Order.Status.PENDING, rider__isnull=True).delete()
print("Cleared pending orders")
```

## 4. Check nearby orders API endpoint directly
```bash
# Get auth token first via login, then:
curl -H "Authorization: Bearer <your_access_token>" http://10.228.153.107:8000/api/riders/nearby-orders/
```

Expected: `[]` if no orders, or a list of order objects if orders exist.

## 5. Common causes of phantom orders
- **Test orders created during development** that were never cleaned up
- **Orders with status PENDING** but with coordinates far away — `NearbyOrdersView` returns ALL pending orders regardless of distance, then sorts them by distance. So even distant orders appear in the list (just sorted last).
- **Multiple databases**: Ensure Django is using the DB you think it is
- **Migrations not applied**: New install might have initial data fixtures

## 6. Clear React Query cache on app start (temporary debug)
Add this to `App.js` inside `QueryClientProvider`:
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 0, // Immediately remove unused queries
      staleTime: 0, // Consider data stale immediately
      retry: 0,
    },
  },
});
```

Then restart the app completely (stop and reload).

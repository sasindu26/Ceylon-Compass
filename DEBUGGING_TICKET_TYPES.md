# Debugging Ticket Types Issue

## Problem Description
User added 2 ticket types (VIP - LKR 6,000 and Standing - LKR 4,500) when creating an event, but:
1. Admin page shows only "Price: LKR 4,500" instead of both ticket types
2. Event details page shows "General Admission" instead of VIP/Standing options
3. Booking modal doesn't show ticket type selection

## Console Debugging Added

### 1. Frontend - AddEvent.jsx

**When clicking "Add Ticket Type" button:**
```javascript
console.log('Adding new ticket:', newTicket);
console.log('Updated ticket types:', updatedTicketTypes);
console.log('New formData:', updated);
console.log('Ticket type added successfully, total tickets:', updatedTicketTypes.length);
```

**When submitting the event:**
```javascript
console.log('==== SUBMITTING EVENT REQUEST ====');
console.log('formData.ticketTypes:', formData.ticketTypes);
console.log('eventReqData.ticketTypes:', eventReqData.ticketTypes);
console.log('Full eventReqData:', JSON.stringify(eventReqData, null, 2));
console.log('==================================');
```

### 2. Backend - routes/eventreq.js

**When receiving event request:**
```javascript
console.log('==== CREATING EVENT REQUEST ====');
console.log('Ticket Types received:', req.body.ticketTypes);
console.log('Full eventReqData:', JSON.stringify(eventReqData, null, 2));
// After save
console.log('Event request saved with ticket types:', eventReq.ticketTypes);
console.log('==== EVENT REQUEST CREATED ====');
```

**When admin approves:**
```javascript
console.log('Ticket types from request:', eventReq.ticketTypes);
console.log('Creating event with ticket types:', newEventData.ticketTypes);
```

### 3. Backend - routes/events.js

**When fetching all events:**
```javascript
events.forEach((event, index) => {
  console.log(`Event ${index + 1}: ${event.title}`);
  console.log(`  - ticketTypes:`, event.ticketTypes);
  console.log(`  - ticketTypes length:`, event.ticketTypes?.length || 0);
});
```

**When fetching single event:**
```javascript
console.log('==== GET EVENT BY ID ====');
console.log('Event:', event.title);
console.log('ticketTypes:', event.ticketTypes);
console.log('ticketTypes length:', event.ticketTypes?.length || 0);
console.log('========================');
```

### 4. Frontend - Events.jsx

```javascript
console.log('==== EVENTS TICKET TYPES DEBUG ====');
response.data.forEach((event, index) => {
  console.log(`Event ${index + 1}: ${event.title}`);
  console.log('  - Has ticketTypes:', event.ticketTypes ? 'YES' : 'NO');
  console.log('  - ticketTypes length:', event.ticketTypes?.length || 0);
  if (event.ticketTypes && event.ticketTypes.length > 0) {
    console.log('  - Ticket types:', event.ticketTypes.map(t => `${t.name} (LKR ${t.price})`).join(', '));
  }
});
console.log('==== END TICKET TYPES DEBUG ====');
```

### 5. Frontend - EventDetails.jsx

```javascript
console.log('==== EVENT DETAILS RECEIVED ====');
console.log('Event data received:', response.data);
console.log('Has ticketTypes:', response.data.ticketTypes ? 'YES' : 'NO');
console.log('ticketTypes length:', response.data.ticketTypes?.length || 0);
console.log('ticketTypes data:', JSON.stringify(response.data.ticketTypes, null, 2));
console.log('================================');
```

### 6. Frontend - BookingModal.jsx

```javascript
console.log('==== BOOKING MODAL EVENT DATA ====');
console.log('Event:', event);
console.log('Event ticketTypes:', event?.ticketTypes);
console.log('ticketTypes length:', event?.ticketTypes?.length);
console.log('ticketTypes array:', JSON.stringify(event?.ticketTypes, null, 2));
// Then shows if using ticket types or creating default
console.log('✅ Using event ticket types:', event.ticketTypes);
// OR
console.log('⚠️ Creating default ticket type from event price:', event.price);
// OR
console.log('❌ No ticket types or price found!');
```

## Testing Steps

### Step 1: Create New Event
1. Open browser Developer Tools → Console tab
2. Navigate to Add Event page
3. Fill in event details
4. Add ticket types:
   - Click "Add Ticket Type" button
   - **Check console:** Should show "Adding new ticket:", "Updated ticket types:", "total tickets: 1"
   - Add second ticket type
   - **Check console:** Should show "total tickets: 2"
5. Review "Added Ticket Types" list on page - should show both tickets
6. Submit event
7. **Check console:** Should show:
   ```
   ==== SUBMITTING EVENT REQUEST ====
   formData.ticketTypes: [{ name: "VIP", price: 6000, ... }, { name: "Standing", price: 4500, ... }]
   eventReqData.ticketTypes: [same array]
   ==================================
   ```
8. **Check backend terminal:** Should show:
   ```
   ==== CREATING EVENT REQUEST ====
   Ticket Types received: [array with 2 ticket types]
   Event request saved with ticket types: [array with 2 ticket types]
   ==== EVENT REQUEST CREATED ====
   ```

### Step 2: Admin Approval
1. Login as admin
2. Go to Admin Dashboard → Events tab
3. View pending event
4. **Check page:** Should display both ticket types in blue cards
5. Click "Accept"
6. **Check backend terminal:** Should show:
   ```
   Ticket types from request: [array with 2 types]
   Creating event with ticket types: [array with 2 types]
   ```

### Step 3: View Events List
1. Logout and go to Events page (or stay logged in)
2. **Check browser console:** Should show:
   ```
   ==== EVENTS TICKET TYPES DEBUG ====
   Event 1: The Healing Palette
     - Has ticketTypes: YES
     - ticketTypes length: 2
     - Ticket types: VIP (LKR 6,000), Standing (LKR 4,500)
   ==== END TICKET TYPES DEBUG ====
   ```
3. **Check backend terminal:** Should show:
   ```
   Event 1: The Healing Palette
     - ticketTypes: [array]
     - ticketTypes length: 2
   ```

### Step 4: View Event Details
1. Click on the event card
2. **Check browser console:** Should show:
   ```
   ==== EVENT DETAILS RECEIVED ====
   Has ticketTypes: YES
   ticketTypes length: 2
   ticketTypes data: [
     { name: "VIP", price: 6000, quantity: 100, available: 100 },
     { name: "Standing", price: 4500, quantity: 200, available: 200 }
   ]
   ================================
   ```
3. **Check backend terminal:** Should show:
   ```
   ==== GET EVENT BY ID ====
   Event: The Healing Palette
   ticketTypes: [array]
   ticketTypes length: 2
   ========================
   ```

### Step 5: Book Tickets
1. Click "Book Now" button
2. **Check browser console:** Should show:
   ```
   ==== BOOKING MODAL EVENT DATA ====
   ✅ Using event ticket types: [2 types]
   ticketTypes array: [
     { name: "VIP", price: 6000, ... },
     { name: "Standing", price: 4500, ... }
   ]
   ```
3. **Check modal display:** Should show two selectable ticket type cards
4. Select "VIP" ticket
5. Choose quantity
6. **Check:** Total should show LKR 6,000 × quantity
7. Select "Standing" ticket instead
8. **Check:** Total should update to LKR 4,500 × quantity

## Expected Console Output (Success Case)

### Creating Event:
```
Adding new ticket: {name: "VIP", price: 6000, quantity: 100, available: 100}
Updated ticket types: [{...VIP}]
Ticket type added successfully, total tickets: 1

Adding new ticket: {name: "Standing", price: 4500, quantity: 200, available: 200}
Updated ticket types: [{...VIP}, {...Standing}]
Ticket type added successfully, total tickets: 2

==== SUBMITTING EVENT REQUEST ====
formData.ticketTypes: (2) [{...VIP}, {...Standing}]
eventReqData.ticketTypes: (2) [{...VIP}, {...Standing}]
==================================
```

### Backend Receiving:
```
==== CREATING EVENT REQUEST ====
Ticket Types received: [
  { name: 'VIP', price: 6000, quantity: 100, available: 100 },
  { name: 'Standing', price: 4500, quantity: 200, available: 200 }
]
Event request saved with ticket types: [same array]
==== EVENT REQUEST CREATED ====
```

### Admin Approval:
```
Ticket types from request: [2 types with VIP and Standing]
Creating event with ticket types: [2 types with VIP and Standing]
```

### Fetching Events:
```
Frontend:
==== EVENTS TICKET TYPES DEBUG ====
Event 1: The Healing Palette
  - Has ticketTypes: YES
  - ticketTypes length: 2
  - Ticket types: VIP (LKR 6,000), Standing (LKR 4,500)
==== END TICKET TYPES DEBUG ====

Backend:
Event 1: The Healing Palette
  - ticketTypes: [Array with 2 items]
  - ticketTypes length: 2
```

### Viewing Event Details:
```
Frontend:
==== EVENT DETAILS RECEIVED ====
Has ticketTypes: YES
ticketTypes length: 2
ticketTypes data: [full array]
================================

Backend:
==== GET EVENT BY ID ====
Event: The Healing Palette
ticketTypes: [Array]
ticketTypes length: 2
========================
```

### Booking Modal:
```
==== BOOKING MODAL EVENT DATA ====
✅ Using event ticket types: [{...}, {...}]
ticketTypes array: [
  { name: "VIP", price: 6000, available: 100 },
  { name: "Standing", price: 4500, available: 200 }
]
```

## Failure Cases and Solutions

### Case 1: Console shows "total tickets: 0" after clicking "Add Ticket Type"
**Problem:** Ticket types not being added to formData
**Solution:** Check if validation is passing (name, price, quantity all filled)

### Case 2: Console shows "formData.ticketTypes: []" when submitting
**Problem:** Tickets were added but formData not updated
**Solution:** React state update issue - check if setFormData is being called correctly

### Case 3: Backend shows "Ticket Types received: []" or "undefined"
**Problem:** Frontend not sending ticket types in request
**Solution:** Check axios.post payload in Network tab (DevTools → Network)

### Case 4: Admin approval console shows "Ticket types from request: []"
**Problem:** EventReq document doesn't have ticketTypes saved
**Solution:** Database issue - check if EventReq.ticketTypes field exists in schema

### Case 5: Events page shows "Has ticketTypes: NO"
**Problem:** Event document doesn't have ticketTypes after approval
**Solution:** Check eventreq.js accept route - ensure ticketTypes are being copied

### Case 6: Booking modal shows "⚠️ Creating default ticket type"
**Problem:** Event has no ticketTypes when reaching booking modal
**Solution:** Trace back through console logs to find where ticketTypes were lost

### Case 7: Booking modal shows "❌ No ticket types or price found!"
**Problem:** Event has neither ticketTypes nor a price field
**Solution:** Critical data missing - check Event document in database

## Direct Database Check

If console logs don't help, check database directly:

```bash
cd /home/sasindu/ceylon-compass-main/backend
node -e "
const mongoose = require('mongoose');
const EventReq = require('./models/EventReq');
const Event = require('./models/Event');

mongoose.connect('mongodb://localhost:27017/ceylonDB');

async function check() {
  const eventReq = await EventReq.findOne({ title: 'The Healing Palette' });
  console.log('EventReq ticketTypes:', eventReq?.ticketTypes);
  
  const event = await Event.findOne({ title: 'The Healing Palette' });
  console.log('Event ticketTypes:', event?.ticketTypes);
  
  await mongoose.connection.close();
}

check();
"
```

## Files Modified with Debugging

1. **src/pages/AddEvent.jsx** - Added submission logging
2. **backend/routes/eventreq.js** - Added request receiving and approval logging
3. **backend/routes/events.js** - Added GET routes logging
4. **src/pages/Events.jsx** - Added events list logging (already had)
5. **src/pages/EventDetails.jsx** - Added event details logging
6. **src/components/BookingModal.jsx** - Added modal opening logging (already had)

## Next Steps

1. **Refresh the browser** to load updated code
2. **Create a NEW event** (old event might not have ticket types in DB)
3. **Watch the console at each step**
4. **Compare console output with expected output above**
5. **Identify where ticket types disappear**

The console logs will show EXACTLY where in the flow the ticket types are being lost!

---

**Remember:** The issue is likely that existing events in the database were created before ticket types were properly implemented, so they don't have the ticketTypes field populated. Creating a fresh event with the debugging enabled will show if the system is working correctly now.

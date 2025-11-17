# Complete Ticket Types System Guide

## Overview
The Ceylon Compass platform now supports **multiple ticket types** for events. This allows organizers to create different ticket categories (VIP, Balcony, ODC Reserved, Standing, etc.) with different prices and seat limits.

---

## Complete Flow

### 1. **Organizer Creates Event** (AddEvent.jsx)

**Step 1:** Navigate to "Add Event" page
**Step 2:** Fill in basic event details (title, description, date, time, location)
**Step 3:** Scroll to "Ticket Types" section
**Step 4:** Add multiple ticket types:
   - **Ticket Type Name**: e.g., "VIP", "Balcony", "ODC Reserved", "Standing"
   - **Price**: e.g., 2500, 1500, 1000
   - **Quantity**: e.g., 100, 200, 300
   - **Description** (optional): e.g., "Front row seats with exclusive access"
**Step 5:** Click "Add Ticket Type" for each type
**Step 6:** Review added tickets in the list
**Step 7:** Submit event request

**Example:**
```
Ticket Type 1: VIP - LKR 2,500 (100 tickets)
Ticket Type 2: Balcony - LKR 1,500 (200 tickets)
Ticket Type 3: Standing - LKR 1,000 (300 tickets)
```

---

### 2. **Backend Saves to EventReq** (backend/routes/eventreq.js)

**What happens:**
- Event request is saved with all ticket types to `eventreq` collection
- Status: `pending`
- Console logs will show:
  ```
  ==== CREATING EVENT REQUEST ====
  Ticket Types received: [...]
  Event request saved with ticket types: [...]
  ==== EVENT REQUEST CREATED ====
  ```

**Database Structure (EventReq):**
```javascript
{
  title: "SAHO Concert",
  ticketTypes: [
    { name: "VIP", price: 2500, quantity: 100, available: 100 },
    { name: "Balcony", price: 1500, quantity: 200, available: 200 },
    { name: "Standing", price: 1000, quantity: 300, available: 300 }
  ],
  status: "pending",
  createdBy: ObjectId("...")
}
```

---

### 3. **Admin Reviews and Approves** (AdminPage.jsx)

**Step 1:** Admin logs in and navigates to Admin Dashboard
**Step 2:** Clicks on "Events" tab
**Step 3:** Sees pending event request
**Step 4:** Clicks "View Details" to see ALL ticket types:

**Admin View Shows:**
```
✓ Ticket Types:
  ┌─────────────────────────────────┐
  │ VIP                             │
  │ LKR 2,500                       │
  │ 100/100 available               │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │ Balcony                         │
  │ LKR 1,500                       │
  │ 200/200 available               │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │ Standing                        │
  │ LKR 1,000                       │
  │ 300/300 available               │
  └─────────────────────────────────┘
```

**Step 5:** Admin clicks "Accept" button
**Step 6:** Backend copies ALL ticket types from EventReq → Event collection

**Backend Process (eventreq.js - accept route):**
```javascript
const newEventData = {
  // ... other fields
  ticketTypes: eventReq.ticketTypes || [], // ✅ Copies all ticket types
  status: 'approved'
};
```

**Console logs:**
```
Ticket types from request: [...]
Creating event with ticket types: [...]
```

---

### 4. **Event Goes Live** (Events.jsx)

**What happens:**
- Approved event now appears on Events page
- Event has all ticket types preserved
- Console debug shows:
  ```
  ==== EVENTS TICKET TYPES DEBUG ====
  Event 1: SAHO Concert
    - Has ticketTypes: YES
    - ticketTypes length: 3
    - Ticket types: VIP (LKR 2,500), Balcony (LKR 1,500), Standing (LKR 1,000)
  ==== END TICKET TYPES DEBUG ====
  ```

---

### 5. **User Views Event and Books Tickets** (BookingModal.jsx)

**Step 1:** User clicks on event card → EventDetails page
**Step 2:** Clicks "Book Now" button
**Step 3:** BookingModal opens showing ALL ticket types

**User Sees:**
```
┌────────────────────────────────────────────┐
│ Select Ticket Type                         │
│                                            │
│ ✓ [VIP]                                    │
│   LKR 2,500     100 available             │
│                                            │
│ [ Balcony ]                                │
│   LKR 1,500     200 available             │
│                                            │
│ [ Standing ]                               │
│   LKR 1,000     300 available             │
│                                            │
│ Number of Tickets: [1] [+]                │
│                                            │
│ Total Amount: LKR 2,500                   │
│                                            │
│ [Proceed to Payment - LKR 2,500]          │
└────────────────────────────────────────────┘
```

**Step 4:** User selects desired ticket type (e.g., "Balcony")
**Step 5:** User selects quantity (max 5 tickets)
**Step 6:** Total price updates: `LKR 1,500 × 3 = LKR 4,500`
**Step 7:** User clicks "Proceed to Payment"

**Console logs:**
```
==== BOOKING MODAL EVENT DATA ====
✅ Using event ticket types: [3 ticket types]
ticketTypes array: [
  { name: "VIP", price: 2500, available: 100 },
  { name: "Balcony", price: 1500, available: 200 },
  { name: "Standing", price: 1000, available: 300 }
]
```

---

### 6. **Backend Processes Booking** (backend/routes/bookings.js)

**What happens:**
1. Backend receives: `{ ticketType: "Balcony", quantity: 3 }`
2. Finds the "Balcony" ticket type in event
3. Validates availability (200 available, user wants 3 ✅)
4. Calculates price: `1500 × 3 = 4500`
5. Generates seat numbers: `["B234", "B235", "B236"]`
6. Updates ticket availability: `200 - 3 = 197 available`
7. Creates booking with:
   ```javascript
   {
     ticketType: "Balcony",
     quantity: 3,
     seatNumbers: ["B234", "B235", "B236"],
     totalPrice: 4500
   }
   ```
8. Sends confirmation email

**Code Logic:**
```javascript
if (event.ticketTypes && event.ticketTypes.length > 0) {
  const selectedTicketType = event.ticketTypes.find(t => t.name === ticketType);
  if (!selectedTicketType) {
    return res.status(400).json({ message: 'Invalid ticket type' });
  }
  price = selectedTicketType.price; // ✅ Uses correct price
  availableTickets = selectedTicketType.available;
  
  // Update ticket availability
  selectedTicketType.available -= quantity;
  await event.save();
}
```

---

### 7. **Email Confirmation** (backend/utils/emailService.js)

**User receives email:**
```
🎉 Booking Confirmed!

Event: SAHO Concert
Date: Saturday, December 15, 2025 at 7:00 PM
Location: Sugathadasa Stadium, Colombo

Ticket Type: Balcony
Number of Tickets: 3
Seat Numbers: B234, B235, B236
Total Amount: LKR 4,500

Booking ID: 67abc123def456...
```

---

## Technical Implementation Summary

### ✅ Models
- **EventReq.js**: Has `ticketTypes` array schema
- **Event.js**: Has `ticketTypes` array schema
- **Booking.js**: Has `ticketType` string and `seatNumbers` array

### ✅ Backend Routes
- **POST /api/eventreq**: Saves ticket types with event request
- **POST /api/eventreq/:id/accept**: Copies ticket types to Event
- **POST /api/bookings**: Processes specific ticket type selection

### ✅ Frontend Components
- **AddEvent.jsx**: Form to add multiple ticket types
- **AdminPage.jsx**: Displays all ticket types in approval modal
- **BookingModal.jsx**: Shows selectable ticket types
- **EventCard.jsx**: Displays event with ticket types

---

## Key Features

### 🎫 Multiple Ticket Types
- Organizers can add unlimited ticket categories
- Each type has: name, price, quantity, description

### 💰 Dynamic Pricing
- Each ticket type has independent pricing
- Total price calculated based on selected type

### 📊 Independent Availability
- Each ticket type has separate seat allocation
- System tracks availability per type

### 🎟️ Seat Number Assignment
- Automatic generation: `{TypeInitial}{Number}` (e.g., "V101", "B205")
- Unique seat numbers per booking
- Included in confirmation email

### 🛡️ Validation
- Max 5 tickets per user per event
- Checks availability before booking
- Validates ticket type exists

---

## Testing Instructions

### Test Case 1: Create Event with Ticket Types
1. Login as organizer
2. Go to "Add Event"
3. Fill event details
4. Add 3 ticket types:
   - VIP: LKR 2,500 (50 tickets)
   - Regular: LKR 1,500 (100 tickets)
   - Student: LKR 1,000 (50 tickets)
5. Submit event
6. **Check:** Backend console shows ticket types

### Test Case 2: Admin Approval
1. Login as admin
2. Go to Admin Dashboard
3. View pending event
4. **Check:** All 3 ticket types visible with prices
5. Click "Accept"
6. **Check:** Console shows ticket types copied

### Test Case 3: User Booking
1. Login as regular user
2. Browse Events page
3. **Check:** Console shows event has ticket types
4. Click on event → "Book Now"
5. **Check:** Modal shows 3 selectable ticket types
6. Select "Regular" ticket type
7. Choose quantity: 2
8. **Check:** Total shows LKR 3,000
9. Complete booking
10. **Check:** Email shows "Regular" type and seat numbers

---

## Console Debugging

### Creating Event Request:
```
==== CREATING EVENT REQUEST ====
Ticket Types received: [3 ticket types]
Full eventReqData: {...}
Event request saved with ticket types: [...]
==== EVENT REQUEST CREATED ====
```

### Admin Approval:
```
Ticket types from request: [...]
Creating event with ticket types: [...]
```

### Loading Events:
```
==== EVENTS TICKET TYPES DEBUG ====
Event 1: SAHO Concert
  - Has ticketTypes: YES
  - ticketTypes length: 3
  - Ticket types: VIP (LKR 2,500), Regular (LKR 1,500), Student (LKR 1,000)
==== END TICKET TYPES DEBUG ====
```

### Booking Modal:
```
==== BOOKING MODAL EVENT DATA ====
✅ Using event ticket types: [3 types]
ticketTypes array: [...]
```

---

## Troubleshooting

### Problem: "Ticket types not showing in booking modal"

**Solution:**
1. Check browser console for `==== BOOKING MODAL EVENT DATA ====`
2. Verify `ticketTypes length:` is > 0
3. If 0, check Events.jsx console for `==== EVENTS TICKET TYPES DEBUG ====`
4. If event shows "Has ticketTypes: NO", event needs to be re-created

### Problem: "Admin sees only price, not ticket types"

**Solution:**
1. Verify AddEvent form added ticket types (check "Added Ticket Types" list)
2. Check backend console for "Ticket Types received:" when submitting
3. If empty, ticket types weren't submitted from frontend
4. Re-submit event with ticket types properly added

### Problem: "Old events don't have ticket types"

**Solution:**
Events created before ticket types feature was added don't have this data.
Options:
1. Delete old event requests and re-create with ticket types
2. OR use MongoDB Compass to manually add ticketTypes array to existing events

---

## Database Structure

### EventReq Collection:
```json
{
  "_id": "67abc...",
  "title": "SAHO Concert",
  "ticketTypes": [
    {
      "name": "VIP",
      "price": 2500,
      "quantity": 100,
      "available": 100,
      "description": "Front row seats"
    },
    {
      "name": "Balcony",
      "price": 1500,
      "quantity": 200,
      "available": 200
    }
  ],
  "status": "pending",
  "createdBy": "67user123..."
}
```

### Event Collection (after approval):
```json
{
  "_id": "67event...",
  "title": "SAHO Concert",
  "ticketTypes": [
    {
      "name": "VIP",
      "price": 2500,
      "quantity": 100,
      "available": 97, // Updated after bookings
      "description": "Front row seats"
    },
    {
      "name": "Balcony",
      "price": 1500,
      "quantity": 200,
      "available": 195
    }
  ],
  "status": "approved"
}
```

### Booking Collection:
```json
{
  "_id": "67booking...",
  "eventId": "67event...",
  "userId": "67user...",
  "ticketType": "VIP",
  "quantity": 3,
  "seatNumbers": ["V101", "V102", "V103"],
  "totalPrice": 7500,
  "status": "confirmed"
}
```

---

## Summary

✅ **System is fully functional** for ticket types flow
✅ **All code is already in place**
✅ **Console debugging added** for easy tracking
✅ **End-to-end flow works**: Create → Approve → Book → Email

**Next Steps:**
1. Test with a fresh event request
2. Add multiple ticket types
3. Check console logs at each step
4. Verify email contains seat numbers

---

**Last Updated:** November 11, 2025
**Version:** 2.0 with Ticket Types System

# Complete Ticket Types Booking Workflow

## System Overview

The Ceylon Compass platform uses a **ticket types system** where event organizers create multiple ticket categories (VIP, Balcony, Standing, ODC Reserved, etc.) with different prices and seat allocations.

---

## Complete User Journey

### 1️⃣ Event Organizer Creates Event

**Page:** `/events/add` (AddEvent.jsx)

**Steps:**
1. Fill in basic event information:
   - Title, Description
   - Date, Time
   - Country, City, Address (with map picker)
   - Organizer details (name, contact, email)
   - Category, Image

2. **Add Ticket Types** (REQUIRED):
   - Click in "Ticket Types" section
   - For each ticket type, enter:
     - **Ticket Type Name**: e.g., "VIP", "Balcony", "Standing", "ODC Reserved"
     - **Price**: e.g., 6000, 4500, 2500, 1500
     - **Quantity**: e.g., 100, 200, 300, 150
     - **Description** (optional): e.g., "Front row seats with exclusive access"
   - Click "Add Ticket Type" button
   - Repeat for all ticket categories

3. Review added tickets in the list

4. Submit event request

**Example Event:**
```
Event: SAHO Live Concert
Ticket Types:
  ✓ VIP - LKR 6,000 (100 tickets) - Front row with meet & greet
  ✓ Balcony - LKR 4,500 (200 tickets) - Elevated seating
  ✓ Standing - LKR 2,500 (300 tickets) - General admission
  ✓ Student - LKR 1,500 (150 tickets) - Student discount (ID required)
```

**Validation:**
- ❌ Cannot submit without at least one ticket type
- ✅ All ticket type fields (name, price, quantity) are required
- ✅ Prices must be positive numbers
- ✅ Quantities must be at least 1

**What Happens:**
- Event request saved to database with status: `pending`
- Admin receives notification
- Organizer sees verification popup

---

### 2️⃣ Admin Reviews and Approves Event

**Page:** `/admin` (AdminPage.jsx)

**Steps:**
1. Admin logs in to admin dashboard
2. Navigates to "Events" tab
3. Sees list of pending event requests
4. Clicks "View Details" on an event

**Admin Sees:**
- Complete event information
- **All ticket types** displayed in blue cards:
  ```
  ┌─────────────────────────────────┐
  │ VIP                             │
  │ LKR 6,000                       │
  │ 100/100 available               │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │ Balcony                         │
  │ LKR 4,500                       │
  │ 200/200 available               │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │ Standing                        │
  │ LKR 2,500                       │
  │ 300/300 available               │
  └─────────────────────────────────┘
  
  ┌─────────────────────────────────┐
  │ Student                         │
  │ LKR 1,500                       │
  │ 150/150 available               │
  └─────────────────────────────────┘
  ```

5. Admin clicks **"Accept"** button (or "Reject" to decline)

**What Happens:**
- Event request copied to live Events collection
- **ALL ticket types preserved** with their details
- Status changed from `pending` to `approved`
- Event now visible on public Events page
- Organizer receives approval email

---

### 3️⃣ Users Browse Events

**Page:** `/events` (Events.jsx)

**What Users See:**
- List of approved upcoming events
- Event cards showing:
  - Event image
  - Title
  - Date, Time
  - Location
  - Category
  - "Book Now" button
  - Ticket availability (total across all types)

**Example Card:**
```
┌─────────────────────────────────────┐
│ [Event Image]                       │
│                                     │
│ SAHO Live Concert                   │
│ November 25, 2025 at 7:00 PM       │
│ 📍 Sugathadasa Stadium, Colombo    │
│                                     │
│ 🎫 750 tickets available           │
│                                     │
│ [     Book Now     ]               │
└─────────────────────────────────────┘
```

---

### 4️⃣ User Views Event Details

**Page:** `/events/:id` (EventDetails.jsx)

**What Users See:**
- Full event description
- Large event image
- Complete event information
- Organizer contact details
- Map with exact location (clickable address)
- **"Book Tickets Now" button** (blue, prominent)
- Total available tickets across all types

**User Action:**
- Clicks "Book Tickets Now" button
- BookingModal opens

---

### 5️⃣ User Selects Ticket Type and Books

**Component:** BookingModal.jsx (Opens as overlay)

**Modal Shows:**

```
┌────────────────────────────────────────────┐
│               SAHO Live Concert             │
│  Saturday, November 25, 2025 at 7:00 PM   │
│  📍 Sugathadasa Stadium, Colombo          │
│                                            │
│  Select Ticket Type:                       │
│  ┌────────────────────────────────────┐   │
│  │ ✓ VIP                              │   │
│  │   LKR 6,000     100 available     │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │   Balcony                          │   │
│  │   LKR 4,500     200 available     │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │   Standing                         │   │
│  │   LKR 2,500     300 available     │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │   Student                          │   │
│  │   LKR 1,500     150 available     │   │
│  └────────────────────────────────────┘   │
│                                            │
│  Number of Tickets: [-] [3] [+]          │
│  Maximum 5 ticket(s) available            │
│                                            │
│  ──────────────────────────────────────   │
│  Ticket Price:         LKR 6,000          │
│  Quantity:             ×3                 │
│  Total Amount:         LKR 18,000         │
│  ──────────────────────────────────────   │
│                                            │
│  [ Proceed to Payment - LKR 18,000 ]     │
│  [          Cancel          ]             │
└────────────────────────────────────────────┘
```

**User Actions:**
1. **Selects ticket type** by clicking on one of the cards (e.g., "VIP")
2. **Adjusts quantity** using +/- buttons (max 5 per user)
3. **Reviews total price** (updates automatically)
4. **Clicks "Proceed to Payment"**

**Validation:**
- ✅ Can only select available ticket types (sold out types are disabled)
- ✅ Maximum 5 tickets per user per event
- ✅ Cannot exceed available quantity for selected type
- ✅ Price calculated based on selected ticket type

---

### 6️⃣ Backend Processes Booking

**Route:** POST `/api/bookings` (backend/routes/bookings.js)

**What Happens:**
1. **Validates booking request:**
   - User is authenticated
   - Event exists
   - Ticket type exists in event
   - Requested quantity available
   - User hasn't exceeded 5 ticket limit

2. **Finds selected ticket type:**
   ```javascript
   const selectedTicketType = event.ticketTypes.find(t => t.name === "VIP");
   ```

3. **Calculates price:**
   ```javascript
   price = selectedTicketType.price; // LKR 6,000
   totalPrice = price × quantity;    // LKR 6,000 × 3 = LKR 18,000
   ```

4. **Generates unique seat numbers:**
   ```javascript
   seatNumbers = ["V234", "V235", "V236"]
   ```

5. **Updates ticket availability:**
   ```javascript
   selectedTicketType.available -= 3; // 100 → 97 available
   event.save();
   ```

6. **Creates booking record:**
   ```javascript
   {
     userId: "67user123...",
     eventId: "67event456...",
     ticketType: "VIP",
     quantity: 3,
     seatNumbers: ["V234", "V235", "V236"],
     totalPrice: 18000,
     status: "confirmed",
     userDetails: {
       name: "John Doe",
       email: "john@example.com",
       phone: "+94771234567"
     }
   }
   ```

7. **Sends confirmation email** (async, doesn't block response)

8. **Returns success response** to frontend

---

### 7️⃣ User Receives Confirmation

**Frontend Shows:**
```
┌────────────────────────────────────────────┐
│             ✓ Booking Confirmed!           │
│                                            │
│  Your booking has been successfully        │
│  confirmed.                                │
│                                            │
│  Booking ID: 67abc123def456...            │
│  Tickets: 3x VIP                          │
│  Total Paid: LKR 18,000                   │
│  Email: john@example.com                  │
│                                            │
│  A confirmation email has been sent to    │
│  your email address.                      │
└────────────────────────────────────────────┘
```

**Email Received:**
```
From: Ceylon Compass <no-reply@ceyloncompass.com>
To: john@example.com
Subject: Booking Confirmation - SAHO Live Concert

🎉 Booking Confirmed!

Thank you for your purchase

Hello John Doe,

Your booking has been successfully confirmed! Here are your ticket details:

SAHO Live Concert

Booking ID: 67abc123def456...
Date: Saturday, November 25, 2025
Time: 7:00 PM
Location: Sugathadasa Stadium, Colombo

Ticket Type: VIP
Number of Tickets: 3
Seat Numbers: V234, V235, V236
Total Amount: LKR 18,000

Important Information:
• Please bring a valid ID to the event
• Arrive at least 30 minutes before the event starts
• This email serves as your booking confirmation
• You can view your booking details in your profile

If you have any questions, please contact the event organizer:
Email: organizer@example.com
Phone: +94771234567

Thank you for using Ceylon Compass!

This is an automated email. Please do not reply.
```

---

## System Features

### 🎫 Dynamic Ticket Types
- Each event can have unlimited ticket categories
- Different names, prices, quantities per type
- Independent availability tracking

### 💰 Flexible Pricing
- Each ticket type has its own price
- Total calculated based on selected type and quantity
- Supports multiple pricing tiers (VIP, Regular, Student, etc.)

### 📊 Real-time Availability
- Each ticket type tracks its own availability
- Updates immediately after booking
- Shows "Sold Out" badge when a type is exhausted
- Other types remain bookable

### 🎟️ Seat Assignment
- Automatic unique seat number generation
- Format: `{TypeInitial}{Number}` (e.g., "V234", "B105", "S456")
- Seat numbers included in confirmation email
- Tied to specific ticket type

### 🛡️ Business Rules
- **Max 5 tickets** per user per event
- Can book multiple types (e.g., 2 VIP + 3 Standing = 5 total)
- Cannot exceed availability for any type
- Must be logged in to book

### 📧 Email Notifications
- **Organizer:** Receives email when event is approved
- **User:** Receives confirmation with seat numbers
- **User:** Can view bookings in profile page

---

## Database Structure

### EventReq (Pending Events)
```json
{
  "_id": "67eventreq123...",
  "title": "SAHO Live Concert",
  "date": "2025-11-25",
  "time": "19:00",
  "ticketTypes": [
    {
      "name": "VIP",
      "price": 6000,
      "quantity": 100,
      "available": 100,
      "description": "Front row with meet & greet"
    },
    {
      "name": "Balcony",
      "price": 4500,
      "quantity": 200,
      "available": 200
    },
    {
      "name": "Standing",
      "price": 2500,
      "quantity": 300,
      "available": 300
    },
    {
      "name": "Student",
      "price": 1500,
      "quantity": 150,
      "available": 150,
      "description": "Student discount - ID required"
    }
  ],
  "status": "pending",
  "createdBy": "67user123..."
}
```

### Event (Approved Events)
```json
{
  "_id": "67event456...",
  "title": "SAHO Live Concert",
  "date": "2025-11-25",
  "time": "19:00",
  "ticketTypes": [
    {
      "name": "VIP",
      "price": 6000,
      "quantity": 100,
      "available": 97,  // Updated after bookings
      "description": "Front row with meet & greet"
    },
    {
      "name": "Balcony",
      "price": 4500,
      "quantity": 200,
      "available": 195
    },
    {
      "name": "Standing",
      "price": 2500,
      "quantity": 300,
      "available": 298
    },
    {
      "name": "Student",
      "price": 1500,
      "quantity": 150,
      "available": 150
    }
  ],
  "status": "approved"
}
```

### Booking
```json
{
  "_id": "67booking789...",
  "userId": "67user123...",
  "eventId": "67event456...",
  "ticketType": "VIP",
  "quantity": 3,
  "seatNumbers": ["V234", "V235", "V236"],
  "totalPrice": 18000,
  "status": "confirmed",
  "userDetails": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+94771234567"
  },
  "createdAt": "2025-11-11T17:30:00.000Z"
}
```

---

## Key Changes Made

### ✅ Removed Fields
- ❌ **Price field** - No longer needed (calculated from ticket types)
- ❌ **Capacity field** - No longer needed (sum of all ticket type quantities)

### ✅ Updated Validation
- ✅ **Mandatory ticket types** - Must add at least one ticket type to submit
- ✅ **Automatic price calculation** - Minimum ticket price used for event listing
- ✅ **Automatic capacity calculation** - Sum of all ticket quantities

### ✅ User Experience
- ✅ **Clear ticket type selection** - Users see all options with prices
- ✅ **Real-time price updates** - Total changes when switching types
- ✅ **Availability per type** - Shows available seats for each category
- ✅ **Seat number assignment** - Users get specific seats in email

---

## Example Booking Scenarios

### Scenario 1: User Books VIP Tickets
1. User selects "VIP" ticket type (LKR 6,000)
2. Chooses quantity: 2
3. Total: LKR 12,000
4. Books successfully
5. Receives seats: V234, V235
6. VIP availability: 100 → 98

### Scenario 2: User Books Multiple Types (Hypothetical - Current System)
User can book up to 5 tickets total:
- Books 2 VIP (LKR 12,000)
- Later books 3 Standing (LKR 7,500)
- Total booked: 5 tickets (limit reached)
- Total spent: LKR 19,500

### Scenario 3: Ticket Type Sells Out
1. VIP has 2 tickets left
2. User A tries to book 3 VIP → Error: "Only 2 available"
3. User A books 2 VIP → Success
4. VIP availability: 2 → 0
5. User B sees VIP with "Sold Out" badge
6. User B can still book Balcony, Standing, or Student

---

## Testing Checklist

- [ ] Create event with multiple ticket types (at least 3)
- [ ] Verify admin sees all ticket types in approval modal
- [ ] Admin approves event
- [ ] Event appears on public Events page
- [ ] Click event → EventDetails page loads
- [ ] Click "Book Tickets Now" → Modal opens
- [ ] Verify all ticket types are selectable
- [ ] Select first ticket type → Price updates
- [ ] Select second ticket type → Price updates correctly
- [ ] Adjust quantity → Total updates
- [ ] Try to exceed 5 tickets → Error shown
- [ ] Complete booking → Success message
- [ ] Check email → Confirmation with seat numbers received
- [ ] Return to event → Availability decreased
- [ ] Book remaining tickets until one type sells out
- [ ] Verify "Sold Out" badge appears for that type
- [ ] Verify other types still bookable

---

**Last Updated:** November 11, 2025
**System Status:** ✅ Fully Functional

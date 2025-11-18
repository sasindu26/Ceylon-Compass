# My Listings Feature - User Guide

## Overview
The **My Listings** feature allows users to view and manage their own posts (events, restaurants, and accommodations) that they have submitted to Ceylon Compass. Users can track the approval status of their submissions and delete listings when needed.

## Key Features

### 1. **View All Your Listings**
- Access all your submitted events, restaurants, and accommodations in one place
- See your listings organized by status (Pending, Approved, Rejected)
- Track which items are live on the website

### 2. **Status Tracking**
Your listings can have three statuses:
- **Pending** - Waiting for admin review
- **Approved** - Live on the website and visible to all users
- **Rejected** - Not approved by admin (reason may be provided)

### 3. **Delete Functionality**
You can delete your own listings at any time, even after they're approved. This is useful for:
- When an accommodation has been rented out
- When a restaurant is closing
- When an event is cancelled or has passed
- When you need to remove outdated information

### 4. **Filter Options**
- **All** - View all your listings (default)
- **Pending** - See items awaiting admin approval
- **Approved** - View your live listings
- **Rejected** - Check items that weren't approved

## How to Use

### Accessing My Listings
1. Click on your profile icon in the navigation bar
2. Go to your **Profile** page
3. Click on the **"My Listings"** tab in the sidebar

### Viewing Listing Details
Each listing card shows:
- **Type** - Event 🎉, Restaurant 🍽️, or Accommodation 🏠
- **Title/Name** - The name of your listing
- **Status Badge** - Current approval status
- **Location** - City and country
- **Price** - Event ticket price, restaurant price range, or accommodation rate
- **Description** - Brief preview of your listing
- **Date** - For events, the event date

### Deleting a Listing
1. Find the listing you want to delete
2. Click the **"🗑️ Delete"** button on the listing card
3. Confirm the deletion in the popup modal
4. The listing will be permanently removed from the database

⚠️ **Warning:** Deletion is permanent and cannot be undone!

## Workflow

### New Submission Process
1. **User Creates Post**
   - Navigate to "Marketplace" tab in Profile
   - Click "Add Restaurant", "Add Event", or "Add Accommodation"
   - Fill in the form and submit

2. **Status: Pending**
   - Your listing appears in "My Listings" with "Pending Review" status
   - It's NOT visible on the main website yet
   - Admin receives notification to review

3. **Admin Review**
   - Admin reviews your submission
   - Can approve or reject with feedback

4. **Status: Approved**
   - Your listing goes live on the website
   - Visible to all users in the respective section
   - You can still delete it if needed

5. **Status: Rejected** (if applicable)
   - Listing is not published
   - You may receive feedback on why
   - You can submit a new, corrected version

### Managing Active Listings
- **Update**: Contact admin or resubmit (currently, direct editing by users is limited)
- **Delete**: You can delete anytime using the delete button
- **Monitor**: Check status regularly in "My Listings"

## Use Cases

### Example 1: Accommodation Rental
You listed an apartment for rent:
- ✅ Listed and approved
- 👀 People contact you via the listing
- 🏠 Someone rents it long-term
- ✔️ You delete the listing from "My Listings"
- 🎉 Listing removed, no longer shown to users

### Example 2: Restaurant Closing
You own a restaurant that's closing:
- ✅ Restaurant is listed and active
- 📅 You decide to close next month
- ⏰ When the time comes, delete the listing
- ✔️ Restaurant removed from the website

### Example 3: Event Cancellation
You organized an event but need to cancel:
- ✅ Event is approved and live
- ❌ Event cancelled due to unforeseen circumstances
- 🗑️ Delete the event from "My Listings"
- ✔️ Users no longer see the cancelled event

## Technical Details

### API Endpoints Used
- `GET /api/events/my-listings` - Fetch user's events
- `GET /api/restaurants/my-listings` - Fetch user's restaurants
- `GET /api/accommodations/my-listings` - Fetch user's accommodations
- `DELETE /api/events/:id` - Delete event (owner or admin only)
- `DELETE /api/restaurants/:id` - Delete restaurant (owner or admin only)
- `DELETE /api/accommodations/:id` - Delete accommodation (owner or admin only)

### Authentication
- All endpoints require user authentication
- JWT token is automatically sent with requests
- Only the creator (or admin) can delete a listing

### Permissions
- **View**: Users can only see their own listings
- **Delete**: Users can delete their own listings regardless of status
- **Admin**: Admins can view and delete any listing

## Security Features
- Authentication required for all actions
- Server-side validation ensures users can only access their own listings
- Delete confirmation modal prevents accidental deletions
- Authorization checks on backend prevent unauthorized actions

## Responsive Design
The My Listings page is fully responsive:
- **Desktop**: Grid layout with multiple cards per row
- **Tablet**: Adjusted grid for medium screens
- **Mobile**: Single column layout, full-width cards

## Future Enhancements (Possible)
- Edit functionality for users to update their own listings
- Bulk delete option
- Export listings data
- Statistics (views, bookings, inquiries)
- Duplicate listing option

## Support
If you encounter any issues:
1. Refresh the page
2. Check your internet connection
3. Clear browser cache
4. Contact admin support

---

**Happy Managing!** 🎉

This feature gives you full control over your contributions to Ceylon Compass while maintaining the quality control through admin approval for new submissions.
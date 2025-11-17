#!/usr/bin/env node

/**
 * Database Check Script
 * 
 * This script connects to MongoDB and checks if events have ticketTypes data.
 * Run with: node checkTicketTypes.js
 */

const mongoose = require('mongoose');
require('dotenv').config(); // Load .env file

// MongoDB connection string from environment
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ceylonDB';

// Define minimal schemas for querying
const eventSchema = new mongoose.Schema({}, { strict: false });
const eventReqSchema = new mongoose.Schema({}, { strict: false });

const Event = mongoose.model('Event', eventSchema, 'events');
const EventReq = mongoose.model('EventReq', eventReqSchema, 'eventreq');

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check EventReq collection (pending events)
    console.log('📋 Checking EventReq Collection (Pending Events):');
    console.log('='.repeat(60));
    
    const eventReqs = await EventReq.find().sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${eventReqs.length} event requests\n`);
    
    eventReqs.forEach((req, index) => {
      console.log(`${index + 1}. ${req.title || 'Untitled'}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Created: ${req.createdAt}`);
      console.log(`   Has ticketTypes: ${req.ticketTypes ? 'YES' : 'NO'}`);
      console.log(`   ticketTypes length: ${req.ticketTypes?.length || 0}`);
      
      if (req.ticketTypes && req.ticketTypes.length > 0) {
        console.log(`   Ticket Types:`);
        req.ticketTypes.forEach((ticket, i) => {
          console.log(`     ${i + 1}. ${ticket.name} - LKR ${ticket.price} (${ticket.quantity} tickets)`);
        });
      } else {
        console.log(`   ⚠️  No ticket types found`);
      }
      console.log('');
    });

    // Check Event collection (approved events)
    console.log('\n📋 Checking Event Collection (Approved Events):');
    console.log('='.repeat(60));
    
    const events = await Event.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(5);
    console.log(`Found ${events.length} approved events\n`);
    
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title || 'Untitled'}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Created: ${event.createdAt}`);
      console.log(`   Has ticketTypes: ${event.ticketTypes ? 'YES' : 'NO'}`);
      console.log(`   ticketTypes length: ${event.ticketTypes?.length || 0}`);
      
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        console.log(`   Ticket Types:`);
        event.ticketTypes.forEach((ticket, i) => {
          console.log(`     ${i + 1}. ${ticket.name} - LKR ${ticket.price} (${ticket.available}/${ticket.quantity} available)`);
        });
      } else {
        console.log(`   ⚠️  No ticket types found`);
      }
      console.log('');
    });

    // Summary
    console.log('\n📊 Summary:');
    console.log('='.repeat(60));
    
    const totalEventReqs = await EventReq.countDocuments();
    const totalEvents = await Event.countDocuments({ status: 'approved' });
    const eventReqsWithTickets = await EventReq.countDocuments({ 
      ticketTypes: { $exists: true, $ne: [] } 
    });
    const eventsWithTickets = await Event.countDocuments({ 
      status: 'approved',
      ticketTypes: { $exists: true, $ne: [] } 
    });
    
    console.log(`Total Event Requests: ${totalEventReqs}`);
    console.log(`Event Requests WITH ticket types: ${eventReqsWithTickets}`);
    console.log(`Event Requests WITHOUT ticket types: ${totalEventReqs - eventReqsWithTickets}`);
    console.log('');
    console.log(`Total Approved Events: ${totalEvents}`);
    console.log(`Approved Events WITH ticket types: ${eventsWithTickets}`);
    console.log(`Approved Events WITHOUT ticket types: ${totalEvents - eventsWithTickets}`);
    console.log('');

    if (eventsWithTickets === 0 && totalEvents > 0) {
      console.log('⚠️  WARNING: No approved events have ticket types!');
      console.log('   This means either:');
      console.log('   1. Events were created before ticket types feature was added');
      console.log('   2. Admin approval is not copying ticket types correctly');
      console.log('   3. Events need to be re-created with ticket types');
    } else if (eventsWithTickets > 0) {
      console.log('✅ Good! Some events have ticket types.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the check
checkDatabase().catch(console.error);

#!/usr/bin/env node

/**
 * Add Ticket Types to Existing Event
 * 
 * This script helps you add ticket types to events that don't have them.
 * 
 * Usage: node addTicketTypesToEvent.js "Event Title"
 * Example: node addTicketTypesToEvent.js "The Healing Palette"
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const MONGODB_URI = process.env.MONGO_URI;

const eventSchema = new mongoose.Schema({}, { strict: false });
const Event = mongoose.model('Event', eventSchema, 'events');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addTicketTypes() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Get event title from command line or prompt
    let eventTitle = process.argv[2];
    
    if (!eventTitle) {
      eventTitle = await question('Enter event title: ');
    }

    // Find the event
    const event = await Event.findOne({ 
      title: { $regex: eventTitle, $options: 'i' } 
    });

    if (!event) {
      console.log('❌ Event not found!');
      console.log('Available events:');
      const events = await Event.find({ status: 'approved' })
        .select('title')
        .limit(10);
      events.forEach(e => console.log(`  - ${e.title}`));
      process.exit(1);
    }

    console.log(`\n📋 Found event: ${event.title}`);
    console.log(`Current ticketTypes: ${event.ticketTypes?.length || 0} types\n`);

    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const confirm = await question('Event already has ticket types. Overwrite? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('Cancelled.');
        process.exit(0);
      }
    }

    // Collect ticket types
    const ticketTypes = [];
    let addMore = true;

    while (addMore) {
      console.log(`\n➕ Adding ticket type #${ticketTypes.length + 1}:`);
      
      const name = await question('  Ticket name (e.g., VIP, General): ');
      const price = await question('  Price (LKR): ');
      const quantity = await question('  Total quantity: ');
      const description = await question('  Description (optional): ');

      ticketTypes.push({
        name,
        price: parseInt(price),
        quantity: parseInt(quantity),
        available: parseInt(quantity),
        description: description || undefined
      });

      const more = await question('\nAdd another ticket type? (yes/no): ');
      addMore = more.toLowerCase() === 'yes';
    }

    // Preview
    console.log('\n📝 Preview:');
    console.log('─'.repeat(60));
    ticketTypes.forEach((ticket, index) => {
      console.log(`${index + 1}. ${ticket.name}`);
      console.log(`   Price: LKR ${ticket.price.toLocaleString()}`);
      console.log(`   Quantity: ${ticket.quantity}`);
      if (ticket.description) {
        console.log(`   Description: ${ticket.description}`);
      }
      console.log('');
    });

    const confirm = await question('Save these ticket types? (yes/no): ');
    
    if (confirm.toLowerCase() === 'yes') {
      // Update event
      await Event.updateOne(
        { _id: event._id },
        { $set: { ticketTypes } }
      );

      console.log('\n✅ Ticket types added successfully!');
      console.log(`Event "${event.title}" now has ${ticketTypes.length} ticket type(s)`);
      
      // Verify
      const updated = await Event.findById(event._id);
      console.log('\n✓ Verification:');
      console.log(`  ticketTypes length: ${updated.ticketTypes.length}`);
      updated.ticketTypes.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.name} - LKR ${t.price}`);
      });
    } else {
      console.log('Cancelled.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected');
  }
}

addTicketTypes();

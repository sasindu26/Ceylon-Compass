// This script deletes ALL events from the database
// Use with caution! This will delete everything.
require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('../models/Event');

async function deleteAllEvents() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected to MongoDB');

    // Count total events before deletion
    const count = await Event.countDocuments();
    console.log(`\nFound ${count} total events in database`);

    if (count === 0) {
      console.log('No events to delete.');
    } else {
      // List all events before deletion
      const events = await Event.find({}).select('title date status');
      console.log('\nEvents to be deleted:');
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} (Date: ${event.date}, Status: ${event.status})`);
      });

      // Delete all events
      console.log('\n🗑️  Deleting all events...');
      const result = await Event.deleteMany({});
      console.log(`✅ Successfully deleted ${result.deletedCount} events`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  }
}

deleteAllEvents();

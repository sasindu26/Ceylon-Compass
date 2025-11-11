require('dotenv').config();
const mongoose = require('mongoose');
const Location = require('./models/Location');

const locationsData = [
  {
    country: 'Sri Lanka',
    cities: [
      'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Anuradhapura', 
      'Negombo', 'Matara', 'Trincomalee', 'Batticaloa', 'Ratnapura', 
      'Kurunegala', 'Badulla', 'Mannar', 'Vavuniya', 'Hambantota',
      'Nuwara Eliya', 'Kalutara', 'Gampaha', 'Ampara', 'Polonnaruwa',
      'Chilaw', 'Kegalle', 'Matale', 'Puttalam', 'Monaragala',
      'Avissawella', 'Bandarawela', 'Bentota', 'Dambulla', 'Ella',
      'Hikkaduwa', 'Tangalle', 'Mirissa', 'Unawatuna', 'Arugam Bay',
      'Sigiriya', 'Habarana', 'Kataragama', 'Beruwala', 'Weligama',
      'Ambalangoda', 'Tissamaharama', 'Embilipitiya', 'Hatton', 'Wellawaya'
    ]
  },
  {
    country: 'India',
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane']
  },
  {
    country: 'Maldives',
    cities: ['Male', 'Addu City', 'Fuvahmulah', 'Kulhudhuffushi', 'Thinadhoo', 'Naifaru', 'Hinnavaru', 'Mahibadhoo', 'Vilufushi', 'Eydhafushi', 'Funadhoo', 'Dhidhdhoo', 'Kudahuvadhoo', 'Veymandoo', 'Thulusdhoo']
  },
  {
    country: 'Thailand',
    cities: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui', 'Hua Hin', 'Ayutthaya', 'Sukhothai', 'Kanchanaburi', 'Koh Phangan', 'Koh Tao', 'Koh Lanta', 'Koh Chang', 'Koh Phi Phi']
  },
  {
    country: 'Malaysia',
    cities: ['Kuala Lumpur', 'George Town', 'Malacca City', 'Kota Kinabalu', 'Ipoh', 'Johor Bahru', 'Kuching', 'Kota Bharu', 'Miri', 'Alor Setar', 'Kuantan', 'Taiping', 'Seremban', 'Sandakan', 'Kuala Terengganu']
  },
  {
    country: 'United Kingdom',
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Liverpool', 'Bristol', 'Leeds', 'Sheffield', 'Newcastle', 'Cardiff', 'Belfast', 'Nottingham', 'Leicester', 'Brighton']
  },
  {
    country: 'Australia',
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin', 'Sunshine Coast']
  },
  {
    country: 'United Arab Emirates',
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain', 'Khor Fakkan', 'Dibba Al-Fujairah', 'Kalba', 'Dhaid', 'Jebel Ali', 'Hatta', 'Ruwais']
  },
  {
    country: 'United States',
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'San Francisco', 'Charlotte', 'Indianapolis', 'Seattle', 'Denver', 'Washington DC', 'Boston', 'Nashville', 'Las Vegas', 'Portland', 'Miami']
  },
  {
    country: 'Canada',
    cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'Sherbrooke', 'St. Catharines', 'Kelowna']
  },
  {
    country: 'Singapore',
    cities: ['Singapore City', 'Jurong', 'Woodlands', 'Tampines', 'Bedok', 'Hougang', 'Yishun', 'Sengkang', 'Punggol', 'Bukit Batok', 'Choa Chu Kang', 'Ang Mo Kio', 'Toa Payoh', 'Queenstown', 'Bishan']
  },
  {
    country: 'New Zealand',
    cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Palmerston North', 'Napier', 'Hastings', 'Nelson', 'Rotorua', 'New Plymouth', 'Whangarei', 'Invercargill', 'Queenstown', 'Gisborne', 'Timaru', 'Blenheim', 'Wanaka', 'Taupo']
  },
  {
    country: 'Germany',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bonn', 'Bielefeld', 'Mannheim']
  }
];

async function seedLocations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Location.deleteMany({});
    console.log('Cleared existing locations');

    // Insert new data
    await Location.insertMany(locationsData);
    console.log('Successfully seeded locations data');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding locations:', error);
    process.exit(1);
  }
}

seedLocations(); 
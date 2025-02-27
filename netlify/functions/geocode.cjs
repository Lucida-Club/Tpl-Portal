const dotenv = require('dotenv');
const Airtable = require('airtable');
const axios = require('axios');

dotenv.config();

// Load environment variables
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_RETAILER_TABLE_NAME;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// Initialize Airtable
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Function to geocode an address
async function geocodeAddress(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error(`Error geocoding address: ${address}, Status: ${response.data.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching geocoding data: ${error.message}`);
    return null;
  }
}

// Netlify function handler
exports.handler = async function(event, context) {
  try {
    console.log('Starting geocoding process...');

    const { updatedCount, noAddressCount, totalRecords, alreadyGeocodedCount } = await updateAirtable(); // Ensure this is awaited
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: `Airtable update completed successfully.`,
        updatedCount, 
        noAddressCount, 
        totalRecords, 
        alreadyGeocodedCount
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error updating Airtable: ${error.message}` }),
    };
  }
};

// Function to update Airtable records with geocoded data
async function updateAirtable() {
  let updatedCount = 0;
  let noAddressCount = 0;
  let totalRecords = 0;
  let alreadyGeocodedCount = 0;

  return new Promise((resolve, reject) => {
    base(AIRTABLE_TABLE_NAME)
      .select({ view: 'Grid view', pageSize: 100 })
      .eachPage(
        async (records, fetchNextPage) => {
          totalRecords += records.length;
          for (const record of records) {
            const fullAddress = record.get('FULLADDRESS');
            const lat = record.get('LAT');
            const lng = record.get('LNG');

            if (fullAddress && (!lat || !lng)) {
              console.log(`Geocoding address: ${fullAddress}`);
              const location = await geocodeAddress(fullAddress);

              if (location) {
                try {
                  await base(AIRTABLE_TABLE_NAME).update(record.id, {
                    LAT: location.lat,
                    LNG: location.lng,
                  });
                  updatedCount++;
                  console.log(`Updated record ${record.id} with lat: ${location.lat}, lng: ${location.lng}`);
                } catch (err) {
                  console.error(`Error updating record ${record.id}: ${err.message}`);
                }
              }
            } else if (!fullAddress) {
              noAddressCount++;
            } else {
              alreadyGeocodedCount++;
            }
          }
          fetchNextPage();
        },
        (err) => {
          if (err) {
            console.error(`Error fetching Airtable records: ${err.message}`);
            reject(err);
          } else {
            console.log(`Completed processing all records. Total records reviewed: ${totalRecords}, Total updated records: ${updatedCount}, Records without address: ${noAddressCount}, Records already geocoded: ${alreadyGeocodedCount}`);
            resolve({ updatedCount, noAddressCount, totalRecords, alreadyGeocodedCount });
          }
        }
      );
  });
}
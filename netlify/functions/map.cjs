const dotenv = require('dotenv');
const algoliasearch = require('algoliasearch');

dotenv.config();

const APP_ID = process.env.ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_API_KEY || process.env.VITE_ALGOLIA_API_KEY;
const INDEX_NAME = process.env.ALGOLIA_INDEX_NAME || process.env.VITE_ALGOLIA_INDEX_NAME;

console.log('Config', APP_ID, API_KEY, INDEX_NAME);

// Initialize the Algolia client
const client = algoliasearch(APP_ID, API_KEY);
const AlgoliaIndex = client.initIndex(`${INDEX_NAME}-retailers`);

module.exports.handler = async (event, context) => {
    // Add CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*', // Be more restrictive in production
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    };

    // Handle OPTIONS request (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: corsHeaders,
            body: ''
        };
    }

    try {
        // Get all records from Algolia
        const { hits } = await AlgoliaIndex.search('', {
            hitsPerPage: 1000 // Adjust this number based on your needs
        });

        // Transform hits into GeoJSON features
        const features = hits
            .filter(hit => hit._geoloc) // Only include records with location data
            .map(hit => {
                const { coastInventoryFeed, _highlightResult, inventoryFeed2, inventory, _geoloc, ...filteredHit } = hit;
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [hit._geoloc.lng, hit._geoloc.lat] // GeoJSON uses [longitude, latitude]
                    },
                    properties: filteredHit
                };
            });

        // Create the GeoJSON FeatureCollection
        const geoJSON = {
            type: 'FeatureCollection',
            features: features
        };

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            },
            body: JSON.stringify(geoJSON)
        };
    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};


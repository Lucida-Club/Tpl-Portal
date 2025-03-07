const dotenv = require('dotenv');
const Airtable = require('airtable');
const _ = require('lodash');
const algoliasearch = require('algoliasearch');

dotenv.config();

// Initialize Airtable client.
const airTableBase = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID || '');

const APP_ID = process.env.ALGOLIA_APP_ID;
const API_KEY = process.env.ALGOLIA_ADMIN_API_KEY;

// Initialize the Algolia client.
const client = algoliasearch(APP_ID, API_KEY);
const AlgoliaIndex = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

module.exports.handler = async (event, context) => {
    try {
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
        
        const data = [];
        let totalRecordsIndexed = 0;

        // Create a promise to handle the asynchronous page processing
        await new Promise((resolve, reject) => {
            airTableBase(process.env.AIRTABLE_TABLE_NAME).select({
                view: 'All Inventory',
                pageSize: 100
            }).eachPage((records, fetchNextPage) => {
                records.forEach((record) => {
                    record.fields = _.mapKeys(record.fields, (v, k) => _.camelCase(k));
                    record.fields.objectID = `${record.fields.upc}-${record.fields.retailerId}`;
                    record.airTableId= record.id;

                    if (record.fields.lat && record.fields.lng) {
                        record.fields._geoloc = {
                            lat: record.fields.lat[0],
                            lng: record.fields.lng[0]
                        }
                    }

                    data.push(record.fields);
                });

                fetchNextPage();
            }, (err) => {
                if (err) {
                    console.error('Error fetching records:', err);
                    reject(err);
                } else {
                    console.log('All records fetched.');
                    resolve();
                }
            });
        });

        // Process data in batches of 1000
        for (let i = 0; i < data.length; i += 1000) {
            const batch = data.slice(i, i + 1000);
            await AlgoliaIndex.saveObjects(batch).then(({ objectIDs }) => {
                console.log('Data pushed to Algolia:', objectIDs);
                totalRecordsIndexed += objectIDs.length;
            }).catch(err => {
                console.error('Error pushing data to Algolia:', err);
            });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Data processing complete.',
                recordsIndexed: totalRecordsIndexed
            })
        };
    } catch (error) {
        console.error('Error in handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

const axios = require('axios');

async function testLocations() {
  try {
    const countries = await axios.get('http://localhost:5000/api/locations/countries');
    console.log('Countries:', countries.data);

    const countryId = 'COUNTRY_OBJECT_ID'; // valid country id
    const cities = await axios.get(`http://localhost:5000/api/locations/cities/${countryId}`);
    console.log('Cities:', cities.data);

    const cityId = 'CITY_OBJECT_ID'; //  valid city id
    const universities = await axios.get(`http://localhost:5000/api/locations/universities/${cityId}`);
    console.log('Universities:', universities.data);
  } catch (error) {
    console.error('Locations test error:', error.response ? error.response.data : error.message);
  }
}

testLocations();
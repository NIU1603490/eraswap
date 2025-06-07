const mongoose = require('mongoose');
const Country = require('../models/country');
const City = require('../models/city');
const University = require('../models/university');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conected to MongoDB'))
    .catch(err => console.error('Error to connect:', err));

const seedData = async () => {
    try {
        // Clear existing data
        await Country.deleteMany({});
        await City.deleteMany({});
        await University.deleteMany({});

        const countries = [
            { name: 'Germany'},
            { name: 'France' },
            { name: 'Spain' },
            { name: 'Norway' },
            { name: 'Poland' },
            { name: 'Austria' },
            { name: 'Belgium' },
            { name: 'Denmark' },
            { name: 'Netherlands' },
            { name: 'Italy' },
        ];

        const createdCountries = await Country.insertMany(countries);
        const countryMap = createdCountries.reduce((map, country) => {
            map[country.name] = country._id;
            return map;
        }, {});
        
        const cities = [
            { name: 'Berlin', country: countryMap['Germany'] },
            { name: 'Paris', country: countryMap['France'] },
            { name: 'Barcelona', country: countryMap['Spain'] },
            { name: 'Madrid', country: countryMap['Spain'] },
            { name: 'Oslo', country: countryMap['Norway'] },
            { name: 'Warsaw', country: countryMap['Poland'] },
            { name: 'Vienna', country: countryMap['Austria'] },
            { name: 'Brussels', country: countryMap['Belgium'] },
            { name: 'Copenhagen', country: countryMap['Denmark'] },
            { name: 'Amsterdam', country: countryMap['Netherlands'] },
            { name: 'Rome', country: countryMap['Italy'] },
        ];
        
        const createdCities = await City.insertMany(cities);
        const cityMap = createdCities.reduce((map, city) => {
            map[city.name] = city._id;
            return map;
        }, {});
        
        const universities = [
            { name: 'Technical University of Berlin', city: cityMap['Berlin'], country: countryMap['Germany'] },
            { name: 'Sorbonne University', city: cityMap['Paris'], country: countryMap['France'] },
            { name: 'University Autonomous of Barcelona', city: cityMap['Barcelona'], country: countryMap['Spain'] },
            { name: 'Complutense University of Madrid', city: cityMap['Madrid'], country: countryMap['Spain'] },
            { name: 'University of Oslo', city: cityMap['Oslo'], country: countryMap['Norway'] },
            { name: 'University of Warsaw', city: cityMap['Warsaw'], country: countryMap['Poland'] },
            { name: 'University of Vienna', city: cityMap['Vienna'], country: countryMap['Austria'] },
            { name: 'KU Leuven', city: cityMap['Brussels'], country: countryMap['Belgium'] },
            { name: 'University of Copenhagen', city: cityMap['Copenhagen'], country: countryMap['Denmark'] },
            { name: 'University of Amsterdam', city: cityMap['Amsterdam'], country: countryMap['Netherlands'] },
            { name: 'Sapienza University of Rome', city: cityMap['Rome'], country: countryMap['Italy'] },
        ];
        
        await University.insertMany(universities);
        console.log('Countries, cities and universities seeded successfully');
        mongoose.connection.close();
        
    } catch (error) {
        console.error('Error seeding data:', error);
        mongoose.connection.close();
        
    }
};

seedData();


const Country = require('../models/country');
const City = require('../models/city');
const University = require('../models/university');

const getCountries = async (req, res) => {
    try {
        const countries = await Country.find()
        res.status(200).json({
            success: true,
            data: countries
        });
    } catch (error) {
        res.status(500).json({success: false, message: 'Internal Server Error', error: error.message});
    }
}


//get cities by countryId
//router.get('/cities/:countryId', locationController.getCitiesbyId);
const getCitiesbyID = async (req, res) => {
    try {
        const { countryId } = req.params;
        if (!countryId) {
            return res.status(400).json({
                success: false,
                message: 'Country ID is required'
             });
        }
        // Check if the countryId is valid
        const cities = await City.find({ country: countryId })

        res.status(200).json({
            success: true,
            data: cities
         });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
         });
        
    }
}

//get universities by cityId
const getUniversitiesbyID = async (req, res) => {
    try {
        const { cityId } = req.params;
        if (!cityId) {
            return res.status(400).json({
                success: false,
                message: 'City ID is required'
             });
        }
        // Check if the cityId is valid
        const universities = await University.find({ city: cityId })

        res.status(200).json({
            success: true,
            data: universities
         });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
         });
    }
}

module.exports = { getCountries, getCitiesbyID, getUniversitiesbyID };

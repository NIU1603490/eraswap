//REVISADO
const locationController = require('../controller/locationController');
const Country = require('../models/country');
const City = require('../models/city');
const University = require('../models/university');

// Mock the models
jest.mock('../models/country');
jest.mock('../models/city');
jest.mock('../models/university');

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe('locationController', () => {
  describe('getCountries', () => {
    it('should return list of countries', async () => {
      const req = {};
      const res = mockResponse();
      const countries = [{ name: 'Spain' }, { name: 'France' }];
      Country.find.mockResolvedValue(countries);

      await locationController.getCountries(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: countries });
    });

    it('should handle errors from database', async () => {
      const req = {};
      const res = mockResponse();
      Country.find.mockRejectedValue(new Error('db error'));

      await locationController.getCountries(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Internal Server Error', error: 'db error' });
    });
  });

  describe('getCitiesbyID', () => {
    it('should return 400 if countryId missing', async () => {
      const req = { params: {} };
      const res = mockResponse();

      await locationController.getCitiesbyID(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Country ID is required' });
    });
  });

  describe('getUniversitiesbyID', () => {
    it('should return universities for a city', async () => {
      const universities = [{ name: 'University Autonomous of Barcelona' }, { name: 'Complutense University of Madrid' }];
      const req = { params: { cityId: '680b56ebef65b11b78aa2979' } };
      const res = mockResponse();
      University.find.mockResolvedValue(universities);

      await locationController.getUniversitiesbyID(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: universities });
    });
  });
});
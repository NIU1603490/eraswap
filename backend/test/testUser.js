const axios = require('axios');

const testUser = async () => {
    async function createUser() {
        const userData = {
            clerkUserId: 'user_2wwkTPfuGMTb9LmLV8OzIoo4c0W',
            firstName: 'John',
            lastName: 'Doe',
            username: 'john_doe',
            email: 'john.doe@example.com',
            country: '680b56ebef65b11b78aa2970',
            city: '680b56ebef65b11b78aa297c',
            university: '680b56ebef65b11b78aa297d',
        };
        const response = await axios.post('http://localhost:3000/users', userData);
        console.log(response.data);
    }

    createUser();
}

testUser();

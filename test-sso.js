const axios = require('axios');

async function testSSO() {
    try {
        console.log('Testing SSO endpoint...');
        const response = await axios.post('http://localhost:4000/api/sso/generate', {
            email: 'admin@sclsandbox.xyz'
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testSSO();

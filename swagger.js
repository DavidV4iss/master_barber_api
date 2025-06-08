import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger.json';
const endpointsFiles = ['./server.js'];

const doc = {
    info: {
        version: '1.0.0',
        title: 'Master Barber VIP',
        description: 'HELLO WORLD',
    },
    host: 'localhost:8080',
    schemes: ['http'],

};

swaggerAutogen()(outputFile, endpointsFiles, doc);

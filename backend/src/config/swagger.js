
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Eternal Stone Academy API',
      description: 'API for managing Eternal Stone Academy',
      contact: {
        name: 'Victor Vidal',
      },
      servers: ['http://localhost:5000'],
    },
  },
  apis: ['../routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

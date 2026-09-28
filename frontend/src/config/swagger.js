const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend E-commerce API",
      version: "1.0.0",
      description: "API documentation for the E-commerce backend",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./src/routes/*.js"], // Path to your route files
};

// Initialize swagger-jsdoc
const specs = swaggerJsDoc(options);

// Function to setup Swagger
const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = setupSwagger;

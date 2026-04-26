import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "StellarStream API",
      version: "1.0.0",
      description: "REST API for the StellarStream Stellar payment streaming indexer.",
    },
    servers: [{ url: "/api/v1", description: "v1" }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-Api-Key",
        },
        WalletAuth: {
          type: "apiKey",
          in: "header",
          name: "X-Stellar-Address",
        },
      },
    },
  },
  apis: ["./src/api/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

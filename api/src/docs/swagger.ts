import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Canadian Tax Calculation API',
      version: '1.0.0',
      description: 'API for calculating Canadian taxes, CPP/EI contributions, and accessing tax data',
      contact: {
        name: 'Tax CA Team',
        url: 'https://github.com/ArtemisAI/tax-ca'
      },
      license: {
        name: 'LGPL-3.0-only',
        url: 'https://opensource.org/licenses/LGPL-3.0'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Tax Calculation API'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if the request was successful'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            error: {
              type: 'string',
              description: 'Error message (only present when success is false)'
            },
            code: {
              type: 'string',
              description: 'Error code (only present when success is false)'
            }
          }
        },
        ProvinceCode: {
          type: 'string',
          enum: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'],
          description: 'Canadian province or territory code'
        }
      }
    },
    security: [
      {
        ApiKeyAuth: []
      }
    ],
    tags: [
      {
        name: 'Tax Calculations',
        description: 'Tax and contribution calculation endpoints'
      },
      {
        name: 'Data',
        description: 'Static data endpoints for tax brackets, limits, and reference data'
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options);
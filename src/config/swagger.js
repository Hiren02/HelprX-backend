const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HelprX API Documentation',
      version: '1.0.0',
      description: 'Local Services Platform with AI Auto-Matching - Complete API Documentation',
      contact: {
        name: 'API Support',
        email: 'api-support@helprx.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.helprx.com/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                  },
                  message: {
                    type: 'string',
                  },
                },
              },
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            phone: {
              type: 'string',
              example: '9876543210',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['user', 'worker', 'admin'],
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Worker: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            phone: {
              type: 'string',
            },
            skills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skill: {
                    type: 'string',
                  },
                  level: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 4,
                  },
                },
              },
            },
            avgRating: {
              type: 'number',
              format: 'float',
            },
            completedJobs: {
              type: 'integer',
            },
            kycStatus: {
              type: 'string',
              enum: ['pending', 'submitted', 'verified', 'rejected'],
            },
            availabilityStatus: {
              type: 'string',
              enum: ['online', 'offline', 'busy'],
            },
          },
        },
        Job: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            serviceType: {
              type: 'string',
              enum: ['plumbing', 'electrical', 'tutoring', 'carpentry', 'painting', 'cleaning', 'pet_care', 'handyman', 'ac_repair', 'appliance_repair', 'pest_control', 'gardening', 'other'],
            },
            title: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['created', 'matching', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'],
            },
            priceEstimate: {
              type: 'number',
              format: 'float',
            },
            finalPrice: {
              type: 'number',
              format: 'float',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Address: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            label: {
              type: 'string',
              example: 'Home',
            },
            addressLine: {
              type: 'string',
            },
            city: {
              type: 'string',
            },
            state: {
              type: 'string',
            },
            pincode: {
              type: 'string',
            },
            latitude: {
              type: 'number',
              format: 'float',
            },
            longitude: {
              type: 'number',
              format: 'float',
            },
            isDefault: {
              type: 'boolean',
            },
          },
        },
        Rating: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            jobId: {
              type: 'string',
              format: 'uuid',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            review: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
            },
            totalPages: {
              type: 'integer',
            },
            totalItems: {
              type: 'integer',
            },
            itemsPerPage: {
              type: 'integer',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization',
      },
      {
        name: 'Users',
        description: 'User profile management',
      },
      {
        name: 'Workers',
        description: 'Worker profile and management',
      },
      {
        name: 'Jobs',
        description: 'Job creation and lifecycle management',
      },
      {
        name: 'Addresses',
        description: 'Address management with geo-location',
      },
      {
        name: 'Ratings',
        description: 'Rating and review system',
      },
      {
        name: 'Notifications',
        description: 'In-app notifications',
      },
      {
        name: 'Pricing',
        description: 'Dynamic pricing and estimates',
      },
      {
        name: 'Wallet',
        description: 'Worker wallet management',
      },
      {
        name: 'Payments',
        description: 'Payment processing',
      },
      {
        name: 'Matching',
        description: 'AI-powered worker matching',
      },
      {
        name: 'Analytics',
        description: 'Platform analytics (Admin only)',
      },
      {
        name: 'Admin',
        description: 'Admin panel operations',
      },
    ],
  },
  apis: ['./src/modules/*/swagger.docs.js', './src/modules/*/*.routes.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

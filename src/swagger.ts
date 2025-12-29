import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Travel Booking API',
    version: '1.0.0',
    description: 'API for managing trips, bookings, and payments with user authentication and authorization',
  },
  servers: [
    {
      url: 'http://localhost:3005',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
          details: {
            type: 'object',
          },
        },
      },
      Organization: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          name: {
            type: 'string',
          },
          organization_id: {
            type: 'integer',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Trip: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          title: {
            type: 'string',
          },
          destination: {
            type: 'string',
          },
          start_date: {
            type: 'string',
            format: 'date',
          },
          end_date: {
            type: 'string',
            format: 'date',
          },
          owner_id: {
            type: 'integer',
          },
          is_public: {
            type: 'boolean',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Traveler: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          first_name: {
            type: 'string',
          },
          last_name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          trip_id: {
            type: 'integer',
          },
          traveler_id: {
            type: 'integer',
          },
          status: {
            type: 'string',
            enum: ['pending', 'confirmed', 'cancelled'],
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          booking_id: {
            type: 'integer',
          },
          amount: {
            type: 'number',
            format: 'float',
          },
          currency: {
            type: 'string',
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'refunded'],
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      TripPermission: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
          },
          trip_id: {
            type: 'integer',
          },
          user_id: {
            type: 'integer',
            nullable: true,
          },
          organization_id: {
            type: 'integer',
            nullable: true,
          },
          permission: {
            type: 'string',
            enum: ['read', 'write'],
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
  },
}

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
}

export const swaggerSpec = swaggerJSDoc(options)

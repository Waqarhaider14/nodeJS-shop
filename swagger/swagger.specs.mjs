import swaggerJsdoc from 'swagger-jsdoc';


// swagger setup

const swaggerOptions = {
    swaggerDefinition: {
        openapi : "3.0.0",
        info : {
            title : "Ecommerce Shop ",
            version: "1.0.0",
            description: "Ecommerce shop APIs"
        },
        servers:[
            {
                url: 'http://localhost:4001/'
            },
        ]
    },
    apis: ['./controllers/product.controller.mjs','./controllers/user.controller.mjs',
    './controllers/user.registration.login.mjs','./controllers/product.filters.mjs',
    './controllers/cart.controller.mjs','./controllers/checkout.controller.mjs',
    './controllers/review.controller.mjs']
}

const swaggerspecs = swaggerJsdoc(swaggerOptions)

export default swaggerspecs;
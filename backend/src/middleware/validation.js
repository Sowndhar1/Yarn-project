import Joi from 'joi';

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map((detail) => detail.message);
        return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errorMessages });
    }
    next();
};

// Auth Schmeas
export const loginSchema = Joi.object({
    identifier: Joi.string().required().messages({
        'any.required': 'Username or Email is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
    }),
    userType: Joi.string().valid('staff', 'customer').optional(),
    user_type: Joi.string().valid('staff', 'customer').optional(),
});

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    phone: Joi.string().pattern(/^[0-9+\-\s()]*$/).allow('').optional(),
});

// Product Schemas
export const productSchema = Joi.object({
    name: Joi.string().required(),
    count: Joi.string().required(),
    color: Joi.string().required(),
    brand: Joi.string().required(),
    material: Joi.string().required(),
    pricePerKg: Joi.number().positive().required(),
    stockKg: Joi.number().min(0).optional(),
    category: Joi.string().required(),
    leadTimeDays: Joi.number().min(0).optional(),
    description: Joi.string().allow('').optional(),
    thumbnail: Joi.string().uri().allow('').optional(),
});

// Order Schemas
export const orderSchema = Joi.object({
    productId: Joi.string().optional(), // Support legacy single item
    quantityKg: Joi.number().positive().optional(),
    buyer: Joi.object({
        name: Joi.string().optional(),
        contact: Joi.string().optional(),
        address: Joi.object().optional(),
    }).optional(),
    items: Joi.array().items(Joi.object({
        product: Joi.string().required(),
        quantity: Joi.number().positive().required(),
        price: Joi.number().positive().required(),
    })).optional(),
    notes: Joi.string().allow('').optional(),
    deliveryPreference: Joi.string().optional(),
}).or('productId', 'items'); // Either productId (legacy) or items must be present

export default validate;

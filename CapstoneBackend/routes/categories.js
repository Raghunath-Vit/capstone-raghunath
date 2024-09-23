
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Category = require('../models/Category');
const authenticateJWT = require('../middlewares/auth');

// Create a new Category (Worker or Admin only)
router.post('/categories', 
    authenticateJWT,
    [
        // Name validations
        body('name')
            .trim()
            .notEmpty().withMessage('Category name is required')
            .isLength({ min: 3 }).withMessage('Category name must be at least 3 characters long')
            .matches(/^[a-zA-Z0-9\s]+$/).withMessage('Category name should only contain letters, numbers, and spaces')
            .escape(),
        // Description validations
        body('description')
            .optional()  // description is optional
            .trim()
            .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
            .escape(),
    ],
    async (req, res) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only workers and admins can create categories.' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, description } = req.body;
        try {
            const category = new Category({ name, description });
            await category.save();

            res.status(201).json({ message: 'Category created successfully', category });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
);

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find(); 
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.delete('/delcategory/:id', authenticateJWT, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only admins can delete categories.' });
    }

    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;

const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Service = require('../models/Service');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middlewares/auth');

router.get('/category/:categoryId', 
  param('categoryId')
    .trim()
    .notEmpty().withMessage('Category ID is required')
    .isMongoId().withMessage('Invalid category ID format'), 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const services = await Service.find({ categoryId: req.params.categoryId });
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching services' });
    }
  }
);

router.post('/services', 
  auth,
  [
    // Only admins can create services
    body('categoryId')
      .trim()
      .notEmpty().withMessage('Category ID is required')
      .isMongoId().withMessage('Invalid category ID format'),
    body('serviceName')
      .trim()
      .notEmpty().withMessage('Service name is required')
      .isLength({ min: 3 }).withMessage('Service name must be at least 3 characters long'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  ],
  async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can create services.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { categoryId, serviceName, description } = req.body;
    try {
      const service = new Service({ 
        categoryId, 
        serviceName, 
        description, 
        serviceProviderId: [] 
      });
      await service.save();

      res.status(201).json({ message: 'Service created successfully', service });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post('/:id/rate', 
  [
    param('id')
      .isMongoId().withMessage('Invalid service ID format'),
    body('rating')
      .notEmpty().withMessage('Rating is required')
      .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating } = req.body;
    const serviceId = req.params.id;

    try {
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      await service.updateAverageRating(rating);

      res.json({ message: 'Rating submitted successfully', service });
    } catch (error) {
      res.status(500).json({ error: 'Error submitting rating' });
    }
  }
);



// DELETE a service by its ID
router.delete('/services/:id', 
  auth, 
  param('id').isMongoId().withMessage('Invalid service ID format'),
  async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only admins can delete services.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const serviceId = req.params.id;
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      await Service.findByIdAndDelete(serviceId);
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting service' });
    }
  }
);


// PUT route to update an existing service
// router.put('/:id', auth, async (req, res) => {
//   const { serviceName, description, priceRange } = req.body;
//   try {
//     const service = await Service.findById(req.params.id);

//     if (!service) {
//       return res.status(404).json({ message: 'Service not found' });
//     }

//     // Update the fields that have been changed
//     if (serviceName) service.serviceName = serviceName;
//     if (description) service.description = description;
//     if (priceRange) service.priceRange = priceRange;

//     // Save the updated service
//     const updatedService = await service.save();
//     res.status(200).json(updatedService);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating service', error });
//   }
// });

// This one is for above 
// PUT route to update an existing service
router.put(
  '/:id',
  auth,
  [
    body('serviceName').optional().notEmpty().withMessage('Service name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('priceRange').optional().isArray().withMessage('Price range must be an array')
    // Adjust the priceRange validation as per your model requirements
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceName, description, priceRange } = req.body;

    try {
      const service = await Service.findById(req.params.id);

      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // Update the fields that have been changed
      if (serviceName) service.serviceName = serviceName;
      if (description) service.description = description;
      if (priceRange) service.priceRange = priceRange;

      // Save the updated service
      const updatedService = await service.save();
      res.status(200).json(updatedService);
    } catch (error) {
      res.status(500).json({ message: 'Error updating service', error });
    }
  }
);


module.exports = router;

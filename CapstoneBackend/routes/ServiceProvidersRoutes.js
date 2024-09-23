const express = require('express');
const router = express.Router();
const ServiceProvider = require('../models/ServiceProviderModel'); 
const Service = require('../models/Service');
const auth = require('../middlewares/auth');

const { body, param, validationResult } = require('express-validator');

router.post('/:serviceId/service-providers', auth,
     [
       body('serviceProviderEmail').isEmail().withMessage('Invalid email address for the service provider.'),
       body('serviceName').notEmpty().withMessage('Service name is required.'),
       body('description').notEmpty().withMessage('Description is required.')
     ], async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ message: 'Access denied. Only workers can add service providers.' });
  }

  try {
    const serviceId = req.params.serviceId;
    const { serviceProviderEmail, serviceName, price, description } = req.body;

    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
      return res.status(400).json({ error: 'Invalid serviceId. The specified service does not exist.' });
    }

    const serviceProvider = new ServiceProvider({
      categoryId: serviceExists.categoryId,
      serviceProviderEmail,
      serviceId,
      userId: req.user.id, 
      serviceName,
      price,
      description
    });
    await serviceProvider.save();
    res.status(201).json(serviceProvider);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});




router.get('/:serviceId/service-providers', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const serviceProviders = await ServiceProvider.find({ serviceId })
          .populate('userId');
     
    res.status(200).json(serviceProviders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:serviceId/service-providers/:providerId', async (req, res) => {
  try {
    const { serviceId, providerId } = req.params;
    
    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
      return res.status(400).json({ error: 'Invalid serviceId. The specified service does not exist.' });
    }

    const serviceProvider = await ServiceProvider.findOne({ _id: providerId, serviceId })
      .populate('userId');

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found.' });
    }

    res.status(200).json(serviceProvider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/:serviceId/deleteprovider/:id', auth, async (req, res) => {
  try {
    const { serviceId, id } = req.params;
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Access denied. Only workers can delete service providers.' });
    }

    const serviceExists = await Service.findById(serviceId);
    if (!serviceExists) {
      return res.status(400).json({ error: 'Invalid serviceId. The specified service does not exist.' });
    }

     const serviceProvider = await ServiceProvider.findOne({ _id: id, serviceId });

    if (!serviceProvider) {
      return res.status(404).json({ error: 'Service provider not found.' });
    }
    if (serviceProvider.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this service provider.' });
    }

     await ServiceProvider.deleteOne({ _id: id });

    res.status(200).json({ message: 'Service provider deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





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
    const serviceProviderId = req.params.id;

    try {
      const service = await ServiceProvider.findById(serviceProviderId);
      if (!service) {
        return res.status(404).json({ error: 'ServiceProvider not found' });
      }

      await service.updateAverageRating(rating);

      res.json({ message: 'Rating submitted successfully', service });
    } catch (error) {
      res.status(500).json({ error: 'Error submitting rating' });
    }
  }
);



router.get('/:id/rate', async (req, res) => {
  const serviceProviderId = req.params.id;

  try {
    
    const booking = await ServiceProvider.findById(serviceProviderId);
    if (!booking) {
      return res.status(404).json({ error: 'ServiceProvider not found' });
    }

  
    res.json({ rating: booking.rating });
  } catch (error) {
    console.error('Error retrieving rating:', error);
    res.status(500).json({ error: 'Server error' });
  }
});




module.exports = router;

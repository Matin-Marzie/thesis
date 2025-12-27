import express from 'express';
import usersController from '../../controllers/usersController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);


router.get('/me', usersController.getUserObject);


router.put('/sync', usersController.updateProfile);


router.get('/:id', usersController.getUserById);



export default router;

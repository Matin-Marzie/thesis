import express from 'express';
import userController from '../../controllers/userController.js';
import verifyJWT from '../../middleware/verifyJWT.js';

const router = express.Router();

router.get('/me', verifyJWT, userController.getUserProfileProgress);            // user_profile + user_progress(includes user_languages) + user_vocabulary
// router.get('/profile', verifyJWT, userController.);
// router.get('/progress', verifyJWT, userController.);
// router.get('/language', verifyJWT, userController.);
// router.get('/vocabulary', verifyJWT, userController.);

// router.get('/:username', userController.);



// router.post('/language', verifyJWT, userController.);
// router.post('/vocabulary', verifyJWT, userController.);       { "action": "create", ... }



// router.patch('/profile',  verifyJWT, userController.);
// router.patch('/progress', verifyJWT, userController.);



// router.delete('/profile', verifyJWT, userController.);


export default router;

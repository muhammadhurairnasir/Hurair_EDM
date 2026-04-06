import express from 'express';
import { register, login, registerCustomer } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/register-customer', registerCustomer);
router.post('/login', login);

export default router;

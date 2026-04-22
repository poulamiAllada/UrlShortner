import express from 'express';
import urlRoutes from './url.routes.js'

const router = express.Router();
router.use('/url', urlRoutes);

export default router;

import express from 'express';
import { handleChat, sendHistory, getHistory } from '../controllers/agentController.js';

const router = express.Router();

router.post('/', handleChat);
router.post('/send-history', sendHistory);

// Nuevo endpoint para obtener historial
router.get('/history/:email', getHistory);

export default router;


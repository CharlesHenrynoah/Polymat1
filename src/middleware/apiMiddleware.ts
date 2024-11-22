import express from 'express';
import { TextToCodeModel } from '../models/TextToCodeModel';

const router = express.Router();

const textToCodeModel = new TextToCodeModel(
  process.env.API_URL || '',
  process.env.API_KEY || '',
  'text-to-code-model',
  { /* apiConfig */ }
);

router.post('/text-to-code', async (req, res) => {
  try {
    const { text } = req.body;
    const code = await textToCodeModel.processTextToCode(text);
    res.json({ code });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process text to code' });
  }
});

export default router;

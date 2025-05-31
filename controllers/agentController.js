import OpenAI from 'openai';
import dotenv from 'dotenv';
import ChatHistory from '../models/ChatHistory.js';
import fetch from 'node-fetch';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const handleChat = async (req, res) => {
  const { name, studentId, email, message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente amable y profesional en salud mental, llamado Mente Clara.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    let history = await ChatHistory.findOne({ email });

    if (!history) {
      history = new ChatHistory({ name, studentId, email, messages: [] });
    }

    history.messages.push({ role: 'user', content: message });
    history.messages.push({ role: 'assistant', content: reply });
    await history.save();

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error al generar respuesta de OpenAI:', error);
    res.status(500).json({ error: 'Hubo un problema al contactar al asistente.' });
  }
};

export const sendHistory = async (req, res) => {
  const { email } = req.body;

  try {
    const history = await ChatHistory.findOne({ email });
    if (!history) return res.status(404).json({ error: 'Historial no encontrado.' });

    const content = history.messages
      .map((msg) => `${msg.role === 'user' ? 'Tú' : 'Mente Clara'}: ${msg.content}`)
      .join('\n\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Mente Clara <no-reply@mentesaludable.com>',
        to: email,
        subject: 'Tu historial de conversación con Mente Clara',
        text: content,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error Resend:', errorData);
      return res.status(500).json({ error: 'No se pudo enviar el historial.' });
    }

    res.status(200).json({ success: true, message: 'Correo enviado con éxito.' });
  } catch (error) {
    console.error('Error al enviar correo con Resend:', error);
    res.status(500).json({ error: 'No se pudo enviar el historial.' });
  }

};
export const getHistory = async (req, res) => {
  const { email } = req.params;
  try {
    const history = await ChatHistory.findOne({ email });
    if (!history) {
      return res.status(404).json({ error: 'Historial no encontrado.' });
    }
    res.status(200).json({ messages: history.messages });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial.' });
  }
};



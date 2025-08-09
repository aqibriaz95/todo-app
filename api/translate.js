import OpenAI from 'openai';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLanguage, openaiKey } = req.body;

    if (!text || !targetLanguage || !openaiKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: text, targetLanguage, and openaiKey are required' 
      });
    }

    if (!openaiKey.startsWith('sk-')) {
      return res.status(400).json({ 
        error: 'Invalid OpenAI API key format' 
      });
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. 
                   Return ONLY the translation without any additional text, explanations, or formatting. 
                   Preserve the structure if there are multiple lines or paragraphs.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const translatedText = response.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation received from OpenAI');
    }

    res.status(200).json({ translatedText });

  } catch (error) {
    console.error('Translation error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });

    if (error.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid OpenAI API key. Please check your API key and try again.' 
      });
    }

    if (error.status === 429) {
      return res.status(429).json({ 
        error: 'OpenAI API rate limit exceeded. Please try again later.' 
      });
    }

    if (error.status === 402) {
      return res.status(402).json({ 
        error: 'OpenAI API quota exceeded. Please check your OpenAI account.' 
      });
    }

    res.status(500).json({ 
      error: 'Translation failed. Please try again.' 
    });
  }
}
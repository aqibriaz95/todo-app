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
    const { todoTitle, todoDescription = '', openaiKey, targetLanguage = 'English' } = req.body;

    if (!todoTitle || !openaiKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: todoTitle and openaiKey are required' 
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

    const prompt = `Break down the following task into 3-5 specific, actionable subtasks that would help complete the main task. Each subtask should be:
- Clear and specific
- Actionable (something you can actually do)
- Independent (can be completed on its own)
- Measurable (you'll know when it's done)

Main Task: ${todoTitle}
${todoDescription ? `Description: ${todoDescription}` : ''}

IMPORTANT: Generate all subtasks in ${targetLanguage}. If the main task is in ${targetLanguage}, the subtasks should also be in ${targetLanguage}.

Return your response as a JSON array of strings, with each string being a subtask title in ${targetLanguage}. Do not include any other text or formatting.

Example format: ["Subtask 1", "Subtask 2", "Subtask 3"]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that breaks down tasks into actionable subtasks. Always respond with valid JSON array format. Generate subtasks in ${targetLanguage} language.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const responseText = response.choices[0]?.message?.content?.trim();

    if (!responseText) {
      throw new Error('No response received from OpenAI');
    }

    try {
      // Try to parse as JSON
      const subtasks = JSON.parse(responseText);
      
      if (!Array.isArray(subtasks)) {
        throw new Error('Response is not an array');
      }

      if (subtasks.length === 0) {
        throw new Error('No subtasks generated');
      }

      // Validate that all items are strings and not empty
      const validSubtasks = subtasks
        .filter(item => typeof item === 'string' && item.trim().length > 0)
        .map(item => item.trim())
        .slice(0, 7); // Limit to maximum 7 subtasks

      if (validSubtasks.length === 0) {
        throw new Error('No valid subtasks found');
      }

      res.status(200).json({ subtasks: validSubtasks });

    } catch (parseError) {
      // If JSON parsing fails, try to extract subtasks from text
      console.log('JSON parse failed, trying text extraction:', responseText);
      
      // Look for lines that might be subtasks
      const lines = responseText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.startsWith('{') && !line.startsWith('}'))
        .map(line => line.replace(/^[\-\*\d\.]+\s*/, '')) // Remove bullets, numbers
        .map(line => line.replace(/^"|"$/g, '')) // Remove quotes
        .filter(line => line.length > 3)
        .slice(0, 6);

      if (lines.length > 0) {
        res.status(200).json({ subtasks: lines });
      } else {
        throw new Error('Could not parse subtasks from response');
      }
    }

  } catch (error) {
    console.error('Subtask generation error:', error);
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
      error: 'Subtask generation failed. Please try again.' 
    });
  }
}
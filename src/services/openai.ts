import { TranslationRequest, TranslationResponse, SubtaskGenerationRequest, SubtaskGenerationResponse } from '../types';

export class OpenAIService {
  private readonly baseUrl = '/api';
  private readonly isDevelopment = import.meta.env.DEV;

  async translateText(text: string, targetLanguage: string, apiKey: string): Promise<string> {
    // In development, use direct OpenAI API calls since Vercel functions aren't available
    if (this.isDevelopment) {
      return this.translateTextDirect(text, targetLanguage, apiKey);
    }

    try {
      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          openaiKey: apiKey,
        } as TranslationRequest),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Translation API error:', error);
        // Fallback to direct API call if serverless function fails
        return this.translateTextDirect(text, targetLanguage, apiKey);
      }

      const data: TranslationResponse = await response.json();
      return data.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback to direct API call
      return this.translateTextDirect(text, targetLanguage, apiKey);
    }
  }

  private async translateTextDirect(text: string, targetLanguage: string, apiKey: string): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${targetLanguage}. Return ONLY the translation without any additional text, explanations, or formatting. Preserve the structure if there are multiple lines or paragraphs.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const translatedText = data.choices[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error('No translation received from OpenAI');
      }

      return translatedText;
    } catch (error) {
      console.error('Direct translation error:', error);
      throw error instanceof Error ? error : new Error('Translation failed');
    }
  }

  async generateSubtasks(title: string, description: string = '', apiKey: string, targetLanguage: string = 'English'): Promise<string[]> {
    // In development, use direct OpenAI API calls since Vercel functions aren't available
    if (this.isDevelopment) {
      return this.generateSubtasksDirect(title, description, apiKey, targetLanguage);
    }

    try {
      const response = await fetch(`${this.baseUrl}/generate-subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          todoTitle: title,
          todoDescription: description,
          openaiKey: apiKey,
          targetLanguage: targetLanguage,
        } as SubtaskGenerationRequest & { targetLanguage: string }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Subtask generation API error:', error);
        // Fallback to direct API call if serverless function fails
        return this.generateSubtasksDirect(title, description, apiKey, targetLanguage);
      }

      const data: SubtaskGenerationResponse = await response.json();
      return data.subtasks;
    } catch (error) {
      console.error('Subtask generation error:', error);
      // Fallback to direct API call
      return this.generateSubtasksDirect(title, description, apiKey, targetLanguage);
    }
  }

  private async generateSubtasksDirect(title: string, description: string, apiKey: string, targetLanguage: string = 'English'): Promise<string[]> {
    try {
      const prompt = `Break down the following task into 3-5 specific, actionable subtasks that would help complete the main task. Each subtask should be:
- Clear and specific
- Actionable (something you can actually do)
- Independent (can be completed on its own)
- Measurable (you'll know when it's done)

Main Task: ${title}
${description ? `Description: ${description}` : ''}

IMPORTANT: Generate all subtasks in ${targetLanguage}. If the main task is in ${targetLanguage}, the subtasks should also be in ${targetLanguage}.

Return your response as a JSON array of strings, with each string being a subtask title in ${targetLanguage}. Do not include any other text or formatting.

Example format: ["Subtask 1", "Subtask 2", "Subtask 3"]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content?.trim();

      if (!responseText) {
        throw new Error('No response received from OpenAI');
      }

      try {
        const subtasks = JSON.parse(responseText);
        
        if (!Array.isArray(subtasks)) {
          throw new Error('Response is not an array');
        }

        if (subtasks.length === 0) {
          throw new Error('No subtasks generated');
        }

        const validSubtasks = subtasks
          .filter(item => typeof item === 'string' && item.trim().length > 0)
          .map(item => item.trim())
          .slice(0, 7);

        if (validSubtasks.length === 0) {
          throw new Error('No valid subtasks found');
        }

        return validSubtasks;

      } catch (parseError) {
        console.log('JSON parse failed, trying text extraction:', responseText);
        
        const lines = responseText
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0)
          .filter((line: string) => !line.startsWith('{') && !line.startsWith('}'))
          .map((line: string) => line.replace(/^[\-\*\d\.]+\s*/, ''))
          .map((line: string) => line.replace(/^"|"$/g, ''))
          .filter((line: string) => line.length > 3)
          .slice(0, 6);

        if (lines.length > 0) {
          return lines;
        } else {
          throw new Error('Could not parse subtasks from response');
        }
      }

    } catch (error) {
      console.error('Direct subtask generation error:', error);
      throw error instanceof Error ? error : new Error('Subtask generation failed');
    }
  }

  validateApiKey(apiKey: string): boolean {
    return Boolean(apiKey && apiKey.trim().length > 0 && apiKey.startsWith('sk-'));
  }
}
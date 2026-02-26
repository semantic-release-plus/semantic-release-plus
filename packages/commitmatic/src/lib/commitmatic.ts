import OpenAI from 'openai';
import { createPrompt } from './create-prompt';
import { defaultConfig } from './default-config';
import { getUserConfig } from './get-config';
import { normalizeConfig } from './normalize-config';

export async function createCommitMessage() {
  // read config
  const config = normalizeConfig(defaultConfig, await getUserConfig());

  const openai = new OpenAI({});

  const prompt = createPrompt(config);

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant specialized in crafting Git commit messages following the convention the user defines. Assist the user in generating clear and compliant commit messages based on the information they provide.',
      },
      { role: 'user', content: prompt },
    ],
    model: config.model,
  });

  // validate that there is message content if not throw error
  if (!chatCompletion.choices[0].message.content) {
    throw new Error('No message content');
  }
  return chatCompletion.choices[0].message.content;
}

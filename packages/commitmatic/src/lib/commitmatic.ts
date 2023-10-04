import { cosmiconfig } from 'cosmiconfig';
import OpenAI from 'openai';
import { createPrompt } from './create-prompt';
import { defaultConfig } from './default-config';
import { Config, normalizeConfig } from './normalize-config';

const moduleName = 'commitmatic';

async function getUserConfig() {
  const config = await cosmiconfig(moduleName).search();
  return config?.config as Config;
}

export async function main() {
  // read config
  const config = normalizeConfig(defaultConfig, await getUserConfig());

  console.log({ config });

  const openai = new OpenAI({});

  const prompt = createPrompt(config);

  console.log({ prompt });

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: config.model,
  });

  console.log(chatCompletion.choices);
}

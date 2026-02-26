import { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions';

export interface Config {
  prompt: string;
  model: ChatCompletionCreateParamsBase['model'];
  ignoreFiles: string[];
  ignoreTemplate: boolean;
}

export function normalizeConfig(initialConfig: Config, config: Config): Config {
  return {
    ...initialConfig,
    ...config,
  };
}

import { ImageName, ImageNameInterface } from './image-name';

export interface PluginConfig {
  name: string | ImageNameInterface;
  skipLogin?: boolean;
  registry?: string;
  publishChannelTag?: boolean;
}

export interface NormalizedPluginConfig {
  image: ImageName;
  skipLogin: boolean;
  publishChannelTag: boolean;
}

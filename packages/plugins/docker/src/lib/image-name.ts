export interface ImageNameInterface {
  registry?: string;
  namespace?: string;
  repository: string;
  tag?: string;
  sha?: string;
}

export interface ImageDetailsInterface extends ImageNameInterface {
  readonly name: string;
  readonly nameWithSuffix: string;
  readonly localName: string;
  readonly localNameWithSuffix: string;
}

export class ImageName implements ImageDetailsInterface {
  registry?: string;
  namespace?: string;
  repository: string;
  tag?: string;
  sha?: string;

  constructor(image: string | ImageNameInterface) {
    let imgObj: ImageNameInterface;
    if (ImageName.isObject(image)) {
      imgObj = image;
    } else {
      imgObj = this._fromString(image);
    }

    this.repository = imgObj.repository;
    this.registry = imgObj.registry;
    this.namespace = imgObj.namespace;
    this.tag = imgObj.tag;
    this.sha = imgObj.sha;
  }

  get formatted() {
    return {
      registry: this.registry ? `${this.registry}/` : '',
      namespace:
        this.namespace && this.namespace !== 'library'
          ? `${this.namespace}/`
          : '',
      suffix: this.sha
        ? `@${this.sha}`
        : this.tag && this.tag !== 'latest'
        ? `:${this.tag}`
        : '',
    };
  }

  get localName() {
    return this.formatted.namespace + this.repository;
  }
  get localNameWithSuffix() {
    return this.localName + this.formatted.suffix;
  }

  get name() {
    return this.formatted.registry + this.localName;
  }

  get nameWithSuffix() {
    return this.formatted.registry + this.localNameWithSuffix;
  }

  private _fromString(image: string): ImageNameInterface {
    const match = image.match(
      /^(?:(?<registry>[^/]+)\/)?(?:(?<namespace>[^/]+)\/)?(?<repository>[^@:/]+)(?::(?<tag>.+))?(?:@(?<sha>.+))?$/
    );
    if (!match) {
      throw Error('Invalid docker image name');
    }

    let { registry, namespace } = match.groups;
    const { repository, tag, sha } = match.groups;

    if (!namespace && registry && !/[:.]/.test(registry)) {
      namespace = registry;
      registry = undefined;
    }

    return {
      registry,
      namespace,
      repository,
      tag,
      sha,
    };
  }

  toJSON(): ImageDetailsInterface {
    return {
      registry: this.registry,
      namespace: this.namespace,
      repository: this.repository,
      tag: this.tag,
      sha: this.sha,
      name: this.name,
      nameWithSuffix: this.nameWithSuffix,
      localName: this.localName,
      localNameWithSuffix: this.localNameWithSuffix,
    };
  }

  static isObject(
    imageName: string | ImageNameInterface
  ): imageName is ImageNameInterface {
    return (imageName as ImageNameInterface).repository !== undefined;
  }
}

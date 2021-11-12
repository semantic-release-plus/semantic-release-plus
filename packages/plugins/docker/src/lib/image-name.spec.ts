import { ImageDetailsInterface, ImageName } from './image-name';

describe('ImageName Spec', () => {
  describe('create new ImageName', () => {
    describe('from string', () => {
      it('with registry, port, namespace, repo, and tag', () => {
        const i = new ImageName('my-reg:9876/my-namespace/my-repo:1.2.3');
        const expectedImageDetails: ImageDetailsInterface = {
          registry: 'my-reg:9876',
          namespace: 'my-namespace',
          repository: 'my-repo',
          tag: '1.2.3',
          name: 'my-reg:9876/my-namespace/my-repo',
          nameWithSuffix: 'my-reg:9876/my-namespace/my-repo:1.2.3',
          localName: 'my-namespace/my-repo',
          localNameWithSuffix: 'my-namespace/my-repo:1.2.3',
        };
        expect(i.toJSON()).toEqual(expectedImageDetails);
      });

      it('with registry, port, namespace, repo, and sha', () => {
        const i = new ImageName(
          'my-reg:9876/my-namespace/my-repo@sha256:49cb0d58e7fee6e86d061f152bbbd529cf41059e9da00868babed2380c4a3d61'
        );
        const expectedImageDetails: ImageDetailsInterface = {
          registry: 'my-reg:9876',
          namespace: 'my-namespace',
          repository: 'my-repo',
          sha: 'sha256:49cb0d58e7fee6e86d061f152bbbd529cf41059e9da00868babed2380c4a3d61',
          name: 'my-reg:9876/my-namespace/my-repo',
          nameWithSuffix:
            'my-reg:9876/my-namespace/my-repo@sha256:49cb0d58e7fee6e86d061f152bbbd529cf41059e9da00868babed2380c4a3d61',
          localName: 'my-namespace/my-repo',
          localNameWithSuffix:
            'my-namespace/my-repo@sha256:49cb0d58e7fee6e86d061f152bbbd529cf41059e9da00868babed2380c4a3d61',
        };
        expect(i.toJSON()).toEqual(expectedImageDetails);
      });

      it('create ImageName from with namespace', () => {
        const i = new ImageName('cypress/included:3.2.0');
      });

      it('should throw an error if given an invalid name string', () => {
        expect.assertions(1);
        try {
          new ImageName('a/b/c/d');
        } catch (error) {
          expect(error.message).toMatch('Invalid docker image name');
        }
      });
    });

    describe('from object', () => {
      it('repository only', () => {
        const i = new ImageName({
          repository: 'my-repo',
        });

        const expectedImageDetails: ImageDetailsInterface = {
          repository: 'my-repo',
          name: 'my-repo',
          nameWithSuffix: 'my-repo',
          localName: 'my-repo',
          localNameWithSuffix: 'my-repo',
        };
        expect(i.toJSON()).toEqual(expectedImageDetails);
      });

      it('with custom registry', () => {
        const i = new ImageName({
          registry: 'my-reg.io',
          repository: 'my-repo',
        });

        const expectedImageDetails: ImageDetailsInterface = {
          localName: 'my-repo',
          localNameWithSuffix: 'my-repo',
          name: 'my-reg.io/my-repo',
          nameWithSuffix: 'my-reg.io/my-repo',
          registry: 'my-reg.io',
          repository: 'my-repo',
        };

        expect(i.toJSON()).toEqual(expectedImageDetails);
      });
    });
  });
});

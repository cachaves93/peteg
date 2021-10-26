import { ImageToBase64Pipe } from './image-to-base64.pipe';

describe('ImageToBase64Pipe', () => {
  it('create an instance', () => {
    const pipe = new ImageToBase64Pipe();
    expect(pipe).toBeTruthy();
  });
});

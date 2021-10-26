import { SafeValuePipe } from './safe-value.pipe';

describe('SafeValuePipe', () => {
  it('create an instance', () => {
    const pipe = new SafeValuePipe();
    expect(pipe).toBeTruthy();
  });
});

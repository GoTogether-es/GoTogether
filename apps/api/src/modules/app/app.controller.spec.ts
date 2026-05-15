import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns ok health status', () => {
    const controller = new AppController();
    expect(controller.health()).toEqual({ status: 'ok' });
  });
});

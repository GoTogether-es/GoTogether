import { GlobalExceptionFilter } from './global-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  function createArgs(statusCode?: number) {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const response = { status };
    const request = { method: 'GET', url: '/test' };
    const host = {
      switchToHttp: () => ({ getResponse: () => response, getRequest: () => request }),
    } as any;
    return { json, status, response, request, host };
  }

  it('handles HttpException with string message', () => {
    const { host, status, json } = createArgs();
    const exception = new HttpException('Not found', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: HttpStatus.NOT_FOUND, message: ['Not found'] }),
    );
  });

  it('handles HttpException with object message (ValidationPipe errors)', () => {
    const { host, status, json } = createArgs();
    const exception = new HttpException(
      { message: ['name is required', 'email is invalid'] },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const call = json.mock.calls[0][0];
    expect(call.message).toEqual(['name is required', 'email is invalid']);
  });

  it('handles unknown Error with 500 and logs', () => {
    process.env.NODE_ENV = 'development';
    const { host, status, json } = createArgs();
    const exception = new Error('Something broke');

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    const call = json.mock.calls[0][0];
    expect(call.message).toEqual(['Error interno del servidor']);
    expect(call.stack).toBeDefined();
  });

  it('handles non-Error throwables', () => {
    const { host, status } = createArgs();
    const exception = 'raw string error';

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });

  it('hides stack trace in production', () => {
    process.env.NODE_ENV = 'production';
    const { host, json } = createArgs();
    const exception = new Error('Sensitive');

    filter.catch(exception, host);

    const call = json.mock.calls[0][0];
    expect(call.stack).toBeUndefined();
    process.env.NODE_ENV = 'test';
  });

  it('wraps non-array message in array', () => {
    const { host, json } = createArgs();
    const exception = new HttpException('Single error', HttpStatus.FORBIDDEN);

    filter.catch(exception, host);

    const call = json.mock.calls[0][0];
    expect(Array.isArray(call.message)).toBe(true);
    expect(call.message).toEqual(['Single error']);
  });

  it('includes path and timestamp in response', () => {
    const { host, json } = createArgs();
    const exception = new HttpException('Test', HttpStatus.OK);

    filter.catch(exception, host);

    const call = json.mock.calls[0][0];
    expect(call.path).toBe('/test');
    expect(call.timestamp).toBeDefined();
  });
});

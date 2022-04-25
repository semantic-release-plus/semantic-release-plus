import { repeat } from 'lodash';
import * as hideSensitive from './hide-sensitive';
import { SECRET_REPLACEMENT, SECRET_MIN_SIZE } from './definitions/constants';

describe('hide-sensitive', () => {
  test('Replace multiple sensitive environment variable values', () => {
    const env = { SOME_PASSWORD: 'password', SOME_TOKEN: 'secret' };
    expect(
      hideSensitive(env)(
        `https://user:${env.SOME_PASSWORD}@host.com?token=${env.SOME_TOKEN}`
      )
    ).toBe(
      `https://user:${SECRET_REPLACEMENT}@host.com?token=${SECRET_REPLACEMENT}`
    );
  });

  test('Replace multiple occurences of sensitive environment variable values', () => {
    const env = { secretKey: 'secret' };
    expect(
      hideSensitive(env)(
        `https://user:${env.secretKey}@host.com?token=${env.secretKey}`
      )
    ).toBe(
      `https://user:${SECRET_REPLACEMENT}@host.com?token=${SECRET_REPLACEMENT}`
    );
  });

  test('Replace sensitive environment variable matching specific regex for "private"', () => {
    const env = { privateKey: 'secret', GOPRIVATE: 'host.com' };
    expect(hideSensitive(env)(`https://host.com?token=${env.privateKey}`)).toBe(
      `https://host.com?token=${SECRET_REPLACEMENT}`
    );
  });

  test('Replace url-encoded environment variable', () => {
    const env = { privateKey: 'secret ' };
    expect(
      hideSensitive(env)(`https://host.com?token=${encodeURI(env.privateKey)}`)
    ).toBe(`https://host.com?token=${SECRET_REPLACEMENT}`);
  });

  test('Escape regexp special characters', () => {
    const env = { SOME_CREDENTIALS: 'p$^{.+}\\w[a-z]o.*rd' };
    expect(
      hideSensitive(env)(`https://user:${env.SOME_CREDENTIALS}@host.com`)
    ).toBe(`https://user:${SECRET_REPLACEMENT}@host.com`);
  });

  test('Escape regexp special characters in url-encoded environment variable', () => {
    const env = { SOME_PASSWORD: 'secret password p$^{.+}\\w[a-z]o.*rd)(' };
    expect(
      hideSensitive(env)(
        `https://user:${encodeURI(env.SOME_PASSWORD)}@host.com`
      )
    ).toBe(`https://user:${SECRET_REPLACEMENT}@host.com`);
  });

  test('Accept "undefined" input', () => {
    expect(hideSensitive({})()).toBe(undefined);
  });

  test('Return same string if no environment variable has to be replaced', () => {
    expect(hideSensitive({})('test')).toBe('test');
  });

  test('Exclude empty environment variables from the regexp', () => {
    const env = { SOME_PASSWORD: 'password', SOME_TOKEN: '' };
    expect(
      hideSensitive(env)(`https://user:${env.SOME_PASSWORD}@host.com?token=`)
    ).toBe(`https://user:${SECRET_REPLACEMENT}@host.com?token=`);
  });

  test('Exclude empty environment variables from the regexp if there is only empty ones', () => {
    expect(
      hideSensitive({ SOME_PASSWORD: '', SOME_TOKEN: ' \n ' })(
        `https://host.com?token=`
      )
    ).toBe('https://host.com?token=');
  });

  test('Exclude nonsensitive GOPRIVATE environment variable for Golang projects from the regexp', () => {
    const env = { GOPRIVATE: 'host.com' };
    expect(hideSensitive(env)(`https://host.com?token=`)).toBe(
      'https://host.com?token='
    );
  });

  test('Exclude environment variables with value shorter than SECRET_MIN_SIZE from the regexp', () => {
    const SHORT_TOKEN = repeat('a', SECRET_MIN_SIZE - 1);
    const LONG_TOKEN = repeat('b', SECRET_MIN_SIZE);
    const env = { SHORT_TOKEN, LONG_TOKEN };
    expect(
      hideSensitive(env)(
        `https://user:${SHORT_TOKEN}@host.com?token=${LONG_TOKEN}`
      )
    ).toBe(`https://user:${SHORT_TOKEN}@host.com?token=${SECRET_REPLACEMENT}`);
  });
});

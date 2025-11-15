/**
 * Unit tests for settings merge function
 */

import { mergeSettings } from '../settings-merge';

describe('mergeSettings', () => {
  const defaultServerSettings = {
    paypalClientId: 'server-client-id',
    paypalClientSecret: 'server-secret',
    telegramBotToken: 'server-token',
    contactEmail: 'server@example.com',
    paypalEnabled: true,
    cryptoEnabled: false,
  };

  test('should preserve server values when payload has empty strings', () => {
    const payload = {
      paypalClientId: '',
      contactEmail: '',
    };

    const result = mergeSettings({
      serverSettings: defaultServerSettings,
      clientPayload: payload,
    });

    expect(result.paypalClientId).toBe('server-client-id');
    expect(result.contactEmail).toBe('server@example.com');
    expect(result.paypalClientSecret).toBe('server-secret');
  });

  test('should preserve server values when payload has undefined', () => {
    const payload = {
      paypalClientId: undefined,
      telegramBotToken: undefined,
    };

    const result = mergeSettings({
      serverSettings: defaultServerSettings,
      clientPayload: payload,
    });

    expect(result.paypalClientId).toBe('server-client-id');
    expect(result.telegramBotToken).toBe('server-token');
  });

  test('should preserve server values when payload has null', () => {
    const payload = {
      paypalClientId: null,
    };

    const result = mergeSettings({
      serverSettings: defaultServerSettings,
      clientPayload: payload,
    });

    expect(result.paypalClientId).toBe('server-client-id');
  });

  test('should override server values when payload has explicit values', () => {
    const payload = {
      paypalClientId: 'new-client-id',
      contactEmail: 'new@example.com',
    };

    const result = mergeSettings({
      serverSettings: defaultServerSettings,
      clientPayload: payload,
    });

    expect(result.paypalClientId).toBe('new-client-id');
    expect(result.contactEmail).toBe('new@example.com');
    expect(result.paypalClientSecret).toBe('server-secret'); // Preserved
  });

  test('should remove field when explicit remove flag is set', () => {
    const payload = {
      paypalClientId_remove: true,
    };

    const result = mergeSettings({
      serverSettings: defaultServerSettings,
      clientPayload: payload,
    });

    expect(result.paypalClientId).toBeUndefined();
  });

  test('should handle missing fields in payload', () => {
    const payload = {
      paypalEnabled: false,
    };

    const result = mergeSettings({
      serverSettings: defaultServerSettings,
      clientPayload: payload,
    });

    expect(result.paypalEnabled).toBe(false);
    expect(result.paypalClientId).toBe('server-client-id'); // Preserved
    expect(result.cryptoEnabled).toBe(false); // From server
  });

  test('should handle boolean fields correctly', () => {
    const payload = {
      paypalEnabled: true,
      cryptoEnabled: true,
    };

    const result = mergeSettings({
      serverSettings: defaultServerSettings,
      clientPayload: payload,
    });

    expect(result.paypalEnabled).toBe(true);
    expect(result.cryptoEnabled).toBe(true);
  });

  test('should handle empty server settings', () => {
    const payload = {
      paypalClientId: 'new-id',
      paypalEnabled: true,
    };

    const result = mergeSettings({
      serverSettings: {},
      clientPayload: payload,
    });

    expect(result.paypalClientId).toBe('new-id');
    expect(result.paypalEnabled).toBe(true);
    expect(result.cryptoEnabled).toBe(false); // Default
  });

  test('should handle custom protected fields', () => {
    const payload = {
      customField: '',
    };

    const result = mergeSettings({
      serverSettings: {
        customField: 'server-value',
      },
      clientPayload: payload,
      protectedFields: ['customField'],
    });

    expect(result.customField).toBe('server-value');
  });
});


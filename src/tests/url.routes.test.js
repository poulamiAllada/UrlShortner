import request from 'supertest';
import app from '../../app.js';

jest.mock('../services/url.service.js', () => ({
  createShortUrl: jest.fn(),
  getOriginalUrl: jest.fn(),
}));

jest.mock('../utils/rateLimiter.js', () => ({
  checkRateLimit: jest.fn().mockResolvedValue(true),
}));

import * as service from '../services/url.service.js';


describe('POST /api/url/shorten', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 201 and a shortUrl for a valid URL', async () => {
    service.createShortUrl.mockResolvedValue('http://localhost:3000/api/url/2Bi0j');

    const res = await request(app)
      .post('/api/url/shorten')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('shortUrl');
    expect(service.createShortUrl).toHaveBeenCalledWith('https://example.com');
  });

  test('returns 400 when url is missing', async () => {
    const res = await request(app)
      .post('/api/url/shorten')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/url is required/i);
    expect(service.createShortUrl).not.toHaveBeenCalled();
  });

  test('returns 400 for an invalid URL format', async () => {
    const res = await request(app)
      .post('/api/url/shorten')
      .send({ url: 'not-a-url' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/invalid url/i);
  });

  test('returns 400 for a URL exceeding 2048 characters', async () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2050);
    const res = await request(app)
      .post('/api/url/shorten')
      .send({ url: longUrl });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/2048/);
  });

  test('returns 429 when rate limit is exceeded', async () => {
    const { checkRateLimit } = await import('../utils/rateLimiter.js');
    checkRateLimit.mockResolvedValueOnce(false);

    const res = await request(app)
      .post('/api/url/shorten')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(429);
  });

  test('returns 500 when service throws', async () => {
    service.createShortUrl.mockRejectedValue(new Error('DB down'));

    const res = await request(app)
      .post('/api/url/shorten')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(500);
  });
});

describe('GET /api/url/:code', () => {
  beforeEach(() => jest.clearAllMocks());

  test('redirects to the original URL with 302', async () => {
    service.getOriginalUrl.mockResolvedValue('https://example.com');

    const res = await request(app).get('/api/url/2Bi0j');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com');
  });

  test('returns 404 for unknown short codes', async () => {
    service.getOriginalUrl.mockResolvedValue(null);

    const res = await request(app).get('/api/url/unknown');

    expect(res.status).toBe(404);
  });

  test('returns 500 when service throws', async () => {
    service.getOriginalUrl.mockRejectedValue(new Error('DB down'));

    const res = await request(app).get('/api/url/2Bi0j');

    expect(res.status).toBe(500);
  });
});

describe('GET /health', () => {
  test('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

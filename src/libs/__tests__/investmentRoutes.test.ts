/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST as postPrices } from '@/app/api/investments/prices/route';
import { POST as postInsights } from '@/app/api/investments/insights/route';
import { getAuthenticatedUser } from '@/utils/supabase/server';

jest.mock('@/utils/supabase/server', () => ({ getAuthenticatedUser: jest.fn() }));

const request = (path: string, body: unknown) =>
  new NextRequest(`http://localhost${path}`, { method: 'POST', body: JSON.stringify(body) });

describe('POST /api/investments/prices', () => {
  beforeEach(() => jest.clearAllMocks());

  it('refuses a caller without a session', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

    const response = await postPrices(
      request('/api/investments/prices', { positions: [{ id: '1', asset_type: 'crypto', symbol: 'BTC', external_id: 'bitcoin' }] })
    );

    expect(response.status).toBe(401);
  });

  it('answers a signed-in caller', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'user-1' });

    const response = await postPrices(request('/api/investments/prices', { positions: [] }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ quotes: {} });
  });
});

describe('POST /api/investments/insights', () => {
  beforeEach(() => jest.clearAllMocks());

  it('refuses a caller without a session', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

    const response = await postInsights(request('/api/investments/insights', { summary: {}, positions: [] }));

    expect(response.status).toBe(401);
  });

  it('answers a signed-in caller', async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({ id: 'user-1' });

    const response = await postInsights(request('/api/investments/insights', { summary: {}, positions: [] }));

    expect(response.status).toBe(200);
  });
});

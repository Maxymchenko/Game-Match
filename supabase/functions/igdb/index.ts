import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigin = Deno.env.get('APP_ORIGIN') ?? 'http://localhost:5173';
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  let publishableKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!publishableKey) {
    try {
      const keys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}') as {
        default?: string;
      };
      publishableKey = keys.default;
    } catch {
      publishableKey = undefined;
    }
  }

  const twitchClientId = Deno.env.get('TWITCH_CLIENT_ID');
  const twitchClientSecret = Deno.env.get('TWITCH_CLIENT_SECRET');

  if (!supabaseUrl || !publishableKey || !twitchClientId || !twitchClientSecret) {
    console.error('Missing required Edge Function environment variables.');
    return jsonResponse({ error: 'Game catalog service is not configured.' }, 500);
  }

  const supabase = createClient(supabaseUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = authorization.slice('Bearer '.length);
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return jsonResponse({ error: 'Invalid or expired session.' }, 401);
  }

  let payload: { mode?: unknown; search?: unknown; offset?: unknown };
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return jsonResponse({ error: 'Request body must be a JSON object.' }, 400);
    }
    payload = parsed as { mode?: unknown; search?: unknown; offset?: unknown };
  } catch {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
  }

  const mode = payload.mode ?? 'search';
  if (mode !== 'search' && mode !== 'popular') {
    return jsonResponse({ error: 'Unsupported catalog request.' }, 400);
  }

  let search = '';
  let offset = 0;
  if (mode === 'popular') {
    if (payload.offset !== undefined &&
      (typeof payload.offset !== 'number' || !Number.isInteger(payload.offset) ||
        payload.offset < 0 || payload.offset > 500)) {
      return jsonResponse({ error: 'Invalid catalog offset.' }, 400);
    }
    offset = typeof payload.offset === 'number' ? payload.offset : 0;
  } else {
    if (typeof payload.search !== 'string') {
      return jsonResponse({ error: 'Provide a search term of 1–100 characters.' }, 400);
    }
    search = payload.search.trim();
    if (!search || search.length > 100) {
      return jsonResponse({ error: 'Provide a search term of 1–100 characters.' }, 400);
    }
  }

  try {
    const tokenUrl =
      'https://id.twitch.tv/oauth2/token?client_id=' +
      encodeURIComponent(twitchClientId) +
      '&client_secret=' +
      encodeURIComponent(twitchClientSecret) +
      '&grant_type=client_credentials';
    const tokenResponse = await fetch(tokenUrl, { method: 'POST' });

    if (!tokenResponse.ok) {
      console.error('Twitch token request failed:', tokenResponse.status);
      return jsonResponse({ error: 'Unable to authenticate with the game catalog.' }, 502);
    }

    const tokenData = await tokenResponse.json();
    const fields =
      'fields name, summary, first_release_date, aggregated_rating, aggregated_rating_count, cover.url, genres.name, themes.name, keywords.name, player_perspectives.name, platforms.name;';
    const safeSearch = search.replaceAll('\\\\', '\\\\\\\\').replaceAll('"', '\\\\"');
    const igdbQuery =
      mode === 'popular'
        ? fields +
          ' where aggregated_rating != null & aggregated_rating_count > 20;' +
          ' sort aggregated_rating desc; limit 40; offset ' + offset + ';'
        : 'search "' + safeSearch + '"; ' + fields + ' limit 20;';

    const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': twitchClientId,
        Authorization: 'Bearer ' + tokenData.access_token,
        'Content-Type': 'text/plain',
      },
      body: igdbQuery,
    });

    if (!igdbResponse.ok) {
      console.error('IGDB request failed:', igdbResponse.status);
      return jsonResponse({ error: 'The game catalog request failed.' }, 502);
    }

    const games = await igdbResponse.json();
    return jsonResponse(games);
  } catch (error) {
    console.error('IGDB proxy error:', error);
    return jsonResponse({ error: 'Unexpected game catalog error.' }, 500);
  }
});

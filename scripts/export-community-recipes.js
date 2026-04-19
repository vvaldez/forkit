/**
 * export-community-recipes.js
 *
 * Queries the Supabase community_recipes table using the service role key
 * (bypasses RLS) and writes the result to community-recipes-export.json
 * in a format compatible with the existing CSV importer.
 *
 * Run via GitHub Actions weekly cron or manually:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/export-community-recipes.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
    req.on('error', reject);
  });
}

async function main() {
  const url = `${SUPABASE_URL}/rest/v1/community_recipes?select=*&is_hidden=eq.false&order=created_at.asc`;
  const headers = {
    'apikey': SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Accept': 'application/json',
  };

  console.log('Fetching community recipes from Supabase...');
  const rows = await httpsGet(url, headers);
  console.log(`Fetched ${rows.length} recipes`);

  const output = {
    exported_at: new Date().toISOString(),
    count: rows.length,
    recipes: rows.map((r) => ({
      id: r.id,
      name: r.name,
      cuisine_area: r.cuisine_area ?? '',
      dietary_tags: r.dietary_tags ?? '',
      meal_time_bucket: r.meal_time_bucket,
      cook_time_min: r.cook_time_min ?? null,
      servings: r.servings ?? '',
      instructions: r.instructions ?? '',
      ingredients_text: r.ingredients_text ?? '',
      image_url: r.image_url ?? '',
      youtube_url: r.youtube_url ?? '',
      author_display_name: r.author_display_name,
      created_at: r.created_at,
    })),
  };

  const outPath = path.join(__dirname, '..', 'community-recipes-export.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Wrote ${output.count} recipes to community-recipes-export.json`);
}

main().catch((e) => {
  console.error('Export failed:', e);
  process.exit(1);
});

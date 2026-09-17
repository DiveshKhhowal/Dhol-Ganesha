// Dhol Ganesha - Global Leaderboard API
// Vercel Serverless Function + Supabase

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(res, status, data) {
  res.status(status).json(data);
}

function validString(value, maxLength) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength;
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return json(res, 500, {
      error: "Supabase environment variables are not configured."
    });
  }

  // ---------------- GET LEADERBOARD ----------------
  if (req.method === "GET") {
    try {
      const campus = req.query?.campus;

      let url =
        `${SUPABASE_URL}/rest/v1/leaderboard` +
        `?select=niat_id,name,campus,score,combo,updated_at` +
        `&order=score.desc` +
        `&limit=100`;

      if (campus) {
        url += `&campus=eq.${encodeURIComponent(campus)}`;
      }

      const response = await fetch(url, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Supabase GET error:", data);
        return json(res, 500, {
          error: "Could not load leaderboard."
        });
      }

      const entries = data.map(row => ({
        niatId: row.niat_id,
        name: row.name,
        campus: row.campus,
        score: row.score,
        combo: row.combo || 0,
        updatedAt: row.updated_at
      }));

      return json(res, 200, entries);

    } catch (error) {
      console.error("Leaderboard GET failed:", error);

      return json(res, 500, {
        error: "Could not load leaderboard."
      });
    }
  }

  // ---------------- SAVE SCORE ----------------
  if (req.method === "POST") {
    try {
      const body = req.body || {};

      const niatId = String(body.niatId || "").trim();
      const name = String(body.name || "").trim();
      const campus = String(body.campus || "").trim();

      const score = Number(body.score);
      const combo = Number(body.combo || 0);

      if (!validString(niatId, 100)) {
        return json(res, 400, { error: "Invalid NIAT ID." });
      }

      if (!validString(name, 100)) {
        return json(res, 400, { error: "Invalid name." });
      }

      if (!validString(campus, 200)) {
        return json(res, 400, { error: "Invalid campus." });
      }

      if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > 1000000
      ) {
        return json(res, 400, { error: "Invalid score." });
      }

      if (
        !Number.isFinite(combo) ||
        combo < 0 ||
        combo > 100000
      ) {
        return json(res, 400, { error: "Invalid combo." });
      }

      // Check existing best score
      const lookupUrl =
        `${SUPABASE_URL}/rest/v1/leaderboard` +
        `?select=score` +
        `&niat_id=eq.${encodeURIComponent(niatId)}` +
        `&limit=1`;

      const lookupResponse = await fetch(lookupUrl, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!lookupResponse.ok) {
        console.error(
          "Supabase lookup error:",
          await lookupResponse.text()
        );

        return json(res, 500, {
          error: "Could not check existing score."
        });
      }

      const existing = await lookupResponse.json();

      // Don't replace a player's higher score
      if (existing.length > 0 && score <= Number(existing[0].score)) {
        return json(res, 200, {
          saved: false,
          message: "Existing score is higher or equal."
        });
      }

      // Insert/update best score
      const saveResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/leaderboard?on_conflict=niat_id`,
        {
          method: "POST",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=minimal"
          },
          body: JSON.stringify({
            niat_id: niatId,
            name: name,
            campus: campus,
            score: Math.floor(score),
            combo: Math.floor(combo),
            updated_at: new Date().toISOString()
          })
        }
      );

      if (!saveResponse.ok) {
        console.error(
          "Supabase save error:",
          await saveResponse.text()
        );

        return json(res, 500, {
          error: "Could not save score."
        });
      }

      return json(res, 200, {
        saved: true
      });

    } catch (error) {
      console.error("Leaderboard POST failed:", error);

      return json(res, 500, {
        error: "Could not save score."
      });
    }
  }

  // ---------------- OTHER METHODS ----------------
  res.setHeader("Allow", "GET, POST");

  return json(res, 405, {
    error: "Method not allowed."
  });
}

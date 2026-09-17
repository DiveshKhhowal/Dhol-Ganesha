// Dhol Ganesha Global Leaderboard
// Vercel Serverless Function + Supabase

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// IMPORTANT:
// This must match the table you created in Supabase.
const TABLE = "dhol_leaderboard";

function send(res, status, data) {
  res.status(status).json(data);
}

function validText(value, maxLength) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

async function supabaseFetch(path, options = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}

export default async function handler(req, res) {

  // Check environment variables
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return send(res, 500, {
      error: "Supabase environment variables are missing."
    });
  }

  // =====================================================
  // GET - LOAD LEADERBOARD
  // =====================================================

  if (req.method === "GET") {
    try {
      const response = await supabaseFetch(
        `${TABLE}?select=niat_id,name,campus,score,combo,updated_at&order=score.desc&limit=100`
      );

      const text = await response.text();

      if (!response.ok) {
        console.error("Supabase GET error:", text);

        return send(res, 500, {
          error: "Could not load leaderboard."
        });
      }

      const rows = JSON.parse(text);

      const entries = rows.map(row => ({
        niatId: row.niat_id,
        name: row.name,
        campus: row.campus,
        score: Number(row.score) || 0,
        combo: Number(row.combo) || 0,
        updatedAt: row.updated_at
      }));

      // Your script.js expects { entries: [...] }
      return send(res, 200, {
        entries
      });

    } catch (error) {
      console.error("GET leaderboard error:", error);

      return send(res, 500, {
        error: "Leaderboard unavailable."
      });
    }
  }

  // =====================================================
  // POST - SAVE SCORE
  // =====================================================

  if (req.method === "POST") {
    try {
      const body = req.body || {};

      const niatId = String(body.niatId || "").trim();
      const name = String(body.name || "").trim();
      const campus = String(body.campus || "").trim();

      const score = Number(body.score);
      const combo = Number(body.combo || 0);

      // Validate player information
      if (!validText(niatId, 100)) {
        return send(res, 400, {
          error: "Invalid NIAT ID."
        });
      }

      if (!validText(name, 100)) {
        return send(res, 400, {
          error: "Invalid player name."
        });
      }

      if (!validText(campus, 200)) {
        return send(res, 400, {
          error: "Invalid campus."
        });
      }

      // Validate score
      if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > 1000000
      ) {
        return send(res, 400, {
          error: "Invalid score."
        });
      }

      if (
        !Number.isFinite(combo) ||
        combo < 0 ||
        combo > 100000
      ) {
        return send(res, 400, {
          error: "Invalid combo."
        });
      }

      // =================================================
      // Check player's existing best score
      // =================================================

      const lookupResponse = await supabaseFetch(
        `${TABLE}?select=score&niat_id=eq.${encodeURIComponent(niatId)}&limit=1`
      );

      const lookupText = await lookupResponse.text();

      if (!lookupResponse.ok) {
        console.error("Supabase lookup error:", lookupText);

        return send(res, 500, {
          error: "Could not check existing score."
        });
      }

      const existingRows = JSON.parse(lookupText);

      // If existing score is higher/equal, don't replace it
      if (
        existingRows.length > 0 &&
        Number(existingRows[0].score) >= score
      ) {
        return send(res, 200, {
          saved: false,
          message: "Existing score is higher or equal."
        });
      }

      // =================================================
      // Insert / Update best score
      // =================================================

      const saveResponse = await supabaseFetch(
        `${TABLE}?on_conflict=niat_id`,
        {
          method: "POST",
          headers: {
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

      const saveText = await saveResponse.text();

      if (!saveResponse.ok) {
        console.error("Supabase save error:", saveText);

        return send(res, 500, {
          error: "Could not save score."
        });
      }

      return send(res, 200, {
        saved: true
      });

    } catch (error) {
      console.error("POST leaderboard error:", error);

      return send(res, 500, {
        error: "Could not save score."
      });
    }
  }

  // =====================================================
  // DELETE - ADMIN CLEAR
  // =====================================================

  if (req.method === "DELETE") {

    // Use a separate Vercel environment variable.
    // Never put an admin secret inside JavaScript.
    const adminCode = process.env.ADMIN_CODE;

    if (!adminCode) {
      return send(res, 403, {
        error: "Admin clearing is not configured."
      });
    }

    const suppliedCode = req.headers["x-admin-code"];

    if (!suppliedCode || suppliedCode !== adminCode) {
      return send(res, 403, {
        error: "Invalid admin code."
      });
    }

    try {
      const response = await supabaseFetch(
        `${TABLE}?niat_id=not.is.null`,
        {
          method: "DELETE",
          headers: {
            Prefer: "return=minimal"
          }
        }
      );

      const text = await response.text();

      if (!response.ok) {
        console.error("Supabase DELETE error:", text);

        return send(res, 500, {
          error: "Could not clear leaderboard."
        });
      }

      return send(res, 200, {
        cleared: true
      });

    } catch (error) {
      console.error("DELETE leaderboard error:", error);

      return send(res, 500, {
        error: "Could not clear leaderboard."
      });
    }
  }

  res.setHeader("Allow", "GET, POST, DELETE");

  return send(res, 405, {
    error: "Method not allowed."
  });
}

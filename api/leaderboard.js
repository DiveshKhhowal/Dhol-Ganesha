const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = "dhol_leaderboard";

function send(res, status, data) {
  return res.status(status).json(data);
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

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return send(res, 500, {
      error: "Supabase environment variables are missing."
    });
  }

  // =========================
  // GET LEADERBOARD
  // =========================

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

      return send(res, 200, { entries });

    } catch (error) {
      console.error("GET error:", error);

      return send(res, 500, {
        error: "Leaderboard unavailable."
      });
    }
  }

  // =========================
  // SAVE SCORE
  // =========================

  if (req.method === "POST") {
    try {
      const body = req.body || {};

      const niatId = String(body.niatId || "").trim();
      const name = String(body.name || "").trim();
      const campus = String(body.campus || "").trim();

      const score = Number(body.score);
      const combo = Number(body.combo || 0);

      if (!niatId || !name || !campus) {
        return send(res, 400, {
          error: "NIAT ID, name and campus are required."
        });
      }

      if (!Number.isFinite(score) || score < 0) {
        return send(res, 400, {
          error: "Invalid score."
        });
      }

      if (!Number.isFinite(combo) || combo < 0) {
        return send(res, 400, {
          error: "Invalid combo."
        });
      }

      // -------------------------
      // Check existing player
      // -------------------------

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

      // Existing score is already better
      if (
        existingRows.length > 0 &&
        Number(existingRows[0].score) >= score
      ) {
        return send(res, 200, {
          saved: false,
          message: "Existing score is higher or equal."
        });
      }

      // -------------------------
      // UPDATE existing player
      // -------------------------

      if (existingRows.length > 0) {

        const updateResponse = await supabaseFetch(
          `${TABLE}?niat_id=eq.${encodeURIComponent(niatId)}`,
          {
            method: "PATCH",
            headers: {
              Prefer: "return=minimal"
            },
            body: JSON.stringify({
              name,
              campus,
              score: Math.floor(score),
              combo: Math.floor(combo),
              updated_at: new Date().toISOString()
            })
          }
        );

        const updateText = await updateResponse.text();

        if (!updateResponse.ok) {
          console.error("Supabase UPDATE error:", updateText);

          return send(res, 500, {
            error: "Could not update score."
          });
        }

        return send(res, 200, {
          saved: true,
          updated: true
        });
      }

      // -------------------------
      // INSERT new player
      // -------------------------

      const insertResponse = await supabaseFetch(
        TABLE,
        {
          method: "POST",
          headers: {
            Prefer: "return=minimal"
          },
          body: JSON.stringify({
            niat_id: niatId,
            name,
            campus,
            score: Math.floor(score),
            combo: Math.floor(combo),
            updated_at: new Date().toISOString()
          })
        }
      );

      const insertText = await insertResponse.text();

      if (!insertResponse.ok) {
        console.error("Supabase INSERT error:", insertText);

        return send(res, 500, {
          error: "Could not insert score."
        });
      }

      return send(res, 200, {
        saved: true,
        updated: false
      });

    } catch (error) {
      console.error("POST leaderboard error:", error);

      return send(res, 500, {
        error: "Could not save score."
      });
    }
  }

  // =========================
  // ADMIN DELETE
  // =========================

  if (req.method === "DELETE") {

    const adminCode = process.env.ADMIN_CODE;
    const suppliedCode = req.headers["x-admin-code"];

    if (!adminCode || suppliedCode !== adminCode) {
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
      console.error("DELETE error:", error);

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

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const supabase = require("./database");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


app.get("/", (req, res) => {
  res.send("Backend toimii");
});

app.get("/api/activity-levels", async (req, res) => {
  const { data, error } = await supabase
    .from("activity_levels")
    .select("*")
    .order("id");

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.get("/api/nutrition-levels", async (req, res) => {
  const { data, error } = await supabase
    .from("nutrition_levels")
    .select("*")
    .order("id");

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.post("/api/generate-workout", async (req, res) => {
  try {
    const {
      weight,
      height,
      goal,
      activity_level_id,
      nutrition_level_id,
    } = req.body;

    if (!weight || !height || !goal || !activity_level_id || !nutrition_level_id) {
      return res.status(400).json({ error: "Puuttuvat tiedot" });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          weight,
          height,
          goal,
          activity_level_id,
          nutrition_level_id,
        },
      ])
      .select()
      .single();

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Luo 3 päivän treeniohjelma:
Paino: ${weight} kg
Pituus: ${height} cm
Tavoite: ${goal}
Aktiivisuustaso: ${activity_level_id}
Syömistaso: ${nutrition_level_id}

Anna treenipäivät, liikkeet, sarjat, toistot ja lyhyet ohjeet.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const { error: workoutError } = await supabase
      .from("workouts")
      .insert([
        {
          profile_id: profile.id,
          content: text,
        },
      ]);

    if (workoutError) {
      return res.status(500).json({ error: workoutError.message });
    }

    res.json({ workout: text });
  } catch (err) {
    console.error("VIRHE:", err);

    res.status(500).json({
      error: err.message || "Virhe backendissä",
    });
  }
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
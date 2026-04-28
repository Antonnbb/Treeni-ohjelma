import { useState } from 'react'
import axios from 'axios'
import './index.css'


function App() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [activityLevelId, setActivityLevelId] = useState("");
  const [nutritionLevelId, setNutritionLevelId] = useState("");
  const [workout, setWorkout] = useState("");
  const [loading, setLoading] = useState(false);

  const generateWorkout = async () => {
    try {
      setLoading(true);
      setWorkout("");

      const res = await axios.post("http://localhost:3001/api/generate-workout", {
        weight,
        height,
        goal,
        activity_level_id: activityLevelId,
        nutrition_level_id: nutritionLevelId,
      });

      setWorkout(res.data.workout);
    } catch (err) {
      setWorkout(err.response?.data?.error || "Virhe treeniohjelman luonnissa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Treeniohjelma</h1>

      <div className="form">

        <input placeholder="Paino kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <input placeholder="Pituus cm" value={height} onChange={(e) => setHeight(e.target.value)} />
        <input placeholder="Tavoite esim: Painon pudotus" value={goal} onChange={(e) => setGoal(e.target.value)} />

        <select value={activityLevelId} onChange={(e) => setActivityLevelId(e.target.value)}>
          <option value="">Valitse aktiivisuustaso</option>
          <option value="1">En liiku juuri lainkaan</option>
          <option value="2">Liikun kerran viikossa</option>
          <option value="3">Liikun 2-3 kertaa viikossa</option>
          <option value="4">Liikun useasti viikossa</option>
          <option value="5">Liikun lähes päivittäin</option>
        </select>

        <select value={nutritionLevelId} onChange={(e) => setNutritionLevelId(e.target.value)}>
          <option value="">Valitse syömistaso</option>
          <option value="1">Syön epäsäännöllisesti</option>
          <option value="2">Syön melko vähän</option>
          <option value="3">Syön normaalisti</option>
          <option value="4">Syön paljon</option>
          <option value="5">Syön erittäin paljon</option>
        </select>

        <button onClick={generateWorkout} disabled={loading}>
          {loading ? "Luodaan..." : "Luo treeniohjelma"}
        </button>
      </div>

      {workout && (
        <div className="result">
          {workout}
        </div>
      )}
    </div>
  );
}


export default App

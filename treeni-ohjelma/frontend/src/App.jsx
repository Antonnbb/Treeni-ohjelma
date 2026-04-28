import { useState } from 'react'
import axios from 'axios'
import jsPDF from "jspdf";
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

  const bmi =
    weight && height
      ? (Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1)
      : "";

  const getBmiCategory = (bmi) => {
    const value = Number(bmi);

    if (value < 18.5) return "Alipaino";
    if (value < 25) return "Normaalipaino";
    if (value < 30) return "Ylipaino";
    if (value < 35) return "Lihavuus";
    return "Vaikea lihavuus";
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Treeniohjelma", 10, 15);

    doc.setFontSize(12);
    doc.text(`Paino: ${weight} kg`, 10, 30);
    doc.text(`Pituus: ${height} cm`, 10, 38);
    doc.text(`Tavoite: ${goal}`, 10, 46);
    doc.text(`BMI: ${bmi}`, 10, 54);

    const lines = doc.splitTextToSize(workout, 180);
    doc.text(lines, 10, 70);

    doc.save("treeniohjelma.pdf");
  };


  return (
    <div className="container">
      <h1>Treeniohjelma</h1>

      <div className="form">

        <input placeholder="Paino kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <input placeholder="Pituus cm" value={height} onChange={(e) => setHeight(e.target.value)} />
        <select value={goal} onChange={(e) => setGoal(e.target.value)}>
          <option value="">Valitse tavoite</option>
          <option value="lihaskasvu">Lihaskasvu</option>
          <option value="painonpudotus">Painonpudotus</option>
          <option value="voiman kehitys">Voiman kehitys</option>
          <option value="kestävyyden parantaminen">Kestävyyden parantaminen</option>
          <option value="yleinen hyvinvointi">Yleinen hyvinvointi</option>
        </select>

        {bmi && (
          <div className="bmi-box">
            BMI: {bmi} — {getBmiCategory(bmi)}
          </div>
        )}
        
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
        <>
          <div className="result">
            {workout}
          </div>

          <button onClick={downloadPDF}>
            Lataa PDF
          </button>
        </>
      )}
    </div>
  );
}


export default App

import { useState, useEffect } from 'react'
import axios from 'axios'
import jsPDF from "jspdf";
import './index.css'

const baseUrl = '/api/note'


function App() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [activityLevelId, setActivityLevelId] = useState('');
  const [nutritionLevelId, setNutritionLevelId] = useState('');
  const [activityLevels, setActivityLevels] = useState([]);
  const [nutritionLevels, setNutritionLevels] = useState([]);
  const [workout, setWorkout] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        // Haetaan activity levels
        const activityResponse = await axios.get(
          "/api/activity-levels"
        );

        // Haetaan nutrition levels
        const nutritionResponse = await axios.get(
          "/api/nutrition-levels"
        );

        // Tallennetaan stateen
        setActivityLevels(activityResponse.data);
        setNutritionLevels(nutritionResponse.data);

      } catch (error) {
        console.error("Virhe tasojen haussa:", error);
      }
    };

    fetchLevels();
  }, []);

  const generateWorkout = async () => {
    try {
      setLoading(true);
      setWorkout("");

      const res = await axios.post("/api/generate-workout", {
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
    if (value < 40) return "Vaikea lihavuus";
    return "Sairaalloinen lihavuus";
  };


  const downloadPDF = () => {
    const doc = new jsPDF();

    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    let y = 15;

    doc.setFontSize(18);
    doc.text("Treeniohjelma", margin, y);
    y += 15;

    doc.setFontSize(12);
    doc.text(`Paino: ${weight} kg`, margin, y);
    y += 8;
    doc.text(`Pituus: ${height} cm`, margin, y);
    y += 8;
    doc.text(`Tavoite: ${goal}`, margin, y);
    y += 8;
    doc.text(`BMI: ${bmi}`, margin, y);
    y += 12;

    const lines = doc.splitTextToSize(workout, 180);

    lines.forEach((line) => {
      if (y > pageHeight - 15) {
        doc.addPage();
        y = 15;
      }

      doc.text(line, margin, y);
      y += 7;
    });

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

        <select
          value={activityLevelId}
          onChange={(e) => setActivityLevelId(e.target.value)}
        >
          <option value="">Valitse aktiivisuustaso</option>

          {activityLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>

        <select
          value={nutritionLevelId}
          onChange={(e) => setNutritionLevelId(e.target.value)}
        >
          <option value="">Valitse painon vaihtelu</option>

          {nutritionLevels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
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


export default { App, getAll}

import { useEffect, useState } from "react";
import "./App.css";
import MapChart from "./components/Map";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await fetch(
          "http://localhost:8000/markers?limit=1000"
        ).then((r) => r.json());

        if (!result.items || !Array.isArray(result.items)) {
          throw new Error("Invalid API response format");
        }

        const mappedData = result.items
          .filter(
            (i) => i && typeof i.lat === "number" && typeof i.lon === "number"
          )
          .map((i) => ({
            coords: [i.lat, i.lon],
            waveHeight: i.hs || 0,
          }));

        setData(mappedData);
      } catch (err) {
        setError("Failed to load map data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📍 Mapa marítimo</h1>
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading map data...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="map-container">
            <MapChart data={data} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

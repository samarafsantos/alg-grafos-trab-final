import { useEffect, useState } from "react";
import "./App.css";
import MapChart from "./components/Map";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch("http://localhost:8000/markers?limit=50").then(
        (r) => r.json()
      );

      setData(result.items.map((i) => [i.lat, i.lon]));
    };

    fetchData();
  }, []);

  return (
    <>
      <MapChart data={data} />
    </>
  );
}

export default App;

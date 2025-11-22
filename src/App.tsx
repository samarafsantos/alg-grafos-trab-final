import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import MapChart from "./components/Map";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <MapChart />
    </>
  );
}

export default App;

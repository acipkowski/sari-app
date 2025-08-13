import "./index.css";
import React from "react";
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import { Application } from "@nmfs-radfish/react-radfish";
import HomePage from "./pages/Home";

// Define the basename conditionally using Vite's environment variables
const basename = import.meta.env.DEV ? "/" : "/sari-app";

function App() {
  return (
    <Application>
      <div className="App grid-container">
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </div>
    </Application>
  );
}

export default App;

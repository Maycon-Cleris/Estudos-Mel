import { Routes, Route } from "react-router-dom";
import HomeScreen from "./components/HomeScreen.jsx";
import QuizScreen from "./components/QuizScreen.jsx";
import ResultScreen from "./components/ResultScreen.jsx";
import ReviewScreen from "./components/ReviewScreen.jsx";
import ParentArea from "./components/ParentArea.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/resultado/:id" element={<ResultScreen />} />
        <Route path="/correcao/:id" element={<ReviewScreen />} />
        <Route path="/responsavel" element={<ParentArea />} />
      </Routes>
    </div>
  );
}

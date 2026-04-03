import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Player from './pages/Player';
import Study from './pages/Study';
import Kana from './pages/Kana';
import Kanji from './pages/Kanji';
import Jlpt from './pages/Jlpt';
import Grammar from './pages/Grammar';
import Settings from './pages/Settings';
import Community from './pages/Community';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/player" element={<Player />} />
            <Route path="/player/:id" element={<Player />} />
            <Route path="/study" element={<Study />} />
            <Route path="/kana" element={<Kana />} />
            <Route path="/kanji" element={<Kanji />} />
            <Route path="/jlpt" element={<Jlpt />} />
            <Route path="/grammar" element={<Grammar />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

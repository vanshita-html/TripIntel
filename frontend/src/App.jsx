import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import DestinationExplorer from './pages/DestinationExplorer';
import DestinationComparison from './pages/DestinationComparison';
import BudgetPlanner from './pages/BudgetPlanner';
import AIAdvisor from './pages/AIAdvisor';
import InteractiveMap from './pages/InteractiveMap';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<AnalyticsDashboard />} />
            <Route path="/explore" element={<DestinationExplorer />} />
            <Route path="/compare" element={<DestinationComparison />} />
            <Route path="/budget" element={<BudgetPlanner />} />
            <Route path="/advisor" element={<AIAdvisor />} />
            <Route path="/map" element={<InteractiveMap />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

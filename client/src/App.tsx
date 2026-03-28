import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Dashboard } from "@/pages/Dashboard";
import { CampaignDetail } from "@/pages/CampaignDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:campaignId" element={<CampaignDetail />} />
        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

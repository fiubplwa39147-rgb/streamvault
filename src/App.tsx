import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { VideoProvider } from "./context/VideoContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import WatchPage from "./pages/WatchPage";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import BrowsePage from "./pages/BrowsePage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <AuthProvider>
      <VideoProvider>
        <Router>
          <div className="min-h-screen bg-[#141414] font-[Inter,sans-serif]">
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "14px",
                },
                success: {
                  iconTheme: { primary: "#ef4444", secondary: "#fff" },
                },
              }}
            />

            <Routes>
              {/* Auth page — no navbar */}
              <Route path="/auth" element={<AuthPage />} />

              {/* All other routes with navbar */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/browse" element={<BrowsePage />} />
                      <Route path="/watch/:id" element={<WatchPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/profile" element={<Navigate to="/settings" replace />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </>
                }
              />
            </Routes>
          </div>
        </Router>
      </VideoProvider>
    </AuthProvider>
  );
}

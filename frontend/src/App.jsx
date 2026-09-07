import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { Login, Register } from "./pages/AuthPages";
import { Channel, Profile, Upload, Watch } from "./pages/FeaturePages";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/watch/:videoId" element={<Watch />} />
            <Route path="/channel/:username" element={<Channel />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/upload" element={<Upload />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

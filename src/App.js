import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/sonner";
import Navbar from "./components/Navbar";
import ChatBubble from "./components/ChatBubble";

// Page imports
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import MoodDiscovery from "./pages/MoodDiscovery";
import GroupTravel from "./pages/GroupTravel";
import TripDashboard from "./pages/TripDashboard";

import "@/App.css";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/auth" />;
};

const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/auth" element={!currentUser ? <Auth /> : <Navigate to="/" />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mood-discovery" 
            element={
              <ProtectedRoute>
                <MoodDiscovery />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/group-travel" 
            element={
              <ProtectedRoute>
                <GroupTravel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <TripDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <ChatBubble />
      <Toaster position="top-right" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
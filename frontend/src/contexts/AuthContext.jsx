import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock authentication for demo
  const signup = async (email, password, name) => {
    try {
      setError(null);
      
      // Mock user creation
      const mockUser = {
        uid: 'demo_user_' + Date.now(),
        email: email,
        displayName: name
      };
      
      // Register user in backend
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: mockUser.uid,
          email: mockUser.email,
          name: mockUser.displayName
        })
      });
      
      // Store in localStorage for demo
      localStorage.setItem('demoUser', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      
      return mockUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      
      // Mock login validation
      const mockUser = {
        uid: 'demo_user_' + Date.now(),
        email: email,
        displayName: email.split('@')[0]
      };
      
      // Store in localStorage for demo
      localStorage.setItem('demoUser', JSON.stringify(mockUser));
      setCurrentUser(mockUser);
      
      return mockUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      localStorage.removeItem('demoUser');
      setCurrentUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('demoUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
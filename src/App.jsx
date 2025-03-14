import React, { useState, useEffect } from "react";
import Navbar from "./Components/Navbar/Navbar";
import LoginModal from "./Components/LoginModal/LoginModal";
import AdminPage from "./Components/Admin/AdminPage";
import ClientPage from "./Components/Cliente/ClientePage";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

const App = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");

  // Recuperar sesión almacenada
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedRole = localStorage.getItem("userRole");

    if (storedAuth === "true" && storedRole) {
        setIsAuthenticated(true);
        setUserRole(storedRole);
        setIsLoginOpen(false);
    } else {
        setIsAuthenticated(false);
        setUserRole("");
    }
  }, []);


  const handleLogin = async (user, password) => {
    try {
        let loginUrl = user === "admin" 
            ? "http://34.230.21.209:3000/auth/login" 
            : "http://34.230.21.209:3000/auth/client/login";

        console.log("Intentando iniciar sesión en:", loginUrl);

        const response = await axios.post(loginUrl, {
            username: user,
            password: password,
        });

        console.log("Respuesta del servidor:", response.data);

        if (response.status === 200 || response.status === 201) {
            const { access_token } = response.data;
            localStorage.setItem("token", access_token);
            setIsAuthenticated(true);
            setUserRole(user === "admin" ? "admin" : "cliente");
            localStorage.setItem("username", user);
            setIsLoginOpen(false);
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error.response?.data || error.message);
        alert("Usuario o contraseña incorrectos.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("");
    setIsLoginOpen(true);

    localStorage.clear(); // Elimina toda la sesión
  };


  return (
    <div>
      <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      {!isAuthenticated ? (
        <LoginModal isOpen={isLoginOpen} onLogin={handleLogin} />
      ) : (
        <div>
          {userRole === "cliente" ? <ClientPage /> : <AdminPage />}
        </div>
      )}
    </div>
  );

};

export default App;

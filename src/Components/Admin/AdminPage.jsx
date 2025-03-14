import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./AdminPage.css";

const AdminPage = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [cfdis, setCfdis] = useState([]);
  const [filteredCfdis, setFilteredCfdis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cfdiSearchTerm, setCfdiSearchTerm] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newClient, setNewClient] = useState({ username: "", password: "" });
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [uploadDates, setUploadDates] = useState([]); // Estado para almacenar las fechas de subida
  const [selectedUploadDate, setSelectedUploadDate] = useState(""); // Estado para la fecha seleccionada

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get("http://35.172.220.219:3000/clients", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setClientes(response.data);
        setFilteredClientes(response.data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  const handleSearchChange = (e) => {
    const search = e.target.value.toLowerCase();
    setSearchTerm(search);
    setFilteredClientes(clientes.filter(cliente => cliente.username.toLowerCase().includes(search)));
  };

  const handleSelectCliente = async (cliente) => {
    setSelectedCliente(cliente);
    setShowTable(true);
    try {
      const response = await axios.get(`http://35.172.220.219:3000/clients/cfdis?username=${cliente.username}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setCfdis(response.data);
      setFilteredCfdis(response.data);

      // Extraer las fechas de subida únicas
      const dates = [...new Set(response.data.map(cfdi => new Date(cfdi.uploadDate).toLocaleDateString()))];
      setUploadDates(dates);
    } catch (error) {
      console.error("Error al obtener CFDIs:", error);
    }
  };

  const handleCfdiSearch = (e) => {
    const search = e.target.value.toLowerCase();
    setCfdiSearchTerm(search);
    const filtered = cfdis.filter(cfdi =>
      Object.values(cfdi).some(value =>
        value.toString().toLowerCase().includes(search)
      )
    );
    setFilteredCfdis(filtered);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const sortedData = [...filteredCfdis].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredCfdis(sortedData);
    setSortConfig({ key, direction });
  };

  const handleBack = () => {
    setShowTable(false);
    setShowRegisterForm(false);
    setSelectedCliente(null);
    setCfdis([]);
    setCfdiSearchTerm("");
    setSortConfig({ key: "", direction: "asc" });
    setUploadDates([]);
    setSelectedUploadDate("");
  };

  const handleExportExcel = () => {
    if (filteredCfdis.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    
    const formattedData = filteredCfdis.map(cfdi => ({
      "UUID": cfdi.uuid,
      "RFC Emisor": cfdi.emisorRfc,
      "Nombre o Razón Emisor": cfdi.emisorNombre,
      "RFC Receptor": cfdi.receptorRfc,
      "Nombre o Razón Receptor": cfdi.receptorNombre,
      "Clave Producto o Servicio": cfdi.claveProdServ,
      "Moneda": cfdi.moneda,
      "Tipo de Cambio": cfdi.tipoCambio,
      "Total": cfdi.total,
      "Total en MXN": cfdi.totalMXN
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CFDIs");
    XLSX.writeFile(workbook, `Partes relacionadas del cliente ${selectedCliente.username}.xlsx`);
  };

  const handleRegisterClient = async (e) => {
    e.preventDefault();
    try {
        await axios.post("/api/admin/clients", newClient, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
      setNewClient({ username: "", password: "" });
      setShowRegisterForm(false);
      // Actualizar la lista de clientes
      const response = await axios.get("/api/clients", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setClientes(response.data);
      setFilteredClientes(response.data);
    } catch (error) {
      console.error("Error al registrar cliente:", error);
      alert("Error al registrar el cliente");
    }
  };

  const handleUploadDateChange = (e) => {
    const date = e.target.value;
    setSelectedUploadDate(date);
    if (date) {
      const filtered = cfdis.filter(cfdi => new Date(cfdi.uploadDate).toLocaleDateString() === date);
      setFilteredCfdis(filtered);
    } else {
      setFilteredCfdis(cfdis);
    }
  };

  return (
    <div className="admin-container">
      <h2>Iniciaste sesión como Admin</h2>

      {showRegisterForm ? (
        <div className="register-container">
          <h3>Registrar Cliente</h3>
          <form onSubmit={handleRegisterClient}>
            <div className="input-group">
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Nombre"
                value={newClient.username}
                onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Contraseña"
                value={newClient.password}
                onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" className="register-button">Registrar Cliente</button>
              <button type="button" className="back-button" onClick={handleBack}>⬅ Volver</button>
            </div>
          </form>
        </div>
      ) : !showTable ? (
        <div className="client-management">
          <div className="search-and-register">
            <input
              type="text"
              placeholder="Buscar Cliente"
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button 
              className="register-button" 
              onClick={() => setShowRegisterForm(true)}
            >
              Registrar Cliente
            </button>
          </div>

          <table className="client-table">
            <thead>
              <tr>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente, index) => (
                  <tr key={index} onClick={() => handleSelectCliente(cliente)}>
                    <td>{cliente.username}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No se encontraron clientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : selectedCliente && (
        <div className="table-container">
          <div className="button-container">
            <button className="back-button" onClick={handleBack}> ⬅ Volver</button>
            <button className="export-button" onClick={handleExportExcel}> ⬇ Exportar Tabla</button>
          </div>

          <div className="client-header">
            <h3>Cliente: {selectedCliente.username}</h3>
            <input
              type="text"
              placeholder="Buscar en la tabla..."
              value={cfdiSearchTerm}
              onChange={handleCfdiSearch}
              className="cfdi-search-input"
            />
            <select
              value={selectedUploadDate}
              onChange={handleUploadDateChange}
              className="upload-date-select"
            >
              <option value="">Todas las fechas</option>
              {uploadDates.map((date, index) => (
                <option key={index} value={date}>{date}</option>
              ))}
            </select>
          </div>

          <div className="table-scroll">
            <table className="cfdi-table">
              <thead>
                <tr>
                  <th> UUID</th>
                  <th onClick={() => handleSort("emisorRfc")}>
                    RFC Emisor {sortConfig.key === "emisorRfc" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("emisorNombre")}>
                    Nombre o Razón Emisor {sortConfig.key === "emisorNombre" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("receptorRfc")}>
                    RFC Receptor {sortConfig.key === "receptorRfc" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th onClick={() => handleSort("receptorNombre")}>
                    Nombre o Razón Receptor {sortConfig.key === "receptorNombre" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                  </th>
                  <th className="total">Clave Producto o Servicio</th>
                  <th>Moneda</th>
                  <th className="total">Tipo de Cambio</th>
                  <th className="total">Total</th>
                  <th className="total">Total en MXN</th>
                </tr>
              </thead>
              <tbody>
                {filteredCfdis.length > 0 ? (
                  filteredCfdis.map((cfdi, index) => (
                    <tr key={index}>
                      <td>{cfdi.uuid}</td>
                      <td>{cfdi.emisorRfc}</td>
                      <td>{cfdi.emisorNombre}</td>
                      <td>{cfdi.receptorRfc}</td>
                      <td>{cfdi.receptorNombre}</td>
                      <td className="total">{cfdi.claveProdServ}</td>
                      <td>{cfdi.moneda}</td>
                      <td className="total">{cfdi.tipoCambio}</td>
                      <td className="total">{new Intl.NumberFormat("es-MX", { 
                        style: "decimal", 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      }).format(cfdi.total)}</td>
                      <td className="total">{new Intl.NumberFormat("es-MX", { 
                        style: "decimal", 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      }).format(cfdi.totalMXN)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10">No se encontró información</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
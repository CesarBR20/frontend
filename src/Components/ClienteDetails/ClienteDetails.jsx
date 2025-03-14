import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./ClienteDetails.css";

const ClienteDetails = () => {
  const { username } = useParams();
  const [cfdis, setCfdis] = useState([]);

  useEffect(() => {
    const fetchCFDIs = async () => {
      try {
        const response = await axios.get(`http://35.172.220.219:3000/clients/cfdis?username=${username}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCfdis(response.data);
      } catch (error) {
        console.error("Error al obtener CFDIs:", error);
      }
    };

    fetchCFDIs();
  }, [username]);

  return (
    <div className="cliente-container">
      <h1>CFDIs de {username}</h1>

      <div className="cliente-box">
        <table className="cliente-table">
          <thead>
            <tr>
              <th>RFC Emisor</th>
              <th>Nombre Emisor</th>
              <th>RFC Receptor</th>
              <th>Nombre Receptor</th>
              <th>Clave Prod/Serv</th>
              <th>Moneda</th>
              <th>Tipo Cambio</th>
              <th>Total</th>
              <th>Total en MXN</th>
            </tr>
          </thead>
          <tbody>
            {cfdis.length > 0 ? (
              cfdis.map((cfdi, index) => (
                <tr key={index}>
                  <td>{cfdi.emisorRfc}</td>
                  <td>{cfdi.emisorNombre}</td>
                  <td>{cfdi.receptorRfc}</td>
                  <td>{cfdi.receptorNombre}</td>
                  <td>{cfdi.claveProdServ}</td>
                  <td>{cfdi.moneda}</td>
                  <td>{cfdi.tipoCambio}</td>
                  <td>{cfdi.total}</td>
                  <td>{cfdi.totalMXN}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No hay CFDIs para este cliente</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClienteDetails;

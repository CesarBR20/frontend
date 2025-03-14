import React, { useState, useMemo, useCallback } from "react";
import axios from "axios";
import "./ClientePage.css";

const ClientePage = () => {
  const [showTerms, setShowTerms] = useState(true);
  const [formatFile, setFormatFile] = useState(null);
  const [xmlFiles, setXmlFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [tableData, setTableData] = useState([]); // Inicializado como array vacío
  const [cfdiSearchTerm, setCfdiSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedCliente, setSelectedCliente] = useState({ username: "Nombre del Cliente" });

  /** 📌 Aceptar términos y condiciones */
  const acceptTerms = async () => {
    try {
      await axios.patch("http://34.230.21.209:3000/clients/accept-terms", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setShowTerms(false);
    } catch (error) {
      console.error("Error al aceptar términos:", error);
    }
  };

  /** 📌 Descargar formato */
  const downloadFormat = async () => {
    try {
      const response = await axios.get("http://34.230.21.209:3000/files/download-excel", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      window.location.href = response.data.downloadUrl;
    } catch (error) {
      console.error("Error al obtener la URL del formato:", error);
    }
  };

  /** 📌 Manejar selección de archivos */
  const handleFormatFileChange = useCallback((event) => {
    setFormatFile(event.target.files[0]);
  }, []);

  const handleXmlFileChange = useCallback((event) => {
    setXmlFiles([...event.target.files]);
  }, []);

  /** 📌 Eliminar archivos */
  const removeFormatFile = useCallback(() => {
    setFormatFile(null);
  }, []);

  const removeXmlFile = useCallback((index) => {
    setXmlFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);

  /** 📌 Subir archivos con logs */
  const uploadFiles = async () => {
    if (!formatFile || xmlFiles.length === 0) {
      return alert("Por favor selecciona los archivos antes de subir");
    }

    setUploading(true);
    setProgress(0);
    setUploadLogs(["📌 Iniciando carga de archivos...", "⚠️ Este proceso puede tardar."]);

    const formData = new FormData();
    formData.append("files", formatFile);
    xmlFiles.forEach((file) => formData.append("files", file));

    try {
      await axios.post("http://34.230.21.209:3000/files/upload", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      setUploadLogs((prevLogs) => [...prevLogs, "✅ Archivos subidos correctamente."]);
      setTimeout(() => {
        setUploading(false);
        setUploadCompleted(true);
      }, 2000);
    } catch (error) {
      console.error("❌ Error al subir archivos:", error);
      setUploadLogs((prevLogs) => [...prevLogs, "❌ Error en la subida de archivos."]);
      alert("Hubo un error al subir los archivos");
      setUploading(false);
    }
  };

  /** 📌 Procesar CFDIs con pantalla de carga */
  const processFiles = async () => {
    setProcessing(true);

    try {
      // Procesar los archivos
      const processResponse = await axios.post("http://34.230.21.209:3000/files/process-cfdis", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("Respuesta del procesamiento:", processResponse.data); // Verifica la respuesta en la consola

      setTimeout(() => {
        setProcessing(false);
        alert("Archivos procesados correctamente. Presiona 'Ver Tabla' para ver los datos.");
      }, 2000); // Simulación de tiempo de procesamiento
    } catch (error) {
      console.error("❌ Error al procesar archivos:", error);
      alert("Error al procesar archivos.");
      setProcessing(false);
    }
  };

  /** 📌 Obtener datos procesados */
  const fetchTableData = async () => {
    try {
      // Recuperar el token y el username de localStorage
      const token = localStorage.getItem("token");
      const username = localStorage.getItem("username");
  
      if (!token || !username) {
        alert("No se encontró el usuario autenticado.");
        return;
      }
  
      const response = await axios.get(`http://34.230.21.209:3000/files/list-cfdis?username=${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Datos obtenidos:", response.data); // Verifica los datos en la consola
  
      if (response.data && Array.isArray(response.data)) {
        setTableData(response.data); // Asignar datos filtrados al estado
      } else {
        console.error("❌ Error: La respuesta no contiene un array de datos:", response.data);
        alert("Error al obtener los datos procesados.");
      }
    } catch (error) {
      console.error("❌ Error al obtener los datos:", error);
      alert("Error al obtener los datos procesados.");
    }
  };
  
  

  /** 📌 Funciones para la tabla */
  const handleCfdiSearch = (event) => {
    setCfdiSearchTerm(event.target.value);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleBack = () => {
    setTableData([]); // Volver al estado anterior
  };

  /** 📌 Filtrar y ordenar los datos */
  const filteredCfdis = useMemo(() => {
    if (!Array.isArray(tableData)) return []; // Verifica que tableData sea un array
    return tableData
      .filter((cfdi) =>
        Object.values(cfdi).some((value) =>
          String(value).toLowerCase().includes(cfdiSearchTerm.toLowerCase())
        )
      )
      .sort((a, b) => {
        if (sortConfig.key) {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
        }
        return 0;
      });
  }, [tableData, cfdiSearchTerm, sortConfig]);

  /** 📌 Memorizar logs para evitar re-renderizados */
  const renderedLogs = useMemo(() => (
    <ul>
      {uploadLogs.map((log, index) => (
        <li key={index}>{log}</li>
      ))}
    </ul>
  ), [uploadLogs]);

  return (
    <div className="client-container">
      <h2>Iniciaste sesión como usuario</h2>

      {showTerms ? (
        <div className="terms-modal">
          <h3>Términos y condiciones</h3>
          <p>Debes aceptar los términos y condiciones antes de continuar.</p>
          <button onClick={acceptTerms} className="blue-button">Aceptar</button>
        </div>
      ) : (
        <div className="upload-container">
          <p>En esta página deberá subir sus archivos siguiendo los siguientes pasos:</p>
          <ul>
            <li>Descargue el <a href="#" onClick={downloadFormat} className="format-link">formato</a> de llenado y llénelo</li>
            <li>Suba el mismo formato llenado</li>
            <li>Adjunte los archivos ZIP</li>
          </ul>

          <div className="upload-box">
            {!uploading && !uploadCompleted && !processing && tableData.length === 0 && (
              <>
                <div className="file-upload-section">
                  <label className="upload-button">
                    📄 SUBIR FORMATO
                    <input type="file" onChange={handleFormatFileChange} />
                  </label>
                  {formatFile && (
                    <div className="file-preview">
                      <span>{formatFile.name}</span>
                      <button className="remove-button" onClick={removeFormatFile}>❌</button>
                    </div>
                  )}
                </div>

                <div className="file-upload-section">
                  <label className="upload-button">
                    📄 SUBIR XML EN ZIP
                    <input type="file" onChange={handleXmlFileChange} multiple />
                  </label>
                  {xmlFiles.length > 0 && (
                    <div className="file-preview-list">
                      {xmlFiles.map((file, index) => (
                        <div key={index} className="file-preview">
                          <span>{file.name}</span>
                          <button className="remove-button" onClick={() => removeXmlFile(index)}>❌</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="button-container">
                  <button onClick={uploadFiles} className="blue-button">
                    Subir
                  </button>
                </div>
              </>
            )}

            {uploading && (
              <div className="upload-logs">
                <h3>Registro de subida:</h3>
                {renderedLogs}
                <progress value={progress} max="100"></progress>
                <p>{progress}%</p>
              </div>
            )}

            {uploadCompleted && !processing && tableData.length === 0 && (
              <div className="upload-success">
                <h3>✅ Archivos cargados con éxito</h3>
                <p>Presiona "Procesar" para procesar los archivos.</p>
                <button onClick={processFiles} className="blue-button">Procesar</button>
              </div>
            )}

            {processing && (
              <div className="processing-container">
                <h3>⏳ Procesando archivos...</h3>
                <div className="spinner"></div>
              </div>
            )}

            {uploadCompleted && !processing && tableData.length === 0 && (
              <div className="upload-success">
                <p>Presiona "Ver Tabla" para ver los datos procesados.</p>
                <button onClick={fetchTableData} className="blue-button"> Ver Tabla</button>
              </div>
            )}

            {tableData.length > 0 && (
              <div className="table-container">
                <div className="button-container">
                  <button className="back-button" onClick={handleBack}> ⬅ Volver</button>
                </div>

                <div className="client-header">
                  <input
                    type="text"
                    placeholder="Buscar en la tabla..."
                    value={cfdiSearchTerm}
                    onChange={handleCfdiSearch}
                    className="cfdi-search-input"
                  />
                </div>

                <div className="table-scroll">
                  <table className="cfdi-table">
                    <thead>
                      <tr>
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
                            <td>{cfdi.emisorRfc}</td>
                            <td>{cfdi.emisorNombre}</td>
                            <td>{cfdi.receptorRfc}</td>
                            <td>{cfdi.receptorNombre}</td>
                            <td className="total">{cfdi.claveProdServ}</td>
                            <td>{cfdi.moneda}</td>
                            <td className="total">{cfdi.tipoCambio}</td>
                            <td className="total">
                              {new Intl.NumberFormat("es-MX", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(cfdi.total)}
                            </td>
                            <td className="total">
                              {new Intl.NumberFormat("es-MX", {
                                style: "decimal",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(cfdi.totalMXN)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9">No se encontró información</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientePage;
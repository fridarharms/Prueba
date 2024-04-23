import React, { useState, useEffect, useRef } from "react";
import NotificationAlert from "react-notification-alert";
import { Alert, Card, CardTitle, CardBody, CardHeader, Row, Col } from "reactstrap";
import { Button } from 'primereact/button';
import PanelHeader from "components/PanelHeader/PanelHeader.js";

function Notifications() {
  const notificationAlert = useRef();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    fetch("http://localhost:3001/api/last-color")
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          setData(data); // Guardar los datos en el estado
        } else {
          console.error("No se encontraron datos en la respuesta de la API");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error al obtener los datos de la API:", error);
        setLoading(false);
      });
  };

  const handleRefresh = () => {
    fetchData();
  };

  return (
    <>
      <PanelHeader
        content={
          <div className="header text-center">
            <h2 className="title">Máquinas en vivo</h2>
          </div>
        }
      />
      <div className="content">
        <NotificationAlert ref={notificationAlert} />
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <Row>
            <Col md={12} xs={12}>
              <Card>
                <CardHeader>
                  <CardTitle tag="h4">Señalización</CardTitle>
                </CardHeader>
                <CardBody>
                <Alert style={{backgroundColor: '#18ce0f'}}>
                    <span><b>Verde - </b> Si la notificación es verde, la máquina está en producción</span>
                  </Alert>
                  <Alert style={{backgroundColor: '#2CA8FF'}}>
                    <span><b>Azul - </b> La máquina está detenida</span>
                  </Alert>
                  <Alert style={{backgroundColor: '#FFB236'}}>
                    <span><b>Amarillo - </b> Si la notificación es amarilla, la máquina está detenida lista para usarse</span>
                  </Alert>
                  <Alert style = {{backgroundColor: '#FF3636'}}>
                    <span><b> Rojo - </b>Si la notificacion es rojo , la maquina esta en Error</span>
                  </Alert>
                  <Alert style = {{backgroundColor: '#8a8888'}}>
                    <span><b>Gris - </b> Si la notificación es gris, la máquina está desconectada </span>
                  </Alert>
                  <div className="text-center">
                    <Button color="primary" onClick={handleRefresh}>Actualizar</Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
            <Col md={12} xs={12}>
              <Card>
                <CardBody>
                  <div className="places-buttons">
                    <Row>
                      <Col md={6} className="ml-auto mr-auto text-center">
                        <CardTitle tag="h4">Máquinas Disponibles</CardTitle>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={8} xs={12} className="ml-auto mr-auto">
                      {data.map((item, index) => (
                    <Alert key={index} style={{backgroundColor: convertirEstadoAColor(item.color)}}>
                      {item.Tabla} : {item.color}
                    </Alert>
                  ))}
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
}
function convertirEstadoAColor(color) {
  switch (color) {
    case 'Amarillo':
      return '#FFB236';
    case 'Produccion':
      return '#18ce0f';
    case 'Error':
      return '#FF3636';
    case 'Detenido':
      return '#2CA8FF';
    case 'Desconectado':
      return '#8a8888';
    default:
      return '#000000'; // Color por defecto en caso de no coincidir ningún caso
  }
}

export default Notifications;

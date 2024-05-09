import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { DatePicker } from "antd";
import "react-datepicker/dist/react-datepicker.css";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ButtonDropdown,
} from "reactstrap";
import { fetchChartData, fetchTableData, handleTableSelect, handleTurnoSelect, handleFechaSelect, toggleDropdownTurno } from "./fetchChartData";
import {fetchChartDataFromAPI} from "variables/charts.js"
import "./dashboard.css";

function PieCard(){
    const [chartData, setChartData] = useState(null);
    const [barData, setBarData] = useState(null); // Nuevo estado para el gráfico de barras
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedTurno, setSelectedTurno] = useState(null);
    const [dropdownTurnoOpen, setDropdownTurnoOpen] = useState(false);
    const [selectedFecha, setSelectedFecha] = useState(null);
    const [showAllTables, setShowAllTables] = useState(false);
    const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);
    useEffect(() => {
      fetchTableData()
        .then((data) => {
          setTables(data);
          
        })
        .catch((error) => {
          console.error("Error fetching table data:", error);
        });
    }, []);

    useEffect(() => {
        if (selectedTable) { // Verificar si selectedTable tiene un valor antes de llamar a fetchChartDataFromAPI
          fetchChartDataFromAPI(selectedTable)
            .then((data) => {
              console.log(data)
              setBarData(data)
            })
            .catch((error) => {
              console.error("Error fetching chart data:", error);
              setBarData(null);
            });
        }
      }, [selectedTable]); // Ejecutar este efecto cuando selectedTable cambie

      const fetchChartDataAndUpdate = (tableName, turno, fecha) => {
        console.log(tableName);
        return new Promise((resolve, reject) => {
          fetchChartData(tableName, turno, fecha)
            .then((data) => {
              setChartData(data);
              resolve(data); // Resuelve la promesa con los datos
            })
            .catch((error) => {
              console.error("Error fetching chart data:", error);
              setChartData(null);
              reject(error); // Rechaza la promesa con el error
            });
        });
      };
      
    
      // Función para manejar el clic en el botón de mostrar todas las tablas
      const handleShowAllTablesClick = () => {
        setShowAllTables(true); // Mostrar lista de todas las tablas
      };
      return(
        <div>
             <Card>
              <CardHeader>
                <CardTitle tag="h5">Estatús Máquinas</CardTitle>
                <p className="card-category">Tiempo de estados</p>
              </CardHeader>
              <CardBody style={{ height: "266px" }}>
                {chartData && chartData.datasets[0].data.length > 0 ? (
                  <Pie
                    data={chartData}
                    options={{
                      maintainAspectRatio: false,
                      responsive: true,
                    }}
                  />
                ) : (
                  <div>No hay datos disponibles</div>
                )}
              </CardBody>
              <CardFooter className="d-flex justify-content-between align-items-center">
                <div className="legend" key={1}>
                  <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                    <DropdownToggle caret>
                      {selectedTable || "Seleccionar máquina"}
                    </DropdownToggle>
                    <DropdownMenu>
                      {tables.map((table,index) => (
                        <DropdownItem
                          key={index}
                          onClick={() =>{
                            handleTableSelect(
                              table.Tabla,
                              setSelectedTable,
                              fetchChartDataAndUpdate,
                              selectedTurno,
                              selectedFecha
                            )
                          }
                          }
                        >
                          {table.Tabla}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                </div>
                <div className="legend">
                <ButtonDropdown isOpen={dropdownTurnoOpen} toggle={() => toggleDropdownTurno(setDropdownTurnoOpen)}>
                  <DropdownToggle className="custom-button-dropdown" caret>
                    {selectedTurno || "Seleccionar turno"}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={() => handleTurnoSelect("matutino", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, selectedFecha)}>
                      Matutino
                    </DropdownItem>
                    <DropdownItem onClick={() => handleTurnoSelect("vespertino", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, selectedFecha)}>
                      Vespertino
                    </DropdownItem>
                    <DropdownItem onClick={() => handleTurnoSelect("nocturno", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, selectedFecha)}>
                      Nocturno
                    </DropdownItem>
                  </DropdownMenu>
                </ButtonDropdown>
                </div>
                <div className="legend">
                <DatePicker
                  selected={selectedFecha}
                  onChange={(date) =>
                    handleFechaSelect(
                      date ? date.toISOString().split('T')[0]:null, // Formato yyyy-MM-dd
                      setSelectedFecha,
                      fetchChartDataAndUpdate,
                      selectedTable,
                      selectedTurno
                    )
                  }
                />
                </div>
                <hr />
              </CardFooter>
            </Card>     
        </div>
      )
}
export default PieCard
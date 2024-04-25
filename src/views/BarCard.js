import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MultiSelect } from 'primereact/multiselect';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ButtonDropdown,
} from "reactstrap";
import {  fetchTableData, handleTurnoSelect, handleFechaSelect, toggleDropdownTurno } from "variables/charts.js";
import { dashboardNASDAQChart } from "variables/charts.js";
import {fetchChartDataFromAPI} from "variables/charts.js"
import "./dashboard.css";

function BarCard() {
    const [barData, setBarData] = useState(null); // Nuevo estado para el gráfico de barras
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedTurno, setSelectedTurno] = useState(null);
    const [dropdownTurnoOpen, setDropdownTurnoOpen] = useState(false);
    const [selectedFecha, setSelectedFecha] = useState(null);

    useEffect(() => {
      fetchTableData()
      
        .then((data) => {
          
          setTables(data);
          //console.log("fetchTableData : "+data)
        })
        .catch((error) => {
          console.error("Error fetching table data:", error);
        });
    }, []);

    async function fetchAndSetBarData(tabla, turno, fecha) {
      const result = await fetchChartDataFromAPI(tabla, turno, fecha);
      setBarData(result);
    }
  
    function handleTablaSelect(tabla) {
      setSelectedTable(tabla);
      fetchAndSetBarData(tabla, selectedTurno, selectedFecha);
    }
  
  async function test(tablasBar) {
    console.log("Tablas seleccionadas test: ",tablasBar)
    const result = await fetchChartDataFromAPI(tablasBar, selectedTurno, selectedFecha)
    setBarData(result);
    console.log(result)
  }
  const fetchChartDataAndUpdate = (tableName, turno, fecha) => {
    //console.log("fetchchartdatafromapi "+tableName)
    fetchChartDataFromAPI(tableName, turno, fecha)
      .then((data) => {
        setBarData(data);
      })
      .catch((error) => {
        console.error("Error fetching chart data:", error);
        setBarData(null);
      });
  };

  return (
    <div>
      <Card className="card-chart">
        <CardHeader>
          <CardTitle tag="h5">Estatús Máquinas</CardTitle>
          <p className="card-category">Comparación de Máquinas</p>
        </CardHeader>
        <CardBody>
        {barData && barData.labels && barData.datasets ? (
          <Bar
            data={{labels: barData.labels, datasets: barData.datasets}}
            options={dashboardNASDAQChart.options}
            width={400}
            height={100}
          />
        ) : (
          <div>No hay datos disponibles</div>
        )}
        </CardBody>
        <CardFooter>
          <div className="card flex justify-content-center">
          <MultiSelect
              value={selectedTable}
              options={tables.map((table, index) => ({
                value: table.Tabla,
                label: table.Tabla,
                key: index,
              }))}              onChange={(e) => handleTablaSelect(e.value)}
              optionLabel="Tabla"
              placeholder="Seleccionar tabla"
              className="w-full md:w-20rem"
              maxSelectedLabels={3}

          />
          </div>
          <div className="legend">
          <ButtonDropdown
              isOpen={dropdownTurnoOpen}
              toggle={() => toggleDropdownTurno(setDropdownTurnoOpen)}
            >
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
          <div>
          <DatePicker
                  selected={selectedFecha}
                  onChange={(date) =>
                    handleFechaSelect(
                      date.toISOString().split('T')[0], // Formato yyyy-MM-dd
                      setSelectedFecha,
                      fetchChartDataAndUpdate,
                      selectedTable,
                      selectedTurno
                    )
                  }
                  dateFormat="yyyy-MM-dd"
                />
          </div>
          <hr />
        </CardFooter>
      </Card>
    </div>
  );
}

export default BarCard;

import React, { useState, useEffect, useReducer } from "react";
import { Bar } from "react-chartjs-2";
import { DatePicker } from 'antd'; // Importa el nuevo componente de Ant Design
import { MultiSelect } from 'primereact/multiselect';
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
import { fetchTableData, handleTurnoSelect, toggleDropdownTurno } from "variables/charts.js";
import { dashboardNASDAQChart } from "variables/charts.js";
import { fetchChartDataFromAPI } from "variables/charts.js";
import "./dashboard.css";

const initialState = {
  startDate: null,
  endDate: null,
  focusedInput: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'focusChange':
      return { ...state, focusedInput: action.payload };
    case 'dateChange':
      return action.payload;
    default:
      throw new Error();
  }
}

function BarCard() {
  const [barData, setBarData] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [dropdownTurnoOpen, setDropdownTurnoOpen] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState); // Usa el nuevo estado y el reducer

  useEffect(() => {
    fetchTableData()
      .then((data) => {
        setTables(data);
      })
      .catch((error) => {
        console.error("Error fetching table data:", error);
      });
  }, []);

  async function fetchAndSetBarData(tabla, turno, fechaInicio, fechaFin) {
    const result = await fetchChartDataFromAPI(tabla, turno, fechaInicio, fechaFin);
    setBarData(result);
    console.log(result);
  }

  function handleTablaSelect(tabla) {
    setSelectedTable(tabla);
    if (state.startDate && state.endDate) {
      const startDateString = state.startDate.toISOString().split('T')[0];
      const endDateString = state.endDate.toISOString().split('T')[0];
      fetchAndSetBarData(tabla, selectedTurno, startDateString, endDateString);
    }
  }

  const handleFechaSelect = (dates, dateStrings) => {
    if (dates && dates.length === 2) { // Verifica si dates no es null y tiene una longitud de 2
      dispatch({ type: 'dateChange', payload: { startDate: dates[0], endDate: dates[1] } });
      if (selectedTable && selectedTurno && dates[0] && dates[1]) {
        const startDateString = dates[0].toISOString().split('T')[0];
        const endDateString = dates[1].toISOString().split('T')[0];
        fetchAndSetBarData(selectedTable, selectedTurno, startDateString, endDateString);
      }
    }
  };

  const fetchChartDataAndUpdate = (tableName, turno, fechaInicio, fechaFin) => {
    fetchChartDataFromAPI(tableName, turno, fechaInicio, fechaFin)
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
        <CardBody style={{ height: "266px" }}>
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
        <CardFooter className="d-flex justify-content-between align-items-center">
          <div>
            <MultiSelect
              value={selectedTable}
              options={tables.map((table, index) => ({
                value: table.Tabla,
                key: index,
              }))}
              onChange={(e) => handleTablaSelect(e.value)}
              optionLabel="value"
              placeholder="Seleccionar tabla"
              className="w-full md:w-20rem"
              maxSelectedLabels={3}
            />
          </div>
          <div className="text-center flex-grow-1">
            <ButtonDropdown
              isOpen={dropdownTurnoOpen}
              toggle={() => toggleDropdownTurno(setDropdownTurnoOpen)}
            >
              <DropdownToggle className="custom-button-dropdown" caret>
                {selectedTurno || "Seleccionar turno"}
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => handleTurnoSelect("matutino", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, state)}>
                  Matutino
                </DropdownItem>
                <DropdownItem onClick={() => handleTurnoSelect("vespertino", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, state)}>
                  Vespertino
                </DropdownItem>
                <DropdownItem onClick={() => handleTurnoSelect("nocturno", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, state)}>
                  Nocturno
                </DropdownItem>
              </DropdownMenu>
            </ButtonDropdown>
          </div>
          <div className="ml-auto date-range-input-container">
            <DatePicker.RangePicker
              onChange={handleFechaSelect} // Usa la nueva función para manejar el cambio de fechas
            />
          </div>
          <hr />
        </CardFooter>
      </Card>
    </div>
  );
}

export default BarCard;

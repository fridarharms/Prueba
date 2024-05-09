import { Bar } from "react-chartjs-2";
import { DatePicker } from "antd";
import { Chart as ChartJS } from "chart.js/auto";
import "chartjs-adapter-luxon";
import { json } from "react-router-dom";
import { Chart } from "primereact/chart";
import React, { useState, useEffect, useReducer } from "react";
import "primereact/resources/themes/lara-light-cyan/theme.css";
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
import { fetchTableData, handleTableSelect, handleTurnoSelect, handleFechaSelect, toggleDropdownTurno } from "variables/ChartComponent.js";
import { fetchChartLineDataFromAPI } from "variables/ChartComponent.js";
import "./dashboard.css";

function TimeLineChart() {
  const [chartData, setChartData] = useState(null);
  const [data2, setdata2] = useState({ labels: [], datasets: [] });
  const [barData, setBarData] = useState(null); // Nuevo estado para el gráfico de barras
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [dropdownTurnoOpen, setDropdownTurnoOpen] = useState(false);
  const [selectedFecha, setSelectedFecha] = useState(new Date());
  const [showAllTables, setShowAllTables] = useState(false);
  const [options, setOptions] = useState(getInitialOptions()); // Estado para las opciones del gráfico
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
    if (selectedTable) {
      fetchChartLineDataFromAPI(selectedTable)
        .then((data) => {
          console.log(data);
          setdata2(data);
        })
        .catch((error) => {
          console.error("Error fetching chart data:", error);
          setdata2(null);
        });
    }
  }, [selectedTable]);

  const fetchChartDataAndUpdate = (tableName, turno, fecha) => {
    fetchChartLineDataFromAPI(tableName, turno, fecha)
      .then((data) => {
        setdata2(data);
      })
      .catch((error) => {
        console.error("Error fetching chart data:", error);
        setdata2(null);
      });
  };

  function dateFormat(date) {
    var pad = function (num) {
      return ("00" + num).slice(-2);
    };
    let hours = pad(date.getHours());
    let minutes = pad(date.getMinutes());
    return hours + ":" + minutes;
  }

  // Función para obtener las opciones iniciales del gráfico
  function getInitialOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue("--text-color-secondary");
    const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

    return {
      maintainAspectRatio: true,
      responsive: true,
      barPercentage: 1,
      categoryPercentage: 1,
      indexAxis: "y",
      aspectRatio: 4,
      title: {
        display: false,
      },
      tooltips: {
        mode: "index",
        intersect: false,
      },
      hover: {
        mode: "nearest",
        intersect: true,
      },
      legend: {
        labels: {
          fontColor: "rgba(0,0,0,.4)",
        },
        align: "end",
        position: "bottom",
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "hour",
            displayFormats: {
              hour: "HH:mm",
            },
          },
          grid: {
            color: surfaceBorder,
          },
          ticks: {
            color: textColorSecondary,
          },
        },
        y: {
          beginAtZero: true,
          stacked: true,
          grid: {
            color: surfaceBorder,
          },
          ticks: {
            color: textColorSecondary,
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: "black",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label;
              let index = context.dataIndex;
              let data0 = dateFormat(new Date(context.dataset.data[index].x[0]));
              let data1 = dateFormat(new Date(context.dataset.data[index].x[1]));

              return label + ": " + data0.toString() + " - " + data1.toString();
            },
          },
        },
      },
    };
  }

  useEffect(() => {
    if (selectedTurno && selectedFecha) {
      let newMinTime, newMaxTime;

      switch (selectedTurno) {
        case "matutino":
          newMinTime = "08:00:00";
          newMaxTime = "14:00:00";
          break;
        case "vespertino":
          newMinTime = "14:00:00";
          newMaxTime = "23:59:59";
          break;
        case "nocturno":
          newMinTime = "00:00:00";
          newMaxTime = "07:59:59";
          break;
        default:
          break;
      }

      const newMinDate = new Date(`${selectedFecha} ${newMinTime}`);
      const newMaxDate = new Date(`${selectedFecha} ${newMaxTime}`);
      
      const newOptions = { ...options };
      newOptions.scales.x.min = newMinDate;
      newOptions.scales.x.max = newMaxDate;
      
      console.log(newMinDate)
      console.log(newMaxDate)
      setOptions(newOptions);
    }
  }, [selectedTurno, selectedFecha]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle tag="h5">Linea de tiempo Maquinas</CardTitle>
          <p className="card-category">Tiempo de estados</p>
        </CardHeader>
            <CardBody>
            {data2 && data2.labels && data2.datasets ?(
              <Bar 
              data={{labels:data2.labels,datasets:data2.datasets}} 
              options={options} 
              />
            ):(
              <div>No Hay datos disponibles</div>
              
            )}
              <script src="https://cdn.jsdelivr.net/npm/chart.js@^3"></script>
              <script src="https://cdn.jsdelivr.net/npm/luxon@^2"></script>
              <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@^1"></script>           
            </CardBody>
        <CardFooter className="d-flex justify-content-between align-items-center">
          <div className="legend" key={1}>
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle caret>{selectedTable || "Seleccionar máquina"}</DropdownToggle>
              <DropdownMenu>
                {tables.map((table, index) => (
                  <DropdownItem
                    key={index}
                    onClick={() =>
                      handleTableSelect(table.Tabla, setSelectedTable, fetchChartDataAndUpdate, selectedTurno, selectedFecha)
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
                <DropdownItem
                  onClick={() =>
                    handleTurnoSelect("matutino", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, selectedFecha)
                  }
                >
                  Matutino
                </DropdownItem>
                <DropdownItem
                  onClick={() =>
                    handleTurnoSelect("vespertino", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, selectedFecha)
                  }
                >
                  Vespertino
                </DropdownItem>
                <DropdownItem
                  onClick={() =>
                    handleTurnoSelect("nocturno", setSelectedTurno, fetchChartDataAndUpdate, selectedTable, selectedFecha)
                  }
                >
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
                  date ? date.toISOString().split("T")[0] : null,
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
  );
}

export default TimeLineChart;

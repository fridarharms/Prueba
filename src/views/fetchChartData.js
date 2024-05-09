import { format } from "date-fns";

const fetchChartData = (tableName, turno, fecha) => {
  let url = `http://172.16.8.172:3001/api/sum-color/${tableName}`;
  if (turno) {
    url += `/${turno}`;
  }
  if (fecha) {
    url += `/${fecha}`;
    console.log(fecha)
  }
  console.log(url)
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data || data.length === 0) {
        return null; // No hay datos disponibles
      } else {
        console.log(data)
        const colors = data.resultado.map((item) => item.color);
        const sumaDiferencia = data.resultado.map((item) => item.suma_diferencia);

        const dynamicColors = colors.map((color) => {
          switch (color.toLowerCase()) {
            case "amarillo":
              return "#FFB236";
            case "desconectado":
              return "#e3e3e3";
            case "desconocido":
              return "#4acccd";
            case "detenido":
              return "#2CA8FF";
            case "error":
              return "#FF3636";
            case "produccion":
              return "#18ce0f";
            case "error tarjeta":
              return "#f96332";
            default:
              return "#000000";
          }
        });

        const chartData = {
          labels: colors,
          datasets: [
            {
              label: "Suma Diferencia",
              backgroundColor: dynamicColors,
              data: sumaDiferencia,
            },
          ],
        };

        return chartData;
      }
    })
    .catch((error) => {
      console.error("Error fetching chart data:", error);
      return null; // Borra el gráfico en caso de error
    });
};

const fetchTableData = () => {
  return fetch("http://172.16.8.172:3001/api/last-color")
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching table data:", error);
      return [];
    });
};

const handleTableSelect = (tableName, setSelectedTable, fetchChartDataAndUpdate, selectedTurno, selectedFecha) => {
  setSelectedTable(tableName);
  fetchChartDataAndUpdate(tableName, selectedTurno, selectedFecha);
};

const handleTurnoSelect = (turno, setSelectedTurno, fetchChartDataAndUpdate, selectedTable, selectedFecha) => {
  setSelectedTurno(turno);
  fetchChartDataAndUpdate(selectedTable, turno, selectedFecha);
};

const handleFechaSelect = (fecha, setSelectedFecha, fetchChartDataAndUpdate, selectedTable, selectedTurno) => {
  if (fecha!== null) {
    // Si la fecha no es null, conviértela a formato yyyy-MM-dd y luego actualiza el estado
    setSelectedFecha(fecha);

    // Llama a la función para obtener y actualizar los datos del gráfico
    fetchChartDataAndUpdate(selectedTable, selectedTurno, fecha);
  } else {
    // Si la fecha es null, no intentes convertirla y simplemente actualiza el estado
    setSelectedFecha(null);
  }
};


const toggleDropdownTurno = (setDropdownTurnoOpen) => {
  setDropdownTurnoOpen((prevState) => !prevState);
};

export { fetchChartData, fetchTableData, handleTableSelect, handleTurnoSelect, handleFechaSelect, toggleDropdownTurno };

import { format } from "date-fns";
const fetchChartLineDataFromAPI = async (tablasBar, turno, fecha) => {
  const tables = Array.isArray(tablasBar) ? tablasBar : [tablasBar];
  console.log("Maquinas " + tables);
  const maquinas = tables; 
  const responses = await Promise.all(
    tables.map(async (tablasBar) => {
      let url = `http://172.16.8.172:3001/api/tables/${tablasBar}`;
      
      if (turno) {
        url += `/${turno}`;
      
      }else{

      }
      if (fecha) {
        url += `/${fecha}`;
      
      }else{
        url += `/2024-05-03`;
      }
      console.log(fecha)
      console.log(url)
      const response = await fetch(url);
    
      return response.json(); // Llamamos a la función json() para obtener los datos JSON reales
    })
  );
  if (!responses) {
    console.error("responses es null o undefined");
    return;
  }
  const data = responses.flat(); // Aplanamos los datos de las respuestas
  return processDataForChart(data);
};
const processDataForChart = (data) => {
  console.log(data)
  const data2 = {
    labels: ["Status"],
    datasets: [
      {
        label: "Produccion",
        backgroundColor: "#18ce0f",
        borderWidth: 1,
        data: data.filter(item => item.color === 'Produccion').map(item => ({
          x: [item.fecha_inicio, item.fecha_fin],
          y: "Status",
        })),
      },
      {
        label: "Detenido",
        backgroundColor: "#2CA8FF",
        borderWidth: 1,
        data: data.filter(item => item.color === 'Detenido').map(item => ({
          x: [item.fecha_inicio, item.fecha_fin],
          y: "Status",
        })),
      },
      {
        label: "Error",
        backgroundColor: "#FF3636",
        borderWidth: 1,
        data: data.filter(item => item.color === 'Error').map(item => ({
          x: [item.fecha_inicio, item.fecha_fin],
          y: "Status",
        })),
      },
      {
        label: "Desconectado",
        backgroundColor: "#e3e3e3",
        borderWidth: 1,
        data: data.filter(item => item.color === 'Desconectado').map(item => ({
          x: [item.fecha_inicio, item.fecha_fin],
          y: "Status",
        })),
      },
      {
        label: "Amarillo",
        backgroundColor: "#FFB236",
        borderWidth: 1,
        data: data.filter(item => item.color === 'Amarillo').map(item => ({
          x: [item.fecha_inicio, item.fecha_fin],
          y: "Status",
        })),
      },
      {
        label: "Desconocido",
        backgroundColor: "#4acccd",
        borderWidth: 1,
        data: data.filter(item => item.color === 'Desconocido').map(item => ({
          x: [item.fecha_inicio, item.fecha_fin],
          y: "Status",
        })),
      },
    ],
  };
  console.log(data2)
  return data2;

}

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
  if (fecha) {
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

export { fetchChartLineDataFromAPI, fetchTableData, handleTableSelect, handleTurnoSelect, handleFechaSelect, toggleDropdownTurno };

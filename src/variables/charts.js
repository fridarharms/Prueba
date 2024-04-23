import { format } from "date-fns";
const fetchChartDataFromAPI = async (tablasBar, turno, fecha) => {
  const tables = Array.isArray(tablasBar) ? tablasBar : [tablasBar];
  console.log("Maquinas " + tables);
  const maquinas = tables; // Usamos el mismo arreglo para las etiquetas de las máquinas

  // Inicializamos arreglos vacíos para almacenar los valores de cada tipo para cada tabla seleccionada
  const produccionValues = [];
  const detenidaValues = [];
  const errorValues = [];
  const desconectadoValues = [];
  const amarilloValues = [];

  // Realizamos las solicitudes de manera concurrente para obtener los datos de las tablas
  const responses = await Promise.all(
    tables.map(async (tablasBar) => {
      let url = `http://localhost:3001/api/sum-same-color/${tablasBar}`;
      
      if (turno) {
        url += `/${turno}`;
      }
      if (fecha) {
        url += `/${fecha}`;
      }
      
      const response = await fetch(url);
      console.log(response);
      return response.json(); // Llamamos a la función json() para obtener los datos JSON reales
    })
  );
  if (!responses) {
    console.error("responses es null o undefined");
    return;
  }

  // Iteramos sobre las respuestas para obtener los datos y llenar los arreglos de valores
  responses.forEach((data) => {
    const datos = transformData(data); // No necesitamos el parámetro tableName aquí
    produccionValues.push(datos.Produccion ? datos.Produccion : 0);
    detenidaValues.push(datos.Detenido ? datos.Detenido : 0);
    errorValues.push(datos.Error ? datos.Error : 0);
    desconectadoValues.push(datos.Desconectado ? datos.Desconectado : 0);
    amarilloValues.push(datos.Amarillo ? datos.Amarillo : 0);
  });

  // Creamos el arreglo de datasets con los valores obtenidos
  const datasets = [
    {
      label: "Produccion",
      data: produccionValues,
      backgroundColor: "#18ce0f",
      borderWidth: 1,
      barPercentage: 0.2,
    },
    {
      label: "Detenido",
      data: detenidaValues,
      backgroundColor: "#2CA8FF",
      borderWidth: 1,
      barPercentage: 0.2,
    },
    {
      label: "Error",
      data: errorValues,
      backgroundColor: "#FF3636",
      borderWidth: 1,
      barPercentage: 0.2,
    },
    {
      label: "Desconectado",
      data: desconectadoValues,
      backgroundColor: "#e3e3e3",
      borderWidth: 1,
      barPercentage: 0.2,
    },
    {
      label: "Amarillo",
      data: amarilloValues,
      backgroundColor: "#FFB236",
      borderWidth: 1,
      barPercentage: 0.2,
    },
  ];

  //console.log(maquinas)
  //console.log(datasets)
  return { labels: maquinas, datasets };
};
// Función para transformar los datos de la API
function transformData(data) {
  const dataByColor = {
    Produccion: 0,
    Detenido: 0,
    Error: 0,
    Desconectado: 0,
    Amarillo: 0,
  };
console.log(data)
  if (data.resultado) {
    data.resultado.forEach((row) => {
      const { color, suma_diferencia } = row;
      dataByColor[color] += suma_diferencia;
    });
  } else {
    console.error(
      "No se encontraron datos válidos en el objeto proporcionado."
    );
  }

  return dataByColor;
}
function getColorBorderColor(color) {
  switch (color) {
    case "Produccion":
      return "#8fe38a";
    case "Error":
      return "#fc7e7e";
    case "Amarillo":
      return "#face87";
    case "Detenido":
      return "#7dc6fa";
    case "Desconectado":
      return "#b0aeae";
    case "Desconocido":
      return "#60bebf";
    default:
      return "#000000"; // Color de borde predeterminado
  }
}

function getColorBackgroundColor(color) {
  switch (color) {
    case "Produccion":
      return "#18ce0f";
    case "Error":
      return "#FF3636";
    case "Amarillo":
      return "#FFB236";
    case "Detenido":
      return "#2CA8FF";
    case "Desconectado":
      return "#e3e3e3";
    case "Desconocido":
      return "#4acccd";
    default:
      return "#ffffff"; // Color de fondo predeterminado
  }
}
const dashboardNASDAQChart = {
  options: {
    maintainAspectRatio: true, // Restauramos la opción de mantener la proporción para que Chart.js ajuste el tamaño automáticamente
    responsive: true,
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
      xAxes: [
        {
          display: true,
          scaleLabel: {
            display: false,
          },
          gridLines: {
            display: false,
          },
        },
      ],
      yAxes: [
        {
          display: true,
          scaleLabel: {
            display: false,
          },
          gridLines: {
            borderDash: [2],
            drawBorder: false,
            borderDashOffset: [2],
            color: "rgba(33, 37, 41, 0.2)",
            zeroLineColor: "rgba(33, 37, 41, 0.15)",
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
          },
        },
      ],
    },
  },
};

const fetchTableData = () => {
  return fetch("http://localhost:3001/api/last-color")
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error fetching table data:", error);
      return [];
    });
};

const handleTableSelect = (
  tableName,
  setSelectedTable,
  fetchChartDataAndUpdate,
  selectedTurno,
  selectedFecha
) => {
  setSelectedTable(tableName);
  fetchChartDataAndUpdate(tableName, selectedTurno, selectedFecha);
};

const handleTableCheckboxChange = (
  tableName,
  setSelectedTables,
  fetchChartDataAndUpdate,
  selectedTurno,
  selectedFecha
) => {
  setSelectedTable(tableName);
  fetchChartDataAndUpdate(tableName, selectedTurno, selectedFecha);
};

function handleTurnoSelect(turno, setSelectedTurno, fetchChartDataAndUpdate, selectedTable, selectedFecha) {
  setSelectedTurno(turno);
  fetchChartDataAndUpdate(selectedTable, turno, selectedFecha);
}


const handleFechaSelect = (
  fecha,
  setSelectedFecha,
  fetchChartDataAndUpdate,
  selectedTable,
  selectedTurno
) => {
  const formattedFecha = format (fecha, "yyyy-MM-dd");
  const fechaParam = fecha ? formattedFecha : ""; // Si fecha es undefined, asigna una cadena vacía
  setSelectedFecha(fecha);
  fetchChartDataAndUpdate(selectedTable, selectedTurno, fechaParam);
};

const toggleDropdownTurno = (setDropdownTurnoOpen) => {
  setDropdownTurnoOpen((prevState) => !prevState);
};

export {
  dashboardNASDAQChart,
  fetchChartDataFromAPI,
  fetchTableData,
  handleTableSelect,
  handleTurnoSelect,
  handleFechaSelect,
  toggleDropdownTurno,
  handleTableCheckboxChange,
};

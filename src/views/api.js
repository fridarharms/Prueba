const express = require("express");
const router = express.Router();
const db = require("./db");
const cors = require("cors");
router.use(cors());
// Función para construir la cláusula WHERE y los parámetros de consulta
const buildQueryParams = (turno, fechaInicio, fechaFin) => {
  let whereClause = "";
  let queryParams = [];

  if (turno && fechaInicio && fechaFin) {
    whereClause = "WHERE DATE(fecha_inicio) >= ? AND DATE(fecha_fin) <= ? AND turno = ?";
    queryParams = [fechaInicio, fechaFin, turno];
  } else if (turno && fechaInicio) {
    whereClause = "WHERE DATE(fecha_inicio) >= ? AND turno = ?";
    queryParams = [fechaInicio, turno];
  } else if (turno && fechaFin) {
    whereClause = "WHERE DATE(fecha_fin) <= ? AND turno = ?";
    queryParams = [fechaFin, turno];
  } else if (turno) {
    whereClause = "WHERE turno = ?";
    queryParams = [turno];
  } else if (fechaInicio && fechaFin) {
    whereClause = "WHERE DATE(fecha_inicio) >= ? AND DATE(fecha_fin) <= ?";
    queryParams = [fechaInicio, fechaFin];
  } else if (fechaInicio) {
    whereClause = "WHERE DATE(fecha_inicio) >= ?";
    queryParams = [fechaInicio];
  } else if (fechaFin) {
    whereClause = "WHERE DATE(fecha_fin) <= ?";
    queryParams = [fechaFin];
  }

  return { whereClause, queryParams };
};
const buildQueryParams2 = (turno, fecha) => {
  let whereClause = "";
  let queryParams = [];

  if (turno && fecha) {
    whereClause = "WHERE DATE(fecha_inicio) >= ? AND DATE(fecha_fin) <= ? AND turno = ?";
    queryParams = [fecha, fecha, turno];
  } else if (turno) {
    whereClause = "WHERE turno = ?";
    queryParams = [turno];
  } else if (fecha) {
    whereClause = "WHERE DATE(fecha_inicio) >= ? AND DATE(fecha_fin) <= ?";
    queryParams = [fecha, fecha];
  }

  return { whereClause, queryParams };
};


// Ruta para obtener el último color de cada tabla
router.get("/last-color", (req, res) => {
  db.query("SHOW TABLES", (error, tables) => {
    if (error) {
      console.error("Error al obtener las tablas:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (!tables || !tables.length) {
      console.error("No se encontraron tablas en la base de datos");
      return res.status(404).json({ error: "No se encontraron tablas" });
    }

    const queries = tables.map((tableRow) => {
      const tableName = tableRow.Tables_in_world;
      return `(SELECT '${tableName}' AS Tabla, color FROM world.${tableName} ORDER BY fecha_inicio DESC LIMIT 1)`;
    });

    const fullQuery = queries.join(" UNION ALL ");
    db.query(fullQuery, (error, results) => {
      if (error) {
        console.error("Error al obtener el último color:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
      }

      if (!results || !results.length) {
        return res.status(404).json({ error: "No se encontraron colores" });
      }

      res.json(results);
    });
  });
});

// Ruta para sumar la columna "diferencia" de tablas con el mismo color, considerando la fecha y el turno
router.get("/sum-same-color/:tableName/:turno?/:fechaInicio?/:fechaFin?", (req, res) => {
  const { turno, tableName, fechaInicio, fechaFin } = req.params;
  const { whereClause, queryParams } = buildQueryParams(turno, fechaInicio, fechaFin);

  const query = `SELECT color, SUM(diferencia)/3600 AS suma_diferencia FROM ${tableName} ${whereClause} GROUP BY color`;
  
  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error("Error al obtener la suma de diferencia:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    if (!results || !results.length) {
      return res.status(404).json({ error: "No se encontraron resultados" });
    }
    
    const table = tableName;
    const resultado = results;
    console.log({table, resultado});
    res.json({table, resultado});
  });
});
//Ruta para obtener los datos de una tabla específica con los campos solicitados, considerando turno y fecha
router.get("/tables/:tableName/:turno?/:fecha?", (req, res) => {
  const { tableName, turno, fecha} = req.params;

  // Construir la cláusula WHERE y los parámetros de consulta
  const { whereClause, queryParams } = buildQueryParams2(turno, fecha);

  // Construir la consulta SQL para obtener los datos de la tabla seleccionada con los filtros y la hora de fecha_inicio y fecha_fin
  const query = `
    SELECT ID_maquina, color, diferencia,fecha_fin,fecha_inicio FROM ${tableName} ${whereClause}`;

  // Ejecutar la consulta en la base de datos
  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error("Error al obtener los datos de la tabla:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (!results || !results.length) {
      return res.status(404).json({ error: "No se encontraron datos" });
    }

    // Devolver los resultados como respuesta JSON
    res.json(results);
    console.log(results);
  });
});

router.get("/sum-color/:tableName/:turno?/:fecha", (req, res) => {
  const { turno, tableName, fecha} = req.params;
  const { whereClause, queryParams } = buildQueryParams2(turno, fecha);

  const query = `SELECT color, SUM(diferencia)/3600 AS suma_diferencia FROM ${tableName} ${whereClause} GROUP BY color`;
  
  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error("Error al obtener la suma de diferencia:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
    if (!results || !results.length) {
      return res.status(404).json({ error: "No se encontraron resultados" });
    }
    
    const table = tableName;
    const resultado = results;
    console.log({table, resultado});
    res.json({table, resultado});
  });
});

router.get("/all-tables", (req, res) => {
  // Obtener todas las tablas de la base de datos
  db.query("SHOW TABLES", (error, tables) => {
    if (error) {
      console.error("Error al obtener las tablas:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    // Verificar si se encontraron tablas
    if (!tables || !tables.length) {
      console.error("No se encontraron tablas en la base de datos");
      return res.status(404).json({ error: "No se encontraron tablas" });
    }

    // Crear una promesa para ejecutar la consulta en cada tabla
    const queries = tables.map((tableRow) => {
      const tableName = tableRow.Tables_in_world; 
      const query = `SELECT color, SUM(diferencia)/3600 AS suma_diferencia FROM ${tableName} GROUP BY color`;
      return new Promise((resolve, reject) => {
        db.query(query, (error, results) => {
          if (error) {
            console.error(`Error al obtener los datos de la tabla ${tableName}:`, error);
            resolve({ tableName, error });
          } else {
            resolve({ tableName, results });
          }
        });
      });
    });
    // Ejecutar todas las consultas en paralelo
    Promise.all(queries)
      .then((data) => {
        res.json(data); // Devolver los resultados de todas las consultas
        data.forEach((e) => console.log(e));
      })
      .catch((error) => {
        console.error("Error al ejecutar las consultas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
      });
  });
});
module.exports = router;

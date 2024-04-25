const express = require("express");
const router = express.Router();
const db = require("./db");
const cors = require("cors");
router.use(cors());
// Función para construir la cláusula WHERE y los parámetros de consulta
const buildQueryParams = (turno, fecha) => {
  let whereClause = "";
  let queryParams = [];

  if (turno && fecha) {
    whereClause = "WHERE DATE(fecha_inicio) = ? AND turno = ?";
    queryParams = [fecha, turno];
  } else if (turno) {
    whereClause = "WHERE turno = ?";
    queryParams = [turno];
  } else if (fecha) {
    whereClause = "WHERE DATE(fecha_inicio) = ?";
    queryParams = [fecha];
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
router.get("/sum-same-color/:tableName/:turno?/:fecha?", (req, res) => {
  //console.log(req.params.tableName);
  const { turno, tableName, fecha } = req.params;
  const { whereClause, queryParams } = buildQueryParams(turno, fecha);

  const query = `SELECT color, SUM(diferencia)/3600 AS suma_diferencia FROM ${tableName} ${whereClause} GROUP BY color`;
  //console.log(queryParams);
  
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
//Ruta para obtener las tablas de mi base de datos 
router.get("/tables",(req,res)=>{
  const query = "SELECT color, SUM(diferencia)/3600 AS suma_diferencia FROM milltap700 GROUP BY color";

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al obtener los datos:", error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }

    if (!results || !results.length) {
      return res.status(404).json({ error: "No se encontraron datos" });
    }

    // Variables separadas
    const table = "milltap500";
    const colors = results.map(item => item.color);
    const sumaDiferencia = results.map(item => item.suma_diferencia);
    
    results.forEach((e) => console.log(e));

    res.json({ table, results });
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

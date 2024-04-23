import React, { useState } from "react";
import { MultiSelect } from "react-multi-select-component";

const Multiselect = ({ tables, test, barData }) => {
  const [selectedTables, setSelectedTables] = useState([]);

  return (
    <div>
      <MultiSelect
        options={tables.map((table, index) => ({
          value: table.Tabla,
          label: table.Tabla,
          key: index,
        }))}
        value={selectedTables}
        onChange={(e) => {
          setSelectedTables(e);
          test(e);
          console.log(barData);
        }}
        labelledBy="Tabla"
      />
    </div>
  );
};

export default Multiselect;
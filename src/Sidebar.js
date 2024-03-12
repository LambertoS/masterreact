import React from 'react';

function Sidebar() {
  // Funktion zum Hinzufügen eines neuen Nodes
  const addNode = () => {
    // Implementiere die Logik zum Hinzufügen eines Nodes
    console.log("Node hinzugefügt");
  };

  return (
    <div className="sidebar">
      <button onClick={addNode}>Node hinzufügen</button>
      {/* Weitere Buttons und Menüelemente hier */}
    </div>
  );
}

export default Sidebar;

import React, { useState, useEffect } from 'react';

const NodeProcessor = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);

    useEffect(() => {
        // Hier könntest du deine Nodes und Edges aus dem Zustand laden, z.B. aus einem API-Aufruf
        setNodes([
            // Deine Knoten hier
        ]);
        setEdges([
            // Deine Kanten hier
        ]);
    }, []);

    const findNodeById = (nodeId) => nodes.find((node) => node.id === nodeId);

    const processNode = (nodeId, visited = new Set()) => {
        if (visited.has(nodeId)) return ''; // Vermeide zyklische Abhängigkeiten
        visited.add(nodeId);

        const node = findNodeById(nodeId);
        if (!node) return ''; // Falls der Knoten nicht existiert, überspringe

        // Basisinformationen des Knotens sammeln
        let nodeDataString = `${node.type}: ${node.data.label || ''} - ${node.data.function || ''} (${node.data.parameters || ''})\n`;

        // Finde alle ausgehenden Kanten dieses Knotens
        const outgoingEdges = edges.filter(edge => edge.source === nodeId);
        // Sortiere die Kanten basierend auf der Priorität der sourceHandles
        outgoingEdges.sort((a, b) => {
            const priority = { l: 1, t: 2, f: 3, b: 4 };
            return (priority[a.sourceHandle] || 5) - (priority[b.sourceHandle] || 5);
        });

        // Rekursiv alle verbundenen Knoten verarbeiten
        for (const edge of outgoingEdges) {
            nodeDataString += processNode(edge.target, visited);
        }

        return nodeDataString;
    };

    // Funktion zum Starten der Verarbeitung und Ausgabe
    const handleProcessNodes = () => {
        let result = '';
        // Startknoten finden (Knoten ohne eingehende Kanten)
        const startNodes = nodes.filter(node => !edges.some(edge => edge.target === node.id));
        for (const startNode of startNodes) {
            result += processNode(startNode.id);
        }
        console.log(result);
        // Hier könntest du den result String weiterverwenden, z.B. im Zustand speichern oder anzeigen
    };
};

export default NodeProcessor;

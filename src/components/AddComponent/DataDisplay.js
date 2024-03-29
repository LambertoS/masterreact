import {EntryForm} from "./EntryForm";
import React from "react";

/**
 * Displays data in a structured format, allowing dynamic addition of objects or arrays.
 *
 * @param {Object} data The data object to display.
 * @param {Function} onAdd The callback function to execute for adding new data.
 * @param {Array} path The current path to the data being displayed, used for nested structures.
 * @return {JSX.Element} The DataDisplay component with the structured display of data and an entry form for adding new elements.
 */
export const DataDisplay = ({data, onAdd, path = []}) => {
    return (
        <div>
            {/* Iterate over the data object entries */}
            {Object.entries(data).map(([key, value], index) => (
                <div key={typeof key === 'number' ? index : key}>
                    {/* Check if the value is an array */}
                    {Array.isArray(value) ? (
                        <>
                            <strong>{key}:</strong> Array
                            {/* Iterate over array items */}
                            {value.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                    - {typeof item === 'object' ? <DataDisplay data={item} onAdd={onAdd}
                                                                               path={[...path, key, itemIndex]}/> : item.toString()}
                                </div>
                            ))}
                            {/* Button to add an object to the array */}
                            <button onClick={() => onAdd(key, {}, [...path, key])}>+ Objekt zu Array hinzufügen</button>
                        </>
                    ) : typeof value === 'object' ? (
                        <>
                            {/* Display nested objects using DataDisplay recursively */}
                            <strong>{key}:</strong>
                            <DataDisplay data={value} onAdd={onAdd} path={[...path, key]}/>
                        </>
                    ) : (
                        <div>
                            {/* Display simple key-value pair */}
                            {key}: {value.toString()}
                        </div>
                    )}
                </div>
            ))}

            {/* EntryForm for adding new key-value pairs at the current path */}
            <EntryForm onSubmit={(key, value) => onAdd(key, value, path)}/>
        </div>
    );
};
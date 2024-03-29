import React, {useState} from "react";

/**
 * Represents a form component for creating or updating key-value pairs.
 * Supports text, object, and array types for the value.
 *
 * @param {Function} onSubmit The callback function to execute upon form submission.
 * @return {JSX.Element} The EntryForm component with inputs for key, value, and type, and a submit button.
 */
export const EntryForm = ({onSubmit}) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [type, setType] = useState('text'); // 'text', 'object', 'array'

    /**
     * Handles the form submission, processes the input values based on the selected type,
     * calls the onSubmit callback, and resets the form fields.
     *
     * @param {Event} e The form submission event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        let adjustedValue; // Variable to store the adjusted value based on the type
        if (type === 'text') {
            adjustedValue = value; // Use the text value directly
        } else if (type === 'object' || type === 'array') {
            // For 'object' or 'array', initialize as empty object or array then stringify
            adjustedValue = JSON.stringify(type === 'object' ? {} : []);
        }

        onSubmit(key, adjustedValue); // Call the onSubmit callback with key and adjustedValue

        // Reset form fields after submission
        setKey('');
        setValue('');
        setType('text');
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Input for the key */}
            <input
                type="text"
                placeholder="Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
            />
            {/* Conditionally render the value input for type 'text' */}
            {type === 'text' && (
                <input
                    type="text"
                    placeholder="Value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                />
            )}
            {/* Selector for the type of the value */}
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="text">Text</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
            </select>
            {/* Submit button */}
            <button type="submit">Add</button>
        </form>
    );
};
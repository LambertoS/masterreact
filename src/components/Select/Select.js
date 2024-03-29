import {useState} from "react";

/**
 * A customizable select dropdown component.
 *
 * @param {Array<{value: string, label: string}>} options - The options for the select dropdown.
 * @param {string} defaultValue - The default value to be selected in the dropdown.
 * @param {Function} [onChange] - Optional callback function that is called when the selected value changes.
 */
export const Select = ({options, defaultValue, onChange}) => {
    const [selectedValue, setSelectedValue] = useState(defaultValue);

    /**
     * Handles changes to the select dropdown, updating the component's state and invoking the onChange callback.
     *
     * @param {Event} event - The change event.
     */
    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelectedValue(newValue); // Update the selected value
        if (onChange) {
            onChange(newValue); // Call the onChange callback with the new value
        }
    };

    return (
        <select value={selectedValue} onChange={handleChange}>
            {options.map((option, index) => (
                <option key={index} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}
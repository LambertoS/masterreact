import {useState} from "react";

export const Select = ({options, defaultValue, onChange }) => {
    // State to keep track of the selected option
    const [selectedValue, setSelectedValue] = useState(defaultValue);

    // Handler for when an option is selected
    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelectedValue(newValue);
        if (onChange) {
            onChange(newValue);
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
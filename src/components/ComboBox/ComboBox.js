import React, {useState} from 'react';
import "./ComboBox.css"

/**
 * Represents a custom combo box component with a text input and a dropdown list of options.
 * The component allows users to type for filtering and select options from the dropdown.
 *
 * @param {Array<string>} options The array of options to be displayed in the dropdown.
 * @param {Function} inputChanged Callback function that is called when the input value changes or an option is selected.
 * @param {string} [inputClassName=''] Optional CSS class name to apply to the input element.
 * @return {JSX.Element} The CustomComboBox component with a text input and a conditional dropdown list.
 */
export const CustomComboBox = ({options, inputChanged, inputClassName = ''}) => {
    const [inputValue, setInputValue] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    /**
     * Handles changes to the input field, updating the component's state and making the dropdown visible.
     *
     * @param {Event} event The input change event.
     */
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        inputChanged(event.target.value)
        setIsDropdownVisible(true);
    };

    /**
     * Handles selection of an option from the dropdown, updating the input field and notifying the parent component.
     *
     * @param {string} value The selected option value.
     */
    const handleSelect = (value) => {
        setInputValue(value);
        inputChanged(value)
        setIsDropdownVisible(false);
    };

    return (
        <div className="custom-combo-box">
            {/* Text input for filtering and displaying the selected option */}
            <input
                className={inputClassName}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownVisible(true)}
                onBlur={() => setTimeout(() => setIsDropdownVisible(false), 100)}
            />
            {/* Conditionally rendered dropdown list */}
            {isDropdownVisible && (
                <ul style={{position: 'absolute', listStyleType: 'none', padding: 0}}>
                    {options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleSelect(option)}
                            style={{cursor: 'pointer'}}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
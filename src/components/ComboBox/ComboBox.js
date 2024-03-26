import React, {useState} from 'react';
import "./ComboBox.css"

export const CustomComboBox = ({ options, inputChanged, inputClassName = '' }) => {
    const [inputValue, setInputValue] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const handleInputChange = (event) => {
        setInputValue(event.target.value);
        inputChanged(event.target.value)
        setIsDropdownVisible(true);
    };

    const handleSelect = (value) => {
        setInputValue(value);
        inputChanged(value)
        setIsDropdownVisible(false);
    };

    return (
        <div className="custom-combo-box">
            <input
                className={inputClassName}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsDropdownVisible(true)}
                onBlur={() => setTimeout(() => setIsDropdownVisible(false), 100)}
            />
            {isDropdownVisible && (
                <ul style={{ position: 'absolute', listStyleType: 'none', padding: 0 }}>
                    {options.map((option) => (
                        <li
                            key={option}
                            onClick={() => handleSelect(option)}
                            style={{ cursor: 'pointer' }}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
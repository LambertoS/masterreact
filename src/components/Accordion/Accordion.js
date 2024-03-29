import {useState} from "react";

/**
 * Represents an Accordion component that can toggle its content visibility.
 *
 * @param {string} title The title of the accordion that is always visible.
 * @param {JSX.Element} children The content to be shown or hidden based on the accordion's state.
 * @return {JSX.Element} The Accordion component with a toggle button and conditional content visibility.
 */
export const Accordion = ({ title, children }) => {
    // State to manage the visibility of the accordion content
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            {/* Button to toggle the visibility of the accordion content */}
            <button onClick={() => setIsOpen(!isOpen)}>
                {title}
            </button>
            {/* Conditionally renders the children elements based on the isOpen state */}
            {isOpen && <div>{children}</div>}
        </div>
    );
};
import {useState} from "react";

export const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)}>
                {title}
            </button>
            {isOpen && <div>{children}</div>}
        </div>
    );
};
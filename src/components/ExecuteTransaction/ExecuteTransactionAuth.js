import React, {useEffect, useState} from "react";
import {Select} from "../Select/Select";
import {useWavesTransactions} from "../../context/WavesTransactionContext";

export const ExecuteTransactionAuth = () => {
    const [key, setKey] = useState("")
    const [value, setValue] = useState("")
    const [selectValue, setSelectValue] = useState("admin")
    const [selectInformationKey, setSelectInformationKey] = useState("")
    const [selectInformationValue, setSelectInformationValue] = useState("")

    const {dataTransaction} = useWavesTransactions();

    useEffect(() => {
        if (selectValue === "admin") {
            setKey("connection.")
            setSelectInformationKey("Insert the address to the user account (eg. connection.3MsUxXzziM...).")
            setValue("authorized")
            setSelectInformationValue("Do not change.")
        } else if (selectValue === "user") {
            setKey("connection.root")
            setSelectInformationKey("Do not change.")
            setValue("")
            setSelectInformationValue("Insert the address to the root account (eg. 3MsUxXzziM...).")
        }
    }, [selectValue])

    const handleAuthSubmit = async (event) => {
        event.preventDefault()

        try {
            // Perform the data transaction with the provided key-value pair.
            await dataTransaction({
                data: [{key: key, type: "string", value: value}]
            })

            /*await invokeScript({
                dApp: scAddress,
                call: {
                    function: keyValuePairFunctionName,
                    args: [{type: "string", value: keyValuePairKey}, {type: "string", value: keyValuePairValue}],
                },
                payment: [],
            });*/
        } catch (error) {
            console.error("Error uploading the key-value pair", error);
        }
    }

    return (
        <div className="form-container">
            <h2>Authenticate Account</h2>
            Your role:
            <Select
                options={[
                    {label: "Admin", value: "admin"},
                    {label: "User", value: "user"}
                ]}
                defaultValue="admin"
                onChange={(value) => {setSelectValue(value)}}
            />

            <form onSubmit={handleAuthSubmit}>
                <div className="form-field">
                    <label className="form-label">Key:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                    />
                    {selectInformationKey}
                </div>
                <div className="form-field">
                    <label className="form-label">Value:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                    {selectInformationValue}
                </div>
                <button type="submit" className="form-submit-button">Auth</button>
            </form>
        </div>
    )
}
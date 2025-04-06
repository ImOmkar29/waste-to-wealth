import React, { createContext, useState } from 'react';

export const WasteRequestContext = createContext();

export const WasteRequestProvider = ({ children }) => {
    const [wasteRequests, setWasteRequests] = useState([]);

    const updateWasteRequests = (newRequest) => {
        setWasteRequests(prevState => [...prevState, newRequest]);
    };

    return (
        <WasteRequestContext.Provider value={{ wasteRequests, updateWasteRequests }}>
            {children}
        </WasteRequestContext.Provider>
    );
};
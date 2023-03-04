import { useState, useEffect, createContext, useContext } from "react";
import { DefaultApi } from "./api/api";
import { Configuration } from "./api/configuration";

export const APIContext = createContext<DefaultApi | null>(null);

export function APIProvider({ url, children }: { url: string, children: React.ReactNode }) {
    const [api, setApi] = useState<DefaultApi | null>(null);
    useEffect(() => {
        const api = new DefaultApi(
            new Configuration({
                basePath: url,
            })
        )
        setApi(api);
    }, []);
    return (
        <APIContext.Provider value={api}>
            {children}
        </APIContext.Provider>
    );
}

export function useAPI() {
    const api = useContext(APIContext);
    if (api === null) {
        throw new Error("API not initialized");
    }
    return api;
}
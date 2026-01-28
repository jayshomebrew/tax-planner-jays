import { useState, useEffect } from 'react';
import { TAX_DATA_URLS } from '../constants';

export const useTaxData = (year) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(TAX_DATA_URLS[year]);
                if (!response.ok) throw new Error("Failed to fetch tax data");
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                console.error(err);
                setError("Could not load tax tables. Using fallback data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [year]);

    return { data, loading, error };
};

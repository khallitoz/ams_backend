import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";

interface ListItem {
    id: string;
    fields: {
        Title: string;
        [key: string]: any;
    };
}

const MicrosoftList: React.FC = () => {
    const { getAccessToken } = useAppContext();
    const [listItems, setListItems] = useState<ListItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchListItems = async () => {
            try {
                const token = await getAccessToken();
                console.log(token);


                const response = await fetch(
                    "https://belzir.sharepoint.com/_api/web/lists/GetByTitle('ams')",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Attach the access token
                            "Content-Type": "application/json",
                        },
                    }
                );

                return console.log(response)
            } catch (err: any) {
                console.error("Error fetching list items:", err);
                setError(err.message || "An unknown error occurred");
            }
        };

        fetchListItems();
    }, [getAccessToken]);

    return (
        <div>
            <h3>Microsoft List Items</h3>
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            <ul>
                {listItems.length > 0 ? (
                    listItems.map((item) => (
                        <li key={item.id}>
                            {item.fields.Title || "No Title Available"}
                        </li>
                    ))
                ) : (
                    <p>No list items found.</p>
                )}
            </ul>
        </div>
    );
};

export default MicrosoftList;

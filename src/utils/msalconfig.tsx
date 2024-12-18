import { PublicClientApplication, Configuration } from "@azure/msal-browser";

const msClientId = process.env.NEXT_PUBLIC_MICROSOFT_APP_CLIENT_ID;
const TenantId = process.env.NEXT_PUBLIC_MICROSOFT_APP_TENANT_ID;

const msalConfig: Configuration = {
    auth: {
        clientId: msClientId || "",
        authority: `https://login.microsoftonline.com/${TenantId}`,
        redirectUri: "http://localhost:3000", // Ensure this matches Azure AD portal
    },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export const initializeMsal = async () => {
    try {
        if (!msalInstance || msalInstance.initialize) {
            await msalInstance.initialize();
            console.log("MSAL initialized successfully");
        }
    } catch (error) {
        console.error("MSAL initialization failed:", error);
        throw error;
    }
};

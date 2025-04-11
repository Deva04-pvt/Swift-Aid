import Vapi from "@vapi-ai/web";

// Initialize the VAPI client with your web token
export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN);

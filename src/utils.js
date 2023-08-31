import { BASE_SERVER_URL } from "./config";

export function getAbsoluteUrl(relativeUrl) {
    return `${BASE_SERVER_URL}${relativeUrl}`;
}
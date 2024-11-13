import {
    FetchUserTopItemsParams,
    SpotifyItem,
    SpotifyTopArtistsTracksResponse,
    SpotifyUserProfile
} from "../../types";
import {appScope, redirectUri, sessionCookie} from "../../constants.ts";

const accessToken = document.cookie.split(";").find((row) => row.startsWith(`${sessionCookie}=`))?.split("=")[1];
export const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID

export const fetchUserProfile = async () => {
    return await fetchProfile();
}

export async function redirectToAuthCodeFlow() {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirectUri);
    params.append("scope", appScope);
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`
}

function generateCodeVerifier(length: number) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(authCode: string) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", authCode);
    params.append("redirect_uri", redirectUri);
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: params
    });
    const results = await result.json();
    console.log(results);
    const {access_token, refresh_token} = results;
    return {access_token, refresh_token};
}

export const refreshAccessToken = async (refreshToken: string | null) => {
    const url = "https://accounts.spotify.com/api/token";

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}`,
    }
    const body = await fetch(url, payload);
    const response = await body.json();
    console.log('response: ', response);
    return {accessToken: response.access_token, refreshToken: response.refresh_token};

}

export async function fetchProfile(): Promise<SpotifyUserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: {Authorization: `Bearer ${accessToken}`}
    });

    if (!result.ok) {
        if (result.status === 401) {
            // Handle unauthorized error specifically
            throw new Error("Unauthorized");
        } else {
            console.error(`Fetch failed with status: ${result.status}`);
            throw new Error(`HTTP error! Status: ${result.status}`);
        }
    }

    return result.json();
}

export async function fetchUserTopItems({
                                            type,
                                            time_range = "medium_term",
                                            limit
                                        }: FetchUserTopItemsParams): Promise<SpotifyItem[] | null> {
    const queryParams = new URLSearchParams({time_range, ...(limit && {limit: limit.toString()})}).toString();

    const result = await fetch(`https://api.spotify.com/v1/me/top/${type}?${queryParams}`, {
        method: "GET",
        headers: {Authorization: `Bearer ${accessToken}`}
    });

    if (!result.ok) {
        if (result.status === 401) {
            throw new Error("Unauthorized");
        } else {
            console.error(`Fetch failed with status: ${result.status}`);
            throw new Error(`HTTP error! Status: ${result.status}`);
        }
    }

    const data: SpotifyTopArtistsTracksResponse = await result.json();
    return data.items;
}
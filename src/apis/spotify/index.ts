import {FetchUserTopItemsParams, SpotifyTopArtistsTracksResponse, UserProfile} from "../../types";

export const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID

const accessToken = localStorage.getItem('access_token') || '';

export const getProfileImage = (profile: UserProfile) => {
    if (profile.images[0]) {
        const profileImage = new Image(200, 200);
        profileImage.src = profile.images[0].url;
        return profileImage;
    }
}

export const fetchUserProfile = async () => {
    try {
        return await fetchProfile(accessToken);
    } catch (error) {
        console.error("Failed to fetch profile", error);
    }
}

export async function redirectToAuthCodeFlow() {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:8888/callback");
    params.append("scope", "user-read-private user-read-email");
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
    params.append("redirect_uri", "http://localhost:8888/callback");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    if (access_token) {
        localStorage.setItem('access_token', access_token)
    }
    return access_token;
}

export async function fetchProfile(accessToken: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${accessToken}` }
    });

    if(!result.ok) {
        throw new Error("Failed to fetch profile");
    }

    return result.json();
}

function populateUI(profile: UserProfile) {
    // TODO: Update UI with profile data
}
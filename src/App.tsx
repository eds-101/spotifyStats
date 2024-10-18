import './App.css'
import {useEffect, useState} from "react";
import {
    clientId,
    fetchUserProfile, getProfileImage,
    redirectToAuthCodeFlow
} from "./apis/spotify";
import {UserProfile} from "./types";

function App() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");

    useEffect(() => {
        if (!authCode) {
            redirectToAuthCodeFlow(clientId);
        }

        if (authCode && !profile) {
            const fetchProfile = async () => {
                const userProfile = await fetchUserProfile(authCode)
                setProfile(userProfile)
            };

            fetchProfile()
        }
    }, [authCode, profile])

    const profileImage = profile ? getProfileImage(profile) : null;

    return (
        <>
            <h1>Spotify Stats</h1>
            <div className="card">
                <img src={profileImage?.src} alt="Profile Pic"/>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App

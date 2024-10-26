import './App.css'
import {useEffect, useState} from "react";
import {
    fetchUserProfile, getAccessToken, getProfileImage,
    redirectToAuthCodeFlow
} from "./apis/spotify";
import {UserProfile} from "./types";

function App() {
    const [profile, setProfile] = useState<UserProfile | null>(() => {
        const storedProfile = localStorage.getItem("profile");
        return storedProfile ? JSON.parse(storedProfile) : null;
    });

    const [profileImage, setProfileImage] = useState<HTMLImageElement | null>(() => {
        const storedImage = localStorage.getItem("profileImage");
        if (storedImage) {
            const image = new Image(200, 200);
            image.src = storedImage;
            return image;
        }
        return null;
    });

    const params = new URLSearchParams(window.location.search);
    const accessToken = localStorage.getItem("access_token");
    const authCode = params.get("code") || localStorage.getItem("authCode") || '';

    useEffect(() => {
        if (!accessToken) {
            try {
            redirectToAuthCodeFlow();
            getAccessToken(authCode).then((token) => {
                if (token) {
                localStorage.setItem("access_token", token);
                }
            })
            }
            catch (e) {
                console.error("Error fetching access token:", e);
            }
        }
    }, [accessToken]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userProfile = await fetchUserProfile();
                console.log('userProfile', userProfile);
                if (userProfile) {
                    setProfile(userProfile);
                    localStorage.setItem("profile", JSON.stringify(userProfile));
                    const image = getProfileImage(userProfile);
                    setProfileImage(image ?? null);
                    if (image) {
                        localStorage.setItem("profileImage", image.src);
                    }
                }
            } catch (e) {
                console.error("Error fetching profile:", e);
            }
        }

        if (!profile) {
            fetchProfile();
        }
    }, [profile]);

    useEffect(() => {
        const fetchProfileAssets = async () => {
            try {
                if (profile) {
                const image = getProfileImage(profile);
                    setProfileImage(image ?? null);
                    if (image) {
                        localStorage.setItem("profileImage", image.src);
                    }
                }
            } catch (e) {
                console.error("Error fetching profile assets:", e);
            }
        }

        if (profile) {
            fetchProfileAssets();
        }
    }, [profile]);

    return (
        <>
            <h1>Spotify Stats</h1>
            <div className="card">
                {profileImage && <img src={profileImage.src} alt="Profile pic"/>}
            </div>
            <p className="read-the-docs">
                Hello {profile?.display_name} from {profile?.country}
            </p>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App

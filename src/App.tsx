import './App.css'
import React, {useEffect, useState} from "react";
import {
    fetchUserProfile, fetchUserTopItems, getAccessToken, getProfileImage,
    redirectToAuthCodeFlow
} from "./apis/spotify";
import {FetchUserTopItemsParams, SpotifyItem, UserProfile} from "./types";
import {cookieMaxAge, fallbackImage, sessionCookie} from "./constants.ts";

const accessToken = document.cookie.split(";").find((row) => row.startsWith(`${sessionCookie}=`))?.split("=")[1];

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

    const [topArtists, setTopArtists] = useState<SpotifyItem[] | null>(() => {
        if (accessToken) {
            fetchUserTopItems({type: "artists", time_range: "medium_term", limit: 10}).then((response) => {
                console.log("top artists state set");
                console.log(response.items);
                return response.items;
            });
        }
        return null;
    });

    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");

    const periods = [{queryParam: "short_term", label: "Very Recent"}, {
        queryParam: "medium_term",
        label: "Recent",
        default: true
    }, {queryParam: "long_term", label: "Long Term"}];

    const handlePeriodChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const period = event.target.value as FetchUserTopItemsParams["time_range"];
        await fetchUserTopItems({type: "artists", time_range: period, limit: 10}).then((response) => {
            setTopArtists(response.items);
        });
    }

    useEffect(() => {
        const fetchAndStoreToken = async () => {
            if (!authCode) {
                await redirectToAuthCodeFlow();
            } else {
                try {
                    const token = await getAccessToken(authCode);
                    if (token) {
                        document.cookie = `${sessionCookie}=${token}; max-age=${cookieMaxAge}; Secure;`;
                    }
                } catch (err) {
                    console.error("Error fetching access token:", err);
                }
            }
        }

        if (!accessToken) {
            fetchAndStoreToken();
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
                if (profile) {
                    try {
                        const image = getProfileImage(profile);
                        setProfileImage(image ?? null);
                        if (image) {
                            localStorage.setItem("profileImage", image.src);
                        }
                        const topArtists = await fetchUserTopItems({type: "artists", time_range: "medium_term", limit: 10});
                        setTopArtists(topArtists.items);
                    } catch
                        (e) {
                        console.error("Error fetching profile assets:", e);
                    }
                }
            }

            fetchProfileAssets();
        }, [profile]
    );

    return (
        <>
            <h1>Spotify Stats</h1>
            <div className="card">
                {profileImage && <img src={profileImage.src} alt="Profile pic"/>}
            </div>
            <div className="card">
                <p className="read-the-docs">
                    Top Artists - Time period:
                </p>
                <select id="periods" name="periods" onChange={handlePeriodChange}>
                    {periods.map((period) => {
                        return (
                            <option key={period.queryParam} value={period.queryParam}
                                    selected={period.default}>{period.label}</option>
                        )
                    })}
                </select>
            </div>
            <div className="card">
                {topArtists && topArtists.map((artist, i) => {
                    return (
                        <div key={artist.id} className="card-item">
                            <p>{i + 1}: {artist.name}</p>
                            <img height="200px" width="200px" src={artist.images?.[0]?.url || fallbackImage} onError={(event) => {
                                console.log("Image failed to load, using fallback");
                                event.currentTarget.src = fallbackImage
                            }} alt={artist.name}/>
                        </div>
                    )
                })}
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    )
}

export default App

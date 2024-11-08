import './App.css'
import React, {useEffect, useState} from "react";
import {
    fetchUserProfile, fetchUserTopItems, getAccessToken, getProfileImage,
    redirectToAuthCodeFlow
} from "./apis/spotify";
import {FetchUserTopItemsParams, SpotifyItem} from "./types";
import {cookieMaxAge, fallbackImage, sessionCookie} from "./constants.ts";

const accessToken = document.cookie.split(";").find((row) => row.startsWith(`${sessionCookie}=`))?.split("=")[1];

function App() {
    const [failedFetch, setFailedFetch] = useState(false);
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
    const [topTracks, setTopTracks] = useState<SpotifyItem[] | null>(null);

    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");

    const periods = [{queryParam: "short_term", label: "Very Recent"}, {
        queryParam: "medium_term",
        label: "Recent",
        default: true
    }, {queryParam: "long_term", label: "Long Term"}];

    const handlePeriodChange = async (event: React.ChangeEvent<HTMLSelectElement>, type: "artists" | "tracks") => {
        const period = event.target.value as FetchUserTopItemsParams["time_range"];
        await fetchUserTopItems({type, time_range: period, limit: 10}).then((response) => {
            if (type === "artists") {
                setTopArtists(response.items);
            }
            else {
                setTopTracks(response.items);
            }
        });
    }

    useEffect(() => {
        const fetchAndStoreToken = async () => {
            if (!authCode || failedFetch) {
                await redirectToAuthCodeFlow();
            } else {
                try {
                    const token = await getAccessToken(authCode);
                    if (token) {
                        document.cookie = `${sessionCookie}=${token}; max-age=${cookieMaxAge}; Secure;`;
                        setFailedFetch(false)
                    }
                } catch (err) {
                    console.error("Error fetching access token:", err);
                }
            }
        }

        if (!accessToken) {
            fetchAndStoreToken();
        } else {
            setFailedFetch(false);
        }
    }, [accessToken, authCode, failedFetch]);

    useEffect(() => {
        Promise.all(
            [
                fetchUserProfile(),
                fetchUserTopItems({type: "artists", time_range: "medium_term", limit: 10}),
                fetchUserTopItems({type: "tracks", time_range: "medium_term", limit: 10})
            ]
        ).then(
            ([userProfile, topArtists, topTracks ]) => {
                if (userProfile) {
                    const image = getProfileImage(userProfile);
                    setProfileImage(image ?? null);
                    if (image) {
                        localStorage.setItem("profileImage", image.src);
                    }
                }
                console.log('topTracks: ', topTracks);
                setTopArtists(topArtists.items);
                setTopTracks(topTracks.items);
            }
        ).catch((e) => {
                console.error("Error fetching profile and top artists:", e);
                setFailedFetch(true)
            }
        )
    }, [accessToken]);

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
                <select id="periods" name="periods" onChange={e => handlePeriodChange(e, "artists")}>
                    {periods.map((period) => {
                        return (
                            <option key={period.queryParam} value={period.queryParam}
                                    selected={period.default}>{period.label}</option>
                        )
                    })}
                </select>
                {topArtists && topArtists.map((artist, i) => {
                    return (
                        <div key={artist.id} className="card-item">
                            <p>{i + 1}: {artist.name}</p>
                            <img height="200px" width="200px" src={artist.images?.[0]?.url || fallbackImage}
                                 onError={(event) => {
                                     console.log("Image failed to load, using fallback");
                                     event.currentTarget.src = fallbackImage
                                 }} alt={artist.name}/>
                        </div>
                    )
                })}
            </div>
            <div className="card">
                <p className="read-the-docs">
                    Top Tracks:
                </p>
                <select id="periodsTracks" name="periodsTracks" onChange={e => handlePeriodChange(e, "tracks")}>
                    {periods.map((period) => {
                        return (
                            <option key={period.queryParam} value={period.queryParam}
                                    selected={period.default}>{period.label}</option>
                        )
                    })}
                </select>
            </div>
            <div className="card">
                {topTracks && topTracks.map((track, i) => {
                    return (
                        <div key={track.id} className="card-item">
                            <p>{i + 1}: {track.name}</p>
                            <img height="200px" width="200px" src={track.album?.images?.[0]?.url || fallbackImage}
                                 onError={(event) => {
                                     console.log("Image failed to load, using fallback");
                                     event.currentTarget.src = fallbackImage
                                 }} alt={track.name}/>
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

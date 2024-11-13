import './App.css'
import React, {useEffect, useState} from "react";
import {
    fetchUserTopItems
} from "./apis/spotify";
import {FetchUserTopItemsParams, SpotifyItem} from "./types";
import {AuthProvider} from "./components/auth";
import Stats from "./components/Pages/Stats";

function App() {
    const [topArtists, setTopArtists] = useState<SpotifyItem[] | null>(() => {
        const storedTopArtists = localStorage.getItem("topArtists");
        return storedTopArtists ? JSON.parse(storedTopArtists) : null;
    });
    const [topTracks, setTopTracks] = useState<SpotifyItem[] | null>(() => {
        const storedTopTracks = localStorage.getItem("topTracks");
        return storedTopTracks ? JSON.parse(storedTopTracks) : null;
    });

    const handlePeriodChange = async (event: React.ChangeEvent<HTMLSelectElement>, type: "artists" | "tracks") => {
        const period = event.target.value as FetchUserTopItemsParams["time_range"];
        const userTopItems = await fetchUserTopItems({type, time_range: period, limit: 10});
        if (userTopItems) {
            if (type === "artists") {
                setTopArtists(userTopItems);
            } else {
                setTopTracks(userTopItems);
            }
        }
    }

    useEffect(() => {
        if (topArtists && topTracks) {
            return;
        }
        Promise.all(
            [
                fetchUserTopItems({type: "artists", time_range: "medium_term", limit: 10}),
                fetchUserTopItems({type: "tracks", time_range: "medium_term", limit: 10})
            ]
        ).then(
            ([topArtists, topTracks]) => {
                setTopArtists(topArtists);
                localStorage.setItem("topArtists", JSON.stringify(topArtists));
                setTopTracks(topTracks);
                localStorage.setItem("topTracks", JSON.stringify(topTracks));
            }
        ).catch(e => {
                console.error("Error fetching top artists and tracks:", e);
            }
        )
    });

    // TODO add logout
    return (
        <AuthProvider>
            <h1>Spotify Stats</h1>
            <Stats topArtists={topArtists} topTracks={topTracks} onChange={handlePeriodChange}/>
        </AuthProvider>
    )
}

export default App

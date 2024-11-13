import {TopArtists} from "../../TopArtists";
import {TopTracks} from "../../TopTracks";
import React, {useEffect} from "react";
import {FetchUserTopItemsParams, SpotifyItem} from "../../../types";
import {useAuth} from "../../auth";

interface StatsProps {
    topArtists?: SpotifyItem[] | null;
    topTracks?: SpotifyItem[] | null;
    onChange: OnChange;
}

type OnChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    type: FetchUserTopItemsParams["type"]
) => Promise<void>;

const periods = [{queryParam: "short_term", label: "Very Recent"}, {
    queryParam: "medium_term",
    label: "Recent",
    default: true
}, {queryParam: "long_term", label: "Long Term"}];

export default function Stats({ topArtists, topTracks, onChange}: StatsProps) {
    const { isAuthenticated, login, userProfile } = useAuth();
    console.log(userProfile?.images);
    const profileImage = userProfile?.images[0]

    useEffect(() => {
        if (!isAuthenticated) {
            login();
        }
    }, [isAuthenticated, login]);

    return (
        <>
            <h2>Hello {userProfile?.display_name}</h2>
            <div className="card">
                {profileImage && <img src={profileImage.src} alt="Profile pic"/>}
            </div>
            <div className="card">
                <p className="read-the-docs">
                    Top Artists - Time period:
                </p>
                <select id="periodsArtists" name="periodsArtists" onChange={e => onChange(e, "artists")}>
                    {periods.map((period) => {
                        return (
                            <option key={period.queryParam} value={period.queryParam}
                                    selected={period.default}>{period.label}</option>
                        )
                    })}
                </select>
                {topArtists && <TopArtists items={topArtists}/>}
            </div>
            <div className="card">
                <p className="read-the-docs">
                    Top Tracks:
                </p>
                <select id="periodsTracks" name="periodsTracks" onChange={e => onChange(e, "tracks")}>
                    {periods.map((period) => {
                        return (
                            <option key={period.queryParam} value={period.queryParam}
                                    selected={period.default}>{period.label}</option>
                        )
                    })}
                </select>
            </div>
            <div className="card">
                {topTracks && <TopTracks items={topTracks}/>}
            </div>
        </>
    )
}
import {SpotifyItem} from "../../types";
import {fallbackImage} from "../../constants.ts";

interface TopTracksCardProps {
    spotifyItem: SpotifyItem;
    number: number;
}

const TopTracksCard = ({spotifyItem, number}: TopTracksCardProps) => {
    const {album, artists, images, name, popularity} = spotifyItem;
    const formattedArtists = artists?.map((artist) => artist.name).join(", ");

    return (
        <div className="event-card">
                <img width="100px" height="100px" src={ images?.[0]?.url || album?.images?.[0]?.url || fallbackImage} alt={name}
                     onError={(event) => {
                         event.currentTarget.src = fallbackImage;
                     }}
                />
            <div className="event-details">
                <div>
                    <div className="event-title">{number}</div>
                    <div className="event-artists">{name}</div>
                </div>
                <div className="event-info">
                    <div className="event-location">
                        <span className="location-icon">📍</span> {formattedArtists}
                    </div>
                    <div className="attendees-count">
                        <span className="attendees-icon">📈</span> {popularity}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const TopTracks = ({ items }: { items: SpotifyItem[] | null }) => {
    if (items) {
        return (
            <div className="event-list">
                {items.map((item, i) => (
                    <TopTracksCard key={i} spotifyItem={item} number={i + 1}/>
                ))}
            </div>
        );
    } else return
};
export interface SpotifyUserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean,
        filter_locked: boolean
    },
    external_urls: { spotify: string; };
    followers: { href: string; total: number; };
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}

export interface FetchUserTopItemsParams {
    type: "artists" | "tracks";
    time_range?: "long_term" | "medium_term" | "short_term";
    limit?: number;
};

export interface SpotifyTopArtistsTracksResponse {
    items: SpotifyItem[];
    total: number;
    limit: number;
    offset: number;
    href: string;
    previous: string | null;
    next: string | null;
}

export interface SpotifyItem {
    id: string;
    name: string;
    type: string; // 'artist' or 'track'
    popularity: number;
    href: string;
    external_urls: {
        spotify: string;
    };
    images?: SpotifyImage[];
    // For tracks only
    album?: SpotifyAlbum;
    artists?: SpotifyArtist[];
    duration_ms?: number;
    explicit?: boolean;
    // For artists only
    genres?: string[];
}

export interface SpotifyAlbum {
    id: string;
    name: string;
    release_date: string;
    total_tracks: number;
    images: SpotifyImage[];
}

export interface SpotifyArtist {
    id: string;
    name: string;
    href: string;
    external_urls: {
        spotify: string;
    };
}

export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
}

interface SpotifyTopArtistsTracksResponse {
    items: SpotifyItem[];
}


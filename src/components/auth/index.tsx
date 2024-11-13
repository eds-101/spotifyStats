import React, {createContext, useContext, useEffect, useState} from 'react';
import {
    getAccessToken,
    redirectToAuthCodeFlow,
    fetchUserProfile,
    fetchProfile,
    refreshAccessToken
} from '../../apis/spotify';
import {SpotifyUserProfile} from "../../types";

interface AuthContextProps {
    accessToken: string | null;
    isAuthenticated: boolean;
    userProfile: SpotifyUserProfile | null;
    login: () => Promise<void>;
    logout: () => void;
    refreshToken: string | null;
}

type Props = {
    children?: React.ReactNode
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<Props> = ({children}) => {
        const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
        const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));
        const [userProfile, setUserProfile] = useState<SpotifyUserProfile | null>(null);

        const login = async () => {
            try {
                await redirectToAuthCodeFlow();
                // Check for auth code in the URL after redirection
                const authCode = new URLSearchParams(window.location.search).get("code");
                if (!authCode) {
                    throw new Error("Failed to retrieve auth code from URL. Please try again.");
                }
                const {access_token: accessToken, refresh_token: refreshToken} = await getAccessToken(authCode);
                if (!accessToken) {
                    alert()
                    throw new Error("Failed to retrieve access token. Please try again.");
                }

                // Set tokens and store in localStorage
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                const profile = await fetchUserProfile();
                if (!profile) {
                    throw new Error("Failed to retrieve user profile. Please try again.");
                }
                setUserProfile(profile);
                localStorage.setItem('profile', JSON.stringify(profile));

            } catch (e) {
                console.error("An error occurred during login:", e);
            }
        };

        const logout = () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('profile');
            setAccessToken(null);
            setRefreshToken(null);
            setUserProfile(null);
        };

        const checkAuth = async () => {
            try {
                // Attempt to fetch profile to verify the access token
                await fetchProfile();
                return true;
            } catch (e) {
                // @ts-expect-error unauthorized error
                if (e.message === "Unauthorized" && refreshToken) {
                    try {
                        const {
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken
                        } = await refreshAccessToken(refreshToken);

                        if (newAccessToken) {
                            setAccessToken(newAccessToken);
                            setRefreshToken(newRefreshToken);
                            localStorage.setItem("accessToken", newAccessToken);
                            localStorage.setItem("refreshToken", newRefreshToken);
                            return true;
                        }
                    } catch (refreshError) {
                        console.error("Failed to refresh token:", refreshError);
                        logout();
                    }
                } else {
                    console.error("Unexpected error during authentication check:", e);
                    logout();
                }
                return false;
            }
        };

        useEffect(() => {
            if (!accessToken) {
                login();
            } else {
                checkAuth();
            }
        }, [accessToken]);

        return (
            <AuthContext.Provider
                value={{accessToken, isAuthenticated: !!accessToken, refreshToken, userProfile, login, logout}}>
                {children}
            </AuthContext.Provider>
        );
    }
;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

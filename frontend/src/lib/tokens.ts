// Single source of truth for auth token storage. Keeping the localStorage keys
// in one place avoids the magic strings that were scattered across the app.
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const getAccessToken = () => localStorage.getItem(ACCESS_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const setAccessToken = (accessToken: string) => {
  localStorage.setItem(ACCESS_KEY, accessToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

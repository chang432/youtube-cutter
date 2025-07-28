export default class JwtStorageHelper {
    constructor(key = "jwt_token") {
        this.key = key;
    }

    // Store token in localStorage
    setToken(token) {
        localStorage.setItem(this.key, token);
    }

    // Get token (or null if expired or not present)
    getToken() {
        const token = localStorage.getItem(this.key);
        if (!token) return null;

        const payload = this._decodePayload(token);
        console.log("Payload: " + payload);
        if (!payload || !payload.exp) {
            // Invalid JWT structure
            console.log("Invalid JWT structure, removing token");
            this.removeToken();
            return null;
        }

        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        console.log("Current time: " + now);
        console.log("Token expiration: " + payload.exp);
        const secondsLeft = payload.exp - now;
        const daysLeft = secondsLeft / (60 * 60 * 24);
        console.log(`Token expires in ${daysLeft.toFixed(2)} days`);
        
        if (now > payload.exp) {
            // Token expired
            console.log("Token expired, removing token");
            this.removeToken();
            return null;
        }

        return token; // Token is valid
    }

    // Remove token
    removeToken() {
        localStorage.removeItem(this.key);
    }

    // Helper: Decode JWT payload
    _decodePayload(token) {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }
}

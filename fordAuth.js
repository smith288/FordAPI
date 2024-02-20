const fs = require("fs");
const path = require("path");
const qs = require('qs');
const formData = require("form-data");
const axios = require("axios");

// use dotenv to load environment variables from a .env file
require('dotenv').config();

const FordUrls = require("./fordUrls");

class FordAuth {
    static accessToken = null;

    constructor() {
        this.refreshToken = this.loadRefreshToken();
        this.clientId = process.env.FORD_CLIENT_ID;
        this.clientSecret = process.env.FORD_CLIENT_SECRET;
        this.code = process.env.FORD_JWS_CODE;
        this.expiresOn = 0;
    }

    async authenticate() {
        // Check if access token is expired or not set
        if (!this.refreshToken || !this.accessToken || this.isTokenExpired()) {
            console.log("Need to get a new token");
            await this.refreshTokenFromFord();
        }
        FordAuth.accessToken = this.accessToken;
    }

    isTokenExpired() {
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= new Date(this, this.expiresOn * 1000);
    }

    async getTokenFromFord() {
        let data = qs.stringify({
            'grant_type': 'authorization_code',
            'client_id': this.clientId,
            'client_secret': this.clientSecret,
            'code': this.code,
            'redirect_uri': 'https%3A%2F%2Flocalhost%3A3000'
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: FordUrls.AUTH_URL,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        const response = axios.request(config)

        if (response.status === 200) {
            const data = response.data;
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.expiresOn = data.expires_On;

            // Save the refreshToken to a file
            this.saveRefreshToken(this.refreshToken);
        }

    }

    async refreshTokenFromFord() {
        // Make API call to refresh the token
        try {
            let data = new FormData();
            data.append('grant_type', 'refresh_token');
            data.append('refresh_token', this.refreshToken);
            data.append('client_id', this.clientId);
            data.append('client_secret', this.clientSecret);

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: FordUrls.AUTH_URL,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                data: data
            };

            const response = await axios.request(config)
                .catch((error) => {
                    console.log(error);
                });

            if (response.status === 200) {
                const data = response.data;
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;
                this.expiresOn = data.expires_on;

                // Save the refreshToken to a file
                this.saveRefreshToken(this.refreshToken);
            } else {
                throw new Error("Failed to refresh token");
            }
        } catch (error) {
            throw new Error("Failed to refresh token: " + error.message);
        }
    }

    loadRefreshToken() {
        const filePath = path.join(__dirname, "refreshToken.txt");
        try {
            return fs.readFileSync(filePath, "utf8");
        } catch (error) {
            return null;
        }
    }

    saveRefreshToken(refreshToken) {
        const filePath = path.join(__dirname, "refreshToken.txt");
        fs.writeFileSync(filePath, refreshToken, "utf8");
    }
}

module.exports = FordAuth;
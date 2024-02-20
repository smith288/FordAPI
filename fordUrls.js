class FordUrls {
    static AUTH_URL = "https://dah2vb2cprod.b2clogin.com/914d88b1-3523-4bf6-9be4-1b96b4f6f919/oauth2/v2.0/token?p=B2C_1A_signup_signin_common";
    static BASE_URL = "https://api.mps.ford.com";
    static LIST_VEHICLES_URL = "/api/fordconnect/v2/vehicles";
    static VEHICLE_INFO_V3_URL = "/api/fordconnect/v3/vehicles/{vehicleId}"
    static VEHICLE_STATUS_REQ_URL = "/api/fordconnect/v1/vehicles/{{vehicleId}}/status";
    static VEHICLE_STATUS_URL = "/api/fordconnect/v1/vehicles/{vehicleId}/statusrefresh/{statuscommandId}";
}

module.exports = FordUrls;
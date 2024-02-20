const axios = require('axios');
const fordUrls = require('./fordUrls');
const FordAuth = require('./fordAuth');

class FordResources {
    static lastUpdate = null;
    constructor() {

    }

    async getVehicleList() {

        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: fordUrls.BASE_URL + fordUrls.LIST_VEHICLES_URL,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Application-Id': 'AFDC085B-377A-4351-B23E-5E1D35FB3700',
                    'Authorization': 'Bearer ' + FordAuth.accessToken
                }
            };
            const response = await axios.request(config);
            if (response.status !== 200 || (response.status === 200 && response.data.status !== "SUCCESS")) {
                throw new Error('Error retrieving vehicle list:', response.status);
            }
            var respBody = response.data.vehicles;
            return respBody;
        } catch (error) {
            console.error('Error retrieving vehicle list:', error);
            return [];
        }
    }

    async getVehicleDetails(vehicleId) {
        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: fordUrls.BASE_URL + fordUrls.VEHICLE_INFO_V3_URL.replace('{vehicleId}', vehicleId),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Application-Id': 'AFDC085B-377A-4351-B23E-5E1D35FB3700',
                    'Authorization': 'Bearer ' + FordAuth.accessToken
                }
            };
            const response = await axios.request(config);
            if (response.status !== 200 || (response.status === 200 && response.data.status !== "SUCCESS")) {
                throw new Error('Error retrieving vehicle details:', response.status);
            }
            var respBody = response.data;
            return respBody;
        } catch (error) {
            console.error('Error retrieving vehicle details:', error);
            return {};
        }
    }

    async getVehicleStatus(vehicleId) {
        try {
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: fordUrls.BASE_URL + fordUrls.VEHICLE_STATUS_REQ_URL.replace('{{vehicleId}}', vehicleId),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Application-Id': 'AFDC085B-377A-4351-B23E-5E1D35FB3700',
                    'Authorization': 'Bearer ' + FordAuth.accessToken
                }
            };
            var response = await axios.request(config);
            if (response.status !== 202 || (response.status === 202 && response.data.status !== "SUCCESS")) {
                if (response.status == 429) {
                    console.log('Too many requests, waiting 60 seconds');
                    await new Promise(r => setTimeout(r, 60000));
                    return this.getVehicleStatus(vehicleId);
                } else {
                    throw new Error('Error requesting vehicle status update:', response.status);
                }
            }
            var tries = 0;
            if (response.data.commandStatus === "INPROGRESS") {

                config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: fordUrls.BASE_URL + fordUrls.VEHICLE_STATUS_URL.replace('{vehicleId}', vehicleId).replace('{statuscommandId}', response.data.commandId),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Application-Id': 'AFDC085B-377A-4351-B23E-5E1D35FB3700',
                        'Authorization': 'Bearer ' + FordAuth.accessToken
                    }
                };

                response = await axios.request(config);

                while (response.data.commandStatus !== "COMPLETED" && tries < 60) {
                    tries++;
                    await new Promise(r => setTimeout(r, 5000));
                    response = await axios.request(config);
                    if (response.status === 202 && response.data.commandStatus === "COMPLETED") {
                        return response.data;
                    }
                }
                return {};
            }
        } catch (error) {
            console.error('Error requesting vehicle status update:', error);
            return {};
        }
    }

}

module.exports = FordResources;
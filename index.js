const fordAuth = require('./fordAuth');
const fordResources = require('./fordResources');

const resources = new fordResources();

// Authenticate
const authenticate = () => {
    const auth = new fordAuth();
    return auth.authenticate();
};

// Get vehicle list
const getVehicleList = () => {
    return resources.getVehicleList();
};

// Select the first vehicle
const selectFirstVehicle = (vehicles) => {
    if (vehicles.length > 0) {
        const firstVehicle = vehicles[0];
        const vehicleId = firstVehicle.vehicleId;
        // Your logic for selecting the first vehicle here
        // Now set a global static for vehicleId so we can use it from here on out
        global.vehicleId = vehicleId;
        console.log('Selected vehicle:', vehicleId);

    } else {
        console.log('No vehicles found');
    }
};

// Entry point
const main = async() => {
    try {
        console.log('Running...')
        await authenticate();
        if (process.env.FORD_VEHICLE_ID) {
            global.vehicleId = process.env.FORD_VEHICLE_ID;
            console.log('Selected vehicle:', global.vehicleId);
        } else {
            const vehicles = await getVehicleList();
            selectFirstVehicle(vehicles);
        }

        // Call the vehicle status endpoint
        const vehicleStatus = await resources.getVehicleStatus(global.vehicleId);

        if (vehicleStatus.commandStatus === 'COMPLETED') {
            const vehicleDetails = await resources.getVehicleDetails(global.vehicleId);
            console.log('Vehicle details:', JSON.stringify(vehicleDetails, null, 4));
        }

        setInterval(main, 120000);

    } catch (error) {
        console.error('Error:', error);
    }
};

main();
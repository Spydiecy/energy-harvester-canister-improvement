import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define the types for the energy records and the energy harvester
type EnergyRecord = Record<{
    id: string;
    source: string; // Source of energy (e.g., solar, wind, kinetic)
    powerGenerated: number; // Amount of power generated in watts
    timestamp: nat64; // Time when the energy was harvested
}>;

type EnergyHarvester = Record<{
    id: string;
    name: string;
    location: string; // Location of the energy harvesting device
    energyRecords: Vec<EnergyRecord>; // Store energy harvesting records
}>;

// Define the payload type for adding energy harvesting records
type EnergyPayload = Record<{
    name: string;
    location: string;
    energyRecords: Vec<EnergyRecord>;
}>;

// Initialize storage for energy harvesters
const energyHarvesterStorage = new StableBTreeMap<string, EnergyHarvester>(0, 44, 1024);

// Function to add a new energy harvester device to the system
$update;
export function addEnergyHarvester(payload: EnergyPayload): Result<EnergyHarvester, string> {
    // Validate inputs and handle incomplete or invalid data
    if (!payload.name || !payload.location || payload.energyRecords.length === 0) {
        return Result.Err<EnergyHarvester, string>('Missing required fields in the energy harvester object');
    }

    // Generate a unique ID for the energy harvester
    const harvesterId = uuidv4();
    const newHarvester: EnergyHarvester = {
        id: harvesterId,
        name: payload.name,
        location: payload.location,
        energyRecords: payload.energyRecords
    };

    // Add the energy harvester to storage
    energyHarvesterStorage.insert(newHarvester.id, newHarvester);

    return Result.Ok(newHarvester);
}

// Function to retrieve all energy harvesters from the system
$update;
export function getEnergyHarvesters(): Result<Vec<EnergyHarvester>, string> {
    // Retrieve all energy harvesters from storage
    const harvesters = energyHarvesterStorage.values();
    return Result.Ok(harvesters);
}

// Function to retrieve a specific energy harvester by ID
$update;
export function getEnergyHarvester(id: string): Result<EnergyHarvester, string> {
    // Validate ID
    if (!id) {
        return Result.Err<EnergyHarvester, string>('Invalid ID for getting an energy harvester.');
    }

    // Retrieve a specific energy harvester by ID
    return match(energyHarvesterStorage.get(id), {
        Some: (harvester) => Result.Ok<EnergyHarvester, string>(harvester),
        None: () => Result.Err<EnergyHarvester, string>(`Energy harvester with id=${id} not found`),
    });
}

// Function to update information for a specific energy harvester
$update;
export function updateEnergyHarvester(id: string, payload: EnergyPayload): Result<EnergyHarvester, string> {
    // Validate ID
    if (!id) {
        return Result.Err<EnergyHarvester, string>('Invalid ID for updating an energy harvester.');
    }

    // Validate the updated energy harvester object
    if (!payload.name || !payload.location || payload.energyRecords.length === 0) {
        return Result.Err<EnergyHarvester, string>('Missing required fields in the energy harvester object');
    }

    // Update a specific energy harvester by ID
    return match(energyHarvesterStorage.get(id), {
        Some: (existingHarvester) => {
            // Create a new energy harvester object with the updated fields
            const updatedHarvester: EnergyHarvester = {
                ...existingHarvester,
                name: payload.name,
                location: payload.location,
                energyRecords: payload.energyRecords
            };

            // Update the energy harvester in storage
            energyHarvesterStorage.insert(id, updatedHarvester);

            return Result.Ok<EnergyHarvester, string>(updatedHarvester);
        },
        None: () => Result.Err<EnergyHarvester, string>(`Energy harvester with id=${id} does not exist`),
    });
}

// Function to search for energy harvesters based on a query
$query;
export function searchEnergyHarvesters(query: string): Result<Vec<EnergyHarvester>, string> {
    // Convert the query to lowercase for case-insensitive search
    const lowerCaseQuery = query.toLowerCase();
    // Filter the harvesters based on the query
    const filteredHarvesters = energyHarvesterStorage.values().filter(
        (harvester) =>
            harvester.name.toLowerCase().includes(lowerCaseQuery) ||
            harvester.location.toLowerCase().includes(lowerCaseQuery) ||
            harvester.energyRecords.some(record => record.source.toLowerCase().includes(lowerCaseQuery))
    );
    return Result.Ok(filteredHarvesters);
}

// Function to delete a specific energy harvester by ID
$update;
export function deleteEnergyHarvester(id: string): Result<EnergyHarvester, string> {
    // Validate ID
    if (!id) {
        return Result.Err<EnergyHarvester, string>('Invalid ID for deleting an energy harvester.');
    }

    // Remove the energy harvester from storage
    return match(energyHarvesterStorage.remove(id), {
        Some: (deletedHarvester) => Result.Ok<EnergyHarvester, string>(deletedHarvester),
        None: () => Result.Err<EnergyHarvester, string>(`Energy harvester with id=${id} does not exist`),
    });
}

// Function to retrieve energy records for a specific energy harvester by ID
$update;
export function getEnergyRecords(id: string): Result<Vec<EnergyRecord>, string> {
    // Validate ID
    if (!id) {
        return Result.Err<Vec<EnergyRecord>, string>('Invalid ID for retrieving energy records.');
    }

    // Retrieve energy records for the specified energy harvester
    return match(energyHarvesterStorage.get(id), {
        Some: (harvester) => Result.Ok<Vec<EnergyRecord>, string>(harvester.energyRecords),
        None: () => Result.Err<Vec<EnergyRecord>, string>(`Energy harvester with id=${id} not found`),
    });
}

// Function to retrieve the total power generated by all energy harvesters
$update;
export function getTotalPowerGenerated(): Result<number, string> {
    // Calculate the total power generated by summing the power from all energy records
    let totalPower = 0;
    energyHarvesterStorage.values().forEach((harvester) => {
        harvester.energyRecords.forEach((record) => {
            totalPower += record.powerGenerated;
        });
    });
    return Result.Ok(totalPower);
}

// Function to retrieve the average power generated by all energy harvesters
$update;
export function getAveragePowerGenerated(): Result<number, string> {
    // Calculate the average power generated by averaging the power from all energy records
    let totalPower = 0;
    let totalRecords = 0;
    energyHarvesterStorage.values().forEach((harvester) => {
        harvester.energyRecords.forEach((record) => {
            totalPower += record.powerGenerated;
            totalRecords++;
        });
    });
    if (totalRecords === 0) {
        return Result.Ok(0);
    }
    const averagePower = totalPower / totalRecords;
    return Result.Ok(averagePower);
}

// Workaround to make uuid package work with Azle
globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};

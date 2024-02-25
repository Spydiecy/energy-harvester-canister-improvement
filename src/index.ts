import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

// Define a type for energy harvesting records
type EnergyRecord = Record<{
    id: string;
    source: string; // Source of energy (e.g., solar, wind, kinetic)
    powerGenerated: number; // Amount of power generated in watts
    timestamp: nat64; // Time when the energy was harvested
}>;

// EnergyHarvester Variables
type EnergyHarvester = Record<{
    id: string;
    name: string;
    location: string; // Location of the energy harvesting device
    energyRecords: Vec<EnergyRecord>; // Store energy harvesting records
}>;

// Payload type for adding energy harvesting records
type EnergyPayload = Record<{
    name: string;
    location: string;
    energyRecords: Vec<EnergyRecord>;
}>;

// Initialize storage for energy harvesters
const energyHarvesterStorage = new StableBTreeMap<string, EnergyHarvester>(0, 44, 1024);

/**
 * Adds a new energy harvester device to the system.
 * @param payload - Information about the energy harvester.
 * @returns A Result containing the new energy harvester or an error message.
 */
$update;
export function addEnergyHarvester(payload: EnergyPayload): Result<EnergyHarvester, string> {
    // Validate inputs and handle incomplete or invalid data
    if (!payload.name || !payload.location || payload.energyRecords.length === 0) {
        return Result.Err<EnergyHarvester, string>('Missing required fields in the energy harvester object');
    }

    try {
        // Generate a unique ID for the energy harvester
        const harvesterId = ic.time().toString(); // Using timestamp as ID for simplicity
        const newHarvester: EnergyHarvester = {
            id: harvesterId,
            name: payload.name,
            location: payload.location,
            energyRecords: payload.energyRecords
        };

        // Add the energy harvester to storage
        energyHarvesterStorage.insert(newHarvester.id, newHarvester);

        return Result.Ok(newHarvester);
    } catch (error) {
        return Result.Err<EnergyHarvester, string>(`Error adding energy harvester: ${error}`);
    }
}

/**
 * Retrieves all energy harvesters from the system.
 * @returns A Result containing a list of energy harvesters or an error message.
 */
$update;
export function getEnergyHarvesters(): Result<Vec<EnergyHarvester>, string> {
    try {
        // Retrieve all energy harvesters from storage
        const harvesters = energyHarvesterStorage.values();
        return Result.Ok(harvesters);
    } catch (error) {
        return Result.Err(`Error getting energy harvesters: ${error}`);
    }
}

/**
 * Retrieves a specific energy harvester by ID.
 * @param id - The ID of the energy harvester to retrieve.
 * @returns A Result containing the energy harvester or an error message.
 */
$update;
export function getEnergyHarvester(id: string): Result<EnergyHarvester, string> {
    // Validate ID
    if (!id) {
        return Result.Err<EnergyHarvester, string>('Invalid ID for getting an energy harvester.');
    }

    try {
        // Retrieve a specific energy harvester by ID
        return match(energyHarvesterStorage.get(id), {
            Some: (harvester) => Result.Ok<EnergyHarvester, string>(harvester),
            None: () => Result.Err<EnergyHarvester, string>(`Energy harvester with id=${id} not found`),
        });
    } catch (error) {
        return Result.Err<EnergyHarvester, string>(`Error retrieving energy harvester by ID: ${error}`);
    }
}

// More functions for updating, deleting, and searching energy harvesters can be added similarly

// Function for validating UUIDs (unchanged)
export function isValidUUID(id: string): boolean {
    return /^[\da-f]{8}-([\da-f]{4}-){3}[\da-f]{12}$/i.test(id);
}

/**
 * Updates information for a specific energy harvester.
 * @param id - The ID of the energy harvester to update.
 * @param payload - Updated information about the energy harvester.
 * @returns A Result containing the updated energy harvester or an error message.
 */
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

    try {
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
    } catch (error) {
        return Result.Err<EnergyHarvester, string>(`Error updating energy harvester: ${error}`);
    }
}

/**
 * Searches for energy harvesters based on a query.
 * @param query - The search query.
 * @returns A Result containing a list of matched energy harvesters or an error message.
 */
$query;
export function searchEnergyHarvesters(query: string): Result<Vec<EnergyHarvester>, string> {
    try {
        // Search for energy harvesters based on the query
        const lowerCaseQuery = query.toLowerCase();
        const filteredHarvesters = energyHarvesterStorage.values().filter(
            (harvester) =>
                harvester.name.toLowerCase().includes(lowerCaseQuery) ||
                harvester.location.toLowerCase().includes(lowerCaseQuery)
        );
        return Result.Ok(filteredHarvesters);
    } catch (error) {
        return Result.Err(`Error searching for energy harvesters: ${error}`);
    }
}

/**
 * Deletes a specific energy harvester by ID.
 * @param id - The ID of the energy harvester to delete.
 * @returns A Result containing the deleted energy harvester or an error message.
 */
$update;
export function deleteEnergyHarvester(id: string): Result<EnergyHarvester, string> {
    // Validate ID
    if (!id) {
        return Result.Err<EnergyHarvester, string>('Invalid ID for deleting an energy harvester.');
    }

    try {
        // Remove the energy harvester from storage
        return match(energyHarvesterStorage.remove(id), {
            Some: (deletedHarvester) => Result.Ok<EnergyHarvester, string>(deletedHarvester),
            None: () => Result.Err<EnergyHarvester, string>(`Energy harvester with id=${id} does not exist`),
        });
    } catch (error) {
        return Result.Err<EnergyHarvester, string>(`Error deleting energy harvester: ${error}`);
    }
}

/**
 * Retrieves energy records for a specific energy harvester by ID.
 * @param id - The ID of the energy harvester.
 * @returns A Result containing the energy records of the specified harvester or an error message.
 */
$update;
export function getEnergyRecords(id: string): Result<Vec<EnergyRecord>, string> {
    // Validate ID
    if (!id) {
        return Result.Err<Vec<EnergyRecord>, string>('Invalid ID for retrieving energy records.');
    }

    try {
        // Retrieve energy records for the specified energy harvester
        return match(energyHarvesterStorage.get(id), {
            Some: (harvester) => Result.Ok<Vec<EnergyRecord>, string>(harvester.energyRecords),
            None: () => Result.Err<Vec<EnergyRecord>, string>(`Energy harvester with id=${id} not found`),
        });
    } catch (error) {
        return Result.Err<Vec<EnergyRecord>, string>(`Error retrieving energy records: ${error}`);
    }
}

/**
 * Retrieves the total power generated by all energy harvesters.
 * @returns A Result containing the total power generated or an error message.
 */
$update;
export function getTotalPowerGenerated(): Result<number, string> {
    try {
        // Calculate the total power generated by summing the power from all energy records
        let totalPower = 0;
        energyHarvesterStorage.values().forEach((harvester) => {
            harvester.energyRecords.forEach((record) => {
                totalPower += record.powerGenerated;
            });
        });
        return Result.Ok(totalPower);
    } catch (error) {
        return Result.Err(`Error retrieving total power generated: ${error}`);
    }
}

/**
 * Retrieves the average power generated by all energy harvesters.
 * @returns A Result containing the average power generated or an error message.
 */
$update;
export function getAveragePowerGenerated(): Result<number, string> {
    try {
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
            return Result.Err('No energy records found');
        }
        const averagePower = totalPower / totalRecords;
        return Result.Ok(averagePower);
    } catch (error) {
        return Result.Err(`Error retrieving average power generated: ${error}`);
    }
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
     // @ts-ignore
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};
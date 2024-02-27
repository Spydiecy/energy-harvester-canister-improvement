import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type EnergyRecord = Record<{
    id: string;
    source: string;
    powerGenerated: number;
    timestamp: nat64;
}>;

type EnergyHarvester = Record<{
    id: string;
    name: string;
    location: string;
    energyRecords: Vec<EnergyRecord>;
}>;

type EnergyPayload = Record<{
    name: string;
    location: string;
    energyRecords: Vec<EnergyRecord>;
}>;

const energyHarvesterStorage = new StableBTreeMap<string, EnergyHarvester>(0, 44, 1024);

$update;
export function addEnergyHarvester(payload: EnergyPayload): Result<EnergyHarvester, string> {
    if (!payload.name || !payload.location || payload.energyRecords.length === 0) {
        return Result.Err<EnergyHarvester, string>('Missing required fields in the energy harvester object');
    }

    const harvesterId = uuidv4();
    const newHarvester: EnergyHarvester = {
        id: harvesterId,
        name: payload.name,
        location: payload.location,
        energyRecords: payload.energyRecords
    };

    energyHarvesterStorage.insert(newHarvester.id, newHarvester);

    return Result.Ok(newHarvester);
}

$update;
export function getEnergyHarvesters(): Result<Vec<EnergyHarvester>, string> {
    const harvesters = energyHarvesterStorage.values();
    return Result.Ok(harvesters);
}

$update;
export function getEnergyHarvester(id: string): Result<EnergyHarvester, string> {
    if (!id) {
        return Result.Err<EnergyHarvester, string>('Invalid ID for getting an energy harvester.');
    }

    return match(energyHarvesterStorage.get(id), {
        Some: (harvester) => Result.Ok<EnergyHarvester, string>(harvester),
        None: () => Result.Err<EnergyHarvester, string>(`Energy harvester with id=${id} not found`),
    });
}

$update;
export function updateEnergyHarvester(id: string, payload: EnergyPayload): Result<EnergyHarvester, string> {
    if (!id) {
        return Result.Err<EnergyHarvester, string>('Invalid ID for updating an energy harvester.');
    }

    if (!payload.name || !payload.location || payload.energyRecords.length === 0) {
        return Result.Err<EnergyHarvester, string>('Missing required fields in the energy harvester object');
    }

    return match(energyHarvesterStorage.get(id), {
        Some: (existingHarvester) => {
            const updatedHarvester: EnergyHarvester = {
                ...existingHarvester,
                name: payload.name,
                location: payload.location,
                energyRecords: payload.energyRecords
            };

            energyHarvesterStorage.insert(id, updatedHarvester);

            return Result.Ok<EnergyHarvester, string>(updatedHarvester);
        },
        None: () => Result.Err<EnergyHarvester, string>(`Energy harvester with id=${id} does not exist`),
    });
}

$query;
export function searchEnergyHarvesters(query: string): Result<Vec<EnergyHarvester>, string> {
    const lowerCaseQuery = query.toLowerCase();
    const filteredHarvesters = energyHarvesterStorage.values().filter(
        (harvester) =>
            harvester.name.toLowerCase().includes(lowerCaseQuery) ||
            harvester.location.toLowerCase().includes(lowerCaseQuery) ||
            harvester.energyRecords.some(record => record.source.toLowerCase().includes(lowerCaseQuery))
    );
    return Result.Ok(filteredHarvesters);
}

$update;
export function deleteEnergyHarvester(id: string): Result<EnergyHarvester, string> {
    if (!id) {
        return Result.Err<EnergyHarvester, string>('Invalid ID for deleting an energy harvester.');
    }

    return match(energyHarvesterStorage.remove(id), {
        Some: (deletedHarvester) => Result.Ok<EnergyHarvester, string>(deletedHarvester),
        None: () => Result.Err<EnergyHarvester, string>(`Energy harvester with id=${id} does not exist`),
    });
}

$update;
export function getEnergyRecords(id: string): Result<Vec<EnergyRecord>, string> {
    if (!id) {
        return Result.Err<Vec<EnergyRecord>, string>('Invalid ID for retrieving energy records.');
    }

    return match(energyHarvesterStorage.get(id), {
        Some: (harvester) => Result.Ok<Vec<EnergyRecord>, string>(harvester.energyRecords),
        None: () => Result.Err<Vec<EnergyRecord>, string>(`Energy harvester with id=${id} not found`),
    });
}

$update;
export function getTotalPowerGenerated(): Result<number, string> {
    let totalPower = 0;
    energyHarvesterStorage.values().forEach((harvester) => {
        harvester.energyRecords.forEach((record) => {
            totalPower += record.powerGenerated;
        });
    });
    return Result.Ok(totalPower);
}

$update;
export function getAveragePowerGenerated(): Result<number, string> {
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

globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32);

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }

        return array;
    }
};

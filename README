Energy Harvester Management System Documentation

### Overview

The Energy Harvester Management System is a TypeScript module designed to facilitate the management of energy harvesting devices. It allows users to add, retrieve, update, and search for energy harvesters, as well as manage energy harvesting records associated with each harvester.

### Installation

To use the Energy Harvester Management System, follow these steps:

1. Ensure you have Node.js and npm installed on your system.
2. Install the `azle` package using npm:

   ```bash
   npm install azle
   ```

3. Install the `uuid` package for generating UUIDs:

   ```bash
   npm install uuid
   ```

4. Import the necessary components from the `azle` and `uuid` packages in your TypeScript code:

   ```typescript
   import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
   import { v4 as uuidv4 } from 'uuid';
   ```

### Usage

#### 1. Adding an Energy Harvester

To add a new energy harvester to the system, use the `addEnergyHarvester` function:

```typescript
addEnergyHarvester(payload: EnergyPayload): Result<EnergyHarvester, string>
```

- `payload`: An object containing information about the energy harvester, including its name, location, and energy records.

#### 2. Retrieving Energy Harvesters

To retrieve all energy harvesters from the system, use the `getEnergyHarvesters` function:

```typescript
getEnergyHarvesters(): Result<Vec<EnergyHarvester>, string>
```

This function returns a list of energy harvesters stored in the system.

#### 3. Retrieving a Specific Energy Harvester

To retrieve a specific energy harvester by its ID, use the `getEnergyHarvester` function:

```typescript
getEnergyHarvester(id: string): Result<EnergyHarvester, string>
```

- `id`: The ID of the energy harvester to retrieve.

#### 4. Updating an Energy Harvester

To update information for a specific energy harvester, use the `updateEnergyHarvester` function:

```typescript
updateEnergyHarvester(id: string, payload: EnergyPayload): Result<EnergyHarvester, string>
```

- `id`: The ID of the energy harvester to update.
- `payload`: An object containing updated information about the energy harvester, including its name, location, and energy records.

#### 5. Searching for Energy Harvesters

To search for energy harvesters based on a query, use the `searchEnergyHarvesters` function:

```typescript
searchEnergyHarvesters(query: string): Result<Vec<EnergyHarvester>, string>
```

- `query`: The search query to match against the names and locations of energy harvesters.

### Data Types

#### EnergyRecord

Represents a record of energy harvesting with the following fields:

- `id`: A unique identifier for the record.
- `source`: The source of energy (e.g., solar, wind, kinetic).
- `powerGenerated`: The amount of power generated in watts.
- `timestamp`: The time when the energy was harvested.

#### EnergyHarvester

Represents an energy harvester device with the following fields:

- `id`: A unique identifier for the energy harvester.
- `name`: The name of the energy harvester.
- `location`: The location of the energy harvesting device.
- `energyRecords`: A vector containing energy harvesting records associated with the harvester.

#### EnergyPayload

Represents the payload used for adding or updating an energy harvester, with the following fields:

- `name`: The name of the energy harvester.
- `location`: The location of the energy harvesting device.
- `energyRecords`: A vector containing energy harvesting records associated with the harvester.

### Error Handling

All functions return a `Result` type, which can either contain the desired result or an error message indicating the reason for failure.

### Dependencies

- `azle`: Provides data structures and utilities for efficient storage and manipulation.
- `uuid`: Generates universally unique identifiers (UUIDs) for energy harvester IDs.


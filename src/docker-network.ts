import { exec } from "child_process";
import util from "util";
import path from "path";

// Promisify exec for easier async/await usage
const execPromise = util.promisify(exec);

// async function createDockerNetwork(networkName: string) {
//   try {
//     console.log(`Creating Docker network: ${networkName}...`);
//     await execPromise(`docker network create ${networkName}`);
//     console.log(`Docker network ${networkName} created successfully.`);
//   } catch (error) {
//     console.error(`Error creating Docker network: ${error}`);
//     throw error;
//   }
// }

// export async function startDockerCompose(composeFilePath: string, enrUri?: string) {
//   try {
//     console.log("Starting Docker Compose...");

//     // Set the environment variable for ENR_URI if provided
//     const env = enrUri ? { ENR_URI: enrUri } : undefined;
//     const options = env ? { env: { ...process.env, ...env } } : undefined;

//     await execPromise(`docker-compose -f ${composeFilePath} up -d`, options);
//     console.log("Docker Compose started successfully.");
//   } catch (error) {
//     console.error("Error starting Docker Compose:", error);
//     throw error;
//   }
// }

// async function main() {
//   const networkName = "nwaku-net";
//   const composeFilePath = path.resolve(
//     __dirname,
//     "../path/to/docker-compose.yml"
//   );
//   const enrUri = "enr:-example-uri";

//   await createDockerNetwork(networkName);
//   await startDockerCompose(composeFilePath, enrUri);
// }

// main().catch((error) => console.error(error));

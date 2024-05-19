import { upAll, down } from "docker-compose";
import path from "path";
import axios from "axios";
import { exec } from "child_process";
import util from "util";

export const COMPOSE_FILE = path.resolve(__dirname, "..", "docker-compose.yml");
export const COMPOSE_FILE_2ND_NODE = path.resolve(
  __dirname,
  "..",
  "docker-compose.second.node.yml"
);

// async function startDockerCompose(compose_file: string, enrUri?: string) {
//   try {
//     console.log("Starting Docker Compose...");
//     // Set the environment variable for ENR_URI
//     process.env.ENR_URI = enrUri;
//     await upAll({ cwd: path.dirname(compose_file), log: true });
//     console.log("Docker Compose started successfully.");
//   } catch (error) {
//     console.error("Error starting Docker Compose:", error);
//     throw error;
//   }
// }

// async function stopDockerCompose(compose_file: string) {
//   try {
//     console.log("Stopping Docker Compose...");
//     await down({ cwd: path.dirname(compose_file), log: true });
//     console.log("Docker Compose stopped successfully.");
//   } catch (error) {
//     console.error("Error stopping Docker Compose:", error);
//     throw error;
//   }
// }

const execPromise = util.promisify(exec);

async function networkExists(networkName: string) {
  try {
    await execPromise(`docker network inspect ${networkName}`);
    return true;
  } catch (error) {
    return false;
  }
}

async function createDockerNetwork(
  networkName: string,
  subnet: string,
  gateway: string
) {
  const exists = await networkExists(networkName);
  if (exists) {
    console.log(
      `Docker network ${networkName} already exists. Skipping creation.`
    );
    return;
  }

  try {
    console.log(
      `Creating Docker network: ${networkName} with subnet ${subnet} and gateway ${gateway}...`
    );
    console.log("GOT HERE!!!!!!");
    await execPromise(
      `docker network create --driver bridge --subnet=${subnet} --gateway=${gateway} ${networkName}`
    );
    console.log(`Docker network ${networkName} created successfully.`);
  } catch (error) {
    console.error(`Error creating Docker network: ${error}`);
    throw error;
  }
}

async function waitForConnection(
  nodeAddress: string,
  timeout: number,
  interval: number
) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      const response = await axios.get("http://127.0.0.1:21161/admin/v1/peers");
      console.log(response.data);
      await delay(10000);
      const peers = response.data;

      if (response.data[0].multiaddr.includes(nodeAddress)) {
        console.log(`Node ${nodeAddress} is connected.`);
        return true;
      } else {
        console.log(`Node ${nodeAddress} is not connected yet.`);
      }
    } catch (error) {
      console.error("Error fetching peers: ", error);
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  console.log(
    `Failed to confirm connection of node ${nodeAddress} within the timeout period.`
  );
  return false;
}

async function startDockerCompose(composeFilePath: string, enrUri?: string) {
  try {
    console.log("Starting Docker Compose...");

    // Set the environment variable for ENR_URI if provided
    const env = enrUri ? { ENR_URI: enrUri } : undefined;
    const options = env ? { env: { ...process.env, ...env } } : undefined;

    await execPromise(`docker-compose -f ${composeFilePath} up -d`, options);
    console.log("Docker Compose started successfully.");
  } catch (error) {
    console.error("Error starting Docker Compose:", error);
    throw error;
  }
}

async function stopDockerCompose(composeFilePath: string) {
  try {
    console.log("Stopping Docker Compose...");
    await down({ cwd: path.dirname(composeFilePath), log: true });
    console.log("Docker Compose stopped successfully.");
  } catch (error) {
    console.error("Error stopping Docker Compose:", error);
  }
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// rename function
async function performGetRequestWithRetry(
  url: string,
  retries: number,
  delayMs: number
) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      console.log("GET request response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`);
      if (i < retries - 1) {
        await delay(delayMs);
      } else {
        throw error;
      }
    }
  }
}

//change function name
async function performGetRequest() {
  return performGetRequestWithRetry(
    "http://0.0.0.0:21161/debug/v1/info",
    5,
    2000
  );
}

// return response.data and verify in test
async function subscribeToTopic(port: string) {
  const url = `http://127.0.0.1:${port}/relay/v1/auto/subscriptions`;
  const data = ["/my-app/2/chatroom-1/proto"];

  try {
    const response = await axios.post(url, data, {
      headers: {
        accept: "text/plain",
        "content-type": "application/json",
      },
    });
    console.log("Subscription successful:", response.data);
    // console.log("=========================");
    // console.log(response);
    // console.log("=========================");
  } catch (error) {
    console.error("Error subscribing to topic");
  }
}

// pararm for message details?
// return response.data and verify in test
async function publishMessage() {
  const url = "http://127.0.0.1:21161/relay/v1/auto/messages";
  const data = {
    payload: "UmVsYXkgd29ya3MhIQ==",
    contentTopic: "/my-app/2/chatroom-1/proto",
    timestamp: 0,
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        "content-type": "application/json",
      },
    });
    console.log("Message published successfully:", response.data);
    // console.log("==============================");
    // console.log(response);
    // console.log("==============================");
  } catch (error) {
    console.error("Error publishing message");
  }
}

async function verifyMessage(port: string, retries: number, delayMs: number) {
  const url = `http://0.0.0.0:${port}/relay/v1/auto/messages/%2Fmy-app%2F2%2Fchatroom-1%2Fproto`;
  console.log("got here!!!!");

  for (let i = 0; i < retries; i++) {
    try {
      console.log("Attempting to retrieve messages...");
      const response = await axios.get(url, {
        headers: {
          accept: "application/json",
        },
      });
      console.log("Retrieved messages:", response.data);

      // Assuming the response is an array of messages
      const messages = response.data;
      const messageFound = messages.some(
        (msg: any) => msg.payload === "UmVsYXkgd29ya3MhIQ=="
      );
      if (messageFound) {
        console.log("Message successfully verified.");
        return true;
      } else {
        console.log("Message not found.");
      }
    } catch (error) {
      console.error(`Error retrieving messages, attempt ${i + 1}:`);
    }

    if (i < retries - 1) {
      await delay(delayMs);
    }
  }
  console.log("Failed to verify message after multiple attempts.");
  return false;
}

export {
  startDockerCompose,
  stopDockerCompose,
  performGetRequest,
  subscribeToTopic,
  publishMessage,
  delay,
  verifyMessage,
  createDockerNetwork,
  waitForConnection,
};

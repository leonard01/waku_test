import axios from "axios"; //delete?
import {
  startDockerCompose,
  stopDockerCompose,
  performGetRequest,
  subscribeToTopic,
  publishMessage,
  delay,
  verifyMessage,
  COMPOSE_FILE,
  COMPOSE_FILE_2ND_NODE,
  createDockerNetwork,
  waitForConnection,
} from "../src/index";

let enrUri: string;
const networkName: string = "waku";
const subnet: string = "172.20.0.0/16";
const gateway: string = "172.20.0.1";
const node2Address: string = "172.20.111.227";
const NODEPORT1: string = "21161";
const NODEPORT2: string = "31161";
// change description
describe("Integration Test", () => {
  jest.setTimeout(120000000); // Increase timeout for Docker operations and retries //chnage back!!!

  beforeAll(async () => {
    await createDockerNetwork(networkName, subnet, gateway);
    await startDockerCompose(COMPOSE_FILE);
  });

  afterAll(async () => {
    await stopDockerCompose(COMPOSE_FILE);
  });

  // if this test fails then fail all subsequent tests
  it("should perform GET request to /debug/v1/info and verify partial response", async () => {
    const expectedResponse = "enr:-Kq4";
    const response = await performGetRequest();
    expect(response.enrUri).toContain(expectedResponse);
    expect(response).toBeInstanceOf(Object);
    enrUri = response.enrUri;
  });

  it("should subscribe to a topic, publish a message and verify the message", async () => {
    await subscribeToTopic(NODEPORT1);
    await publishMessage();
    expect(await verifyMessage(NODEPORT1, 5, 5)).toBe(true);
  });
});

// change description
describe.only("Integration Test Second Node", () => {
  jest.setTimeout(12000000); // Increase timeout for Docker operations and retries

  beforeAll(async () => {
    await createDockerNetwork(networkName, subnet, gateway);
    await startDockerCompose(COMPOSE_FILE);
    const expectedResponse = "enr:-Kq4";
    const response = await performGetRequest();
    expect(response.enrUri).toContain(expectedResponse);
    expect(response).toBeInstanceOf(Object);
    enrUri = response.enrUri;
    await startDockerCompose(COMPOSE_FILE_2ND_NODE, enrUri);
    console.log("Waiting for nodes to connect...");

    const connected = await waitForConnection(node2Address, 600000, 10000); // 60 seconds timeout, 5 seconds interval
    if (connected) {
      console.log("Nodes have successfully connected.");
    } else {
      console.log("Nodes failed to connect.");
    }
  });

  afterAll(async () => {
    await stopDockerCompose(COMPOSE_FILE);
    await stopDockerCompose(COMPOSE_FILE_2ND_NODE);
  });

  // if this test fails then fail all subsequent tests
  it("should perform GET request to /debug/v1/info and verify partial response", async () => {
    const expectedResponse = "enr:-Kq4";
    const response = await performGetRequest();
    expect(response.enrUri).toContain(expectedResponse);
    expect(response).toBeInstanceOf(Object);
    enrUri = response.enrUri;
  });

  it("should subscribe to a topic on node 2, publish a message and verify the message receieved on node 2", async () => {
    await subscribeToTopic(NODEPORT2);
    await publishMessage();
    expect(await verifyMessage(NODEPORT2, 5, 5)).toBe(true);
  });
});

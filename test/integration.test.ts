import {
  startDockerCompose,
  stopDockerCompose,
  getDebugInfo,
  subscribeToTopic,
  publishMessage,
  verifyMessage,
  COMPOSE_FILE,
  COMPOSE_FILE_2ND_NODE,
  createDockerNetwork,
  waitForConnection,
  NETWORKNAME,
  GATEWAY,
  SUBNET,
  NODEPORT1,
  NODEPORT2,
  NODE2ADDRESS,
} from "../src/index";

let enrUri: string;

describe("Single Node Tests", () => {
  jest.setTimeout(120000); // Increase timeout for Docker operations and retries //chnage back!!!

  beforeAll(async () => {
    await createDockerNetwork(NETWORKNAME, SUBNET, GATEWAY);
    await startDockerCompose(COMPOSE_FILE);
  });

  afterAll(async () => {
    await stopDockerCompose(COMPOSE_FILE);
  });

  it("should perform GET request to /debug/v1/info and verify partial response", async () => {
    const expectedResponse = "enr:-Kq4";
    const response = await getDebugInfo();
    expect(response.enrUri).toContain(expectedResponse);
    expect(response).toBeInstanceOf(Object);
    enrUri = response.enrUri;
  });

  it("should subscribe to a topic, publish a message and verify the message", async () => {
    await subscribeToTopic(NODEPORT1);
    expect(await publishMessage()).toBeTruthy;
    expect(await verifyMessage(NODEPORT1, 5, 5)).toBeTruthy;
  });
});

// change description
describe("Integration Test Second Node", () => {
  jest.setTimeout(12000000); // Increase timeout for Docker operations and retries

  beforeAll(async () => {
    await createDockerNetwork(NETWORKNAME, SUBNET, GATEWAY);
    await startDockerCompose(COMPOSE_FILE);
    const expectedResponse = "enr:-Kq4";
    const response = await getDebugInfo();
    expect(response.enrUri).toContain(expectedResponse);
    expect(response).toBeInstanceOf(Object);
    enrUri = response.enrUri;
    await startDockerCompose(COMPOSE_FILE_2ND_NODE, enrUri);
    console.log("Waiting for nodes to connect...");

    const connected = await waitForConnection(NODE2ADDRESS, 600000, 10000); // 60 seconds timeout, 5 seconds interval
    expect(connected).toBe(true);
  });

  afterAll(async () => {
    await stopDockerCompose(COMPOSE_FILE);
    await stopDockerCompose(COMPOSE_FILE_2ND_NODE);
  });

  // if this test fails then fail all subsequent tests
  it("should perform GET request to /debug/v1/info and verify partial response", async () => {
    const expectedResponse = "enr:-Kq4";
    const response = await getDebugInfo();
    expect(response.enrUri).toContain(expectedResponse);
    expect(response).toBeInstanceOf(Object);
    enrUri = response.enrUri;
  });

  it("should subscribe to a topic on node 2, publish a message and verify the message receieved on node 2", async () => {
    await subscribeToTopic(NODEPORT2);
    expect(await publishMessage()).toBeTruthy;
    expect(await verifyMessage(NODEPORT2, 5, 5)).toBeTruthy;
  });
});

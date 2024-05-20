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
    expect(await subscribeToTopic(NODEPORT1)).toBeTruthy;
    expect(await publishMessage()).toBeTruthy;
    expect(await verifyMessage(NODEPORT1, 5, 5)).toBeTruthy;
  });
});

describe("Second Node Connection Tests", () => {
  // create network and start nodes
  beforeAll(async () => {
    await createDockerNetwork(NETWORKNAME, SUBNET, GATEWAY);
    await startDockerCompose(COMPOSE_FILE);
    const expectedResponse = "enr:-Kq4";
    const response = await getDebugInfo();
    expect(response.enrUri).toContain(expectedResponse);
    expect(response).toBeInstanceOf(Object);
    enrUri = response.enrUri;
    await startDockerCompose(COMPOSE_FILE_2ND_NODE, enrUri);
  });

  afterAll(async () => {
    await stopDockerCompose(COMPOSE_FILE);
    await stopDockerCompose(COMPOSE_FILE_2ND_NODE);
  });

  it("should successfully connect the two nodes and verify", async () => {
    const connected = await waitForConnection(NODE2ADDRESS, 600000, 10000); // connection can take a while to establish
    expect(connected).toBeTruthy;
  });

  it("should subscribe to a topic on node 2, publish a message and verify the message receieved on node 2", async () => {
    expect(await subscribeToTopic(NODEPORT2)).toBeTruthy;
    expect(await publishMessage()).toBeTruthy;
    expect(await verifyMessage(NODEPORT2, 5, 5)).toBeTruthy;
  });
});

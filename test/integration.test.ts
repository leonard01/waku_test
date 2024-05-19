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
} from "../src/index";

let enrUri: string;
const subnet = "172.18.0.0/16";

// change description
describe("Integration Test", () => {
  jest.setTimeout(120000000); // Increase timeout for Docker operations and retries //chnage back!!!

  beforeAll(async () => {
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
    await subscribeToTopic();
    await publishMessage();
    expect(await verifyMessage(5, 5)).toBe(true);
  });
});

// change description
describe("Integration Test Second Node", () => {
  jest.setTimeout(120000); // Increase timeout for Docker operations and retries

  beforeAll(async () => {
    await createDockerNetwork("waku", subnet);
    await startDockerCompose(COMPOSE_FILE);
    const expectedResponse = "enr:-Kq4";
    const response = await performGetRequest();
    expect(response.enrUri).toContain(expectedResponse);
    expect(response).toBeInstanceOf(Object);
    enrUri == response.enrUri;
    await startDockerCompose(COMPOSE_FILE_2ND_NODE, enrUri);
    console.log("DELAYING..........");
    await delay(10000000);
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

  // it("should subscribe to a topic, publish a message and verify the message", async () => {
  //   await subscribeToTopic();
  //   await publishMessage();
  //   expect(await verifyMessage(5, 5)).toBe(true);
  // });
});

const fetch = require("node-fetch");
const ApiServerLocal = require("./../../backend/api-server-local");

async function doFetch(path, method, sequenceDiagram) {
  const response = await fetch("http://localhost:4000" + path, {
    method,
    body: JSON.stringify(sequenceDiagram),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  const body = await response.json();
  const { status } = response;
  return { status, body };
}

// Assigned the id from backend via a test
let idToTest;

const sequenceDiagramInitialRevision = {
  objects: [],
  messages: [],
};

const sequenceDiagramRevision2 = {
  objects: [{ key: "o1", name: "This works" }],
  messages: [],
};

function expectSuccessfulPostOrGet(status, body, sequenceDiagram) {
  expect(status).toEqual(200);
  expect(body.creationTimeUtc).toBeGreaterThan(1500000000);
  expect(body.id).toMatch(/^[0-9a-z]{4,20}$/);
  expect(body.sequenceDiagram.objects).toEqual(
    expect.arrayContaining(sequenceDiagram.objects)
  );
  expect(body.sequenceDiagram.messages).toEqual(
    expect.arrayContaining(sequenceDiagram.messages)
  );
}

function expectError(status, body, expectedMessagePart, expectedCode) {
  expect(status).toBeGreaterThanOrEqual(400);
  expect(status).toBeLessThan(500);
  expect(body.error.code).toEqual(expectedCode);
  expect(body.error.message).toMatch(expectedMessagePart);
}

const server = new ApiServerLocal();

beforeAll(async () => {
  await server.listen();
});

afterAll(async () => {
  await server.close();
});

it("POST /sequencediagrams", async () => {
  const { status, body } = await doFetch(
    "/sequencediagrams",
    "POST",
    sequenceDiagramInitialRevision
  );
  expectSuccessfulPostOrGet(status, body, sequenceDiagramInitialRevision);
  expect(body.revision).toEqual(1);

  idToTest = body.id;
});

// We don't support getting a list of all diagrams everyone
// has ever created...
it("GET /sequencediagrams", async () => {
  const { status, body } = await doFetch("/sequencediagrams", "GET");
  expect(status).toBeGreaterThanOrEqual(400);
  expect(status).toBeLessThan(500);
});

it("POST /sequencediagrams/{id}", async () => {
  const { status, body } = await doFetch(
    "/sequencediagrams/" + idToTest,
    "POST",
    sequenceDiagramRevision2
  );
  expectSuccessfulPostOrGet(status, body, sequenceDiagramRevision2);
  expect(body.revision).toEqual(2);
});

it("GET /sequencediagrams/{id} latest revision", async () => {
  const { status, body } = await doFetch(
    "/sequencediagrams/" + idToTest,
    "GET"
  );
  expectSuccessfulPostOrGet(status, body, sequenceDiagramRevision2);
});

it("GET /sequencediagrams/{id}/{revision}", async () => {
  const { status, body } = await doFetch(
    "/sequencediagrams/" + idToTest + "/1",
    "GET"
  );
  expectSuccessfulPostOrGet(status, body, sequenceDiagramInitialRevision);
});

it("POST invalid bodies", async () => {
  const invalidValues = [{}, { objects: [] }, { messages: [] }, []];
  // forEach() does not work with async/await :(
  for (let i = 0; i < invalidValues.length; i++) {
    const paths = ["/sequencediagrams", "/sequencediagrams/" + idToTest];
    for (let j = 0; j < paths.length; j++) {
      const { status, body } = await doFetch(
        paths[j],
        "POST",
        invalidValues[i]
      );
      expectError(status, body, "missing", "MissingProperties");
    }
  }
});

it("POST /sequencediagrams/doesnotexist", async () => {
  const sequenceDiagram = {
    objects: [],
    messages: [],
  };
  const { status, body } = await doFetch(
    "/sequencediagrams/doesnotexist",
    "POST",
    sequenceDiagram
  );
  expectError(status, body, "empty", "EmptyQuery");
});

it("POST > 50 kB payload", async () => {
  const hugeSequenceDiagram = {
    objects: [],
    messages: [],
  };
  let kBsLeft = 50;
  while (kBsLeft-- > 0) {
    hugeSequenceDiagram.objects.push({
      key: "o" + kBsLeft,
      name: "x".repeat(1000),
    });
  }

  const paths = ["/sequencediagrams", "/sequencediagrams/" + idToTest];
  for (let i = 0; i < paths.length; i++) {
    const { status, body } = await doFetch(
      paths[i],
      "POST",
      hugeSequenceDiagram
    );
    expectError(status, body, "50 kB", "TooLarge");
  }
});

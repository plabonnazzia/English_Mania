/**
 * Auth integration tests — Phase 2.
 * Requires a running PostgreSQL database (see README: docker compose up -d,
 * then `npm run prisma:migrate`). Uses a unique email per run so tests are
 * re-runnable against the same database.
 */
import request from "supertest";
import app from "../src/server";
import { prisma } from "../src/prisma/client";

const suffix = Date.now();
const testUser = {
  name: "Test User",
  email: `test-${suffix}@example.com`,
  password: "password123",
};

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("registers a new user and returns a token (201)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser)
      .expect(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe("STUDENT");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects duplicate email (409)", async () => {
    await request(app).post("/api/auth/register").send(testUser).expect(409);
  });

  it("rejects invalid email (400)", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "X", email: "not-an-email", password: "password123" })
      .expect(400);
  });

  it("rejects short password (400)", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ name: "X", email: `short-${suffix}@example.com`, password: "short" })
      .expect(400);
  });
});

describe("POST /api/auth/login + GET /api/auth/me", () => {
  let token: string;

  it("logs in with correct credentials (200)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);
    token = res.body.token;
    expect(token).toEqual(expect.any(String));
  });

  it("rejects wrong password (401)", async () => {
    await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "wrong-password" })
      .expect(401);
  });

  it("GET /me returns current user with a valid token (200)", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it("GET /me without a token returns 401", async () => {
    await request(app).get("/api/auth/me").expect(401);
  });

  it("GET /me with an invalid token returns 401", async () => {
    await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.here")
      .expect(401);
  });
});

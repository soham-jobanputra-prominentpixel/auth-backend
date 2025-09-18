import "dotenv/config";
import path from "node:path";
import { promises as fs } from "node:fs";
import { User } from "./src/models/user.ts";

async function insertUsers() {
  const fixturesPath = path.resolve("./fixtures/");
  const usersJsonFile = path.resolve(fixturesPath, "users.json");
  const usersJson = await fs.readFile(usersJsonFile, "utf-8");
  const users = JSON.parse(usersJson);
  await User.sync({ force: true });
  await User.bulkCreate(users, { validate: true });
}

await insertUsers();

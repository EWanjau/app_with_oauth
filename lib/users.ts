import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { compare, hash } from "bcryptjs";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
};

type StoredUser = PublicUser & { passwordHash: string };

const dataDir = path.join(process.cwd(), "data");
const file = path.join(dataDir, "users.json");

async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as StoredUser[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // first run
  }
  return seed();
}

async function writeUsers(users: StoredUser[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(users, null, 2), "utf8");
}

async function seed(): Promise<StoredUser[]> {
  const demo: StoredUser = {
    id: "demo-sky",
    name: "Sky",
    email: "sky@nimbus.app",
    passwordHash: await hash("twelvehours", 10),
  };
  await writeUsers([demo]);
  return [demo];
}

function toPublic(user: StoredUser): PublicUser {
  return { id: user.id, name: user.name, email: user.email };
}

export async function authenticate(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const users = await readUsers();
  const match = users.find((user) => user.email === email);
  if (!match) return null;
  const ok = await compare(password, match.passwordHash);
  return ok ? toPublic(match) : null;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<PublicUser | "taken"> {
  const users = await readUsers();
  if (users.some((user) => user.email === input.email)) return "taken";

  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.slice(0, 48),
    email: input.email,
    passwordHash: await hash(input.password, 10),
  };
  users.push(user);
  await writeUsers(users);
  return toPublic(user);
}

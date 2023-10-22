import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import { expect, test } from "vitest";
import { appRouter } from "../router";

const execAsync = promisify(exec);

const prismaBinaryPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "node_modules",
    ".bin",
    "prisma"
);

const createTmpDB =  async (id: string) => {
  const dbPath = path.join(await fs.mkdtemp(path.join(os.tmpdir(), id)), "tmp.db");
  await fs.writeFile(dbPath, Buffer.from([]));

  return {
    dbPath,
    async [Symbol.asyncDispose]() {
        await fs.rm(path.dirname(dbPath), {recursive: true, force: true})
    }
  };
};

test("can create an retrieve post", async () => {
    await using tmpDB = await createTmpDB("123");
    const {dbPath} = tmpDB

    await execAsync(`${prismaBinaryPath} db push`, {
      env: {
        ...process.env,
        DATABASE_URL: `file:${dbPath}`
      }
    });

    const prisma = new PrismaClient({datasourceUrl: `file:${dbPath}`})
    const router = appRouter.createCaller({prisma})

    const createdPost = await router.createPost({title: "Test", author: "Test", content: "Testing"})
    const retrievedPost = await router.getPost({id: createdPost.id})

    expect(createdPost).toEqual(retrievedPost)

});

test("can paginate posts", async () => {
    await using tmpDB = await createTmpDB("123");
    const {dbPath} = tmpDB

    await execAsync(`${prismaBinaryPath} db push`, {
      env: {
        ...process.env,
        DATABASE_URL: `file:${dbPath}`
      }
    });

    const prisma = new PrismaClient({datasourceUrl: `file:${dbPath}`})
    const router = appRouter.createCaller({prisma})

    await router.createPost({title: "First", author: "First", content: "First"}),
    await router.createPost({title: "Second", author: "Second", content: "Second"})

    const firstResponse = await router.getPosts({pageSize: 1});
    expect(firstResponse.items).toHaveLength(1)
    expect(firstResponse.cursor).toBeDefined()

    const secondResponse = await router.getPosts({pageSize:1, cursor: firstResponse.cursor?.toISOString()});
    expect(secondResponse.items).toHaveLength(1)
    expect(secondResponse.cursor).not.toBeDefined()
});

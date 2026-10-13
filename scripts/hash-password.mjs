import { hash } from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
if (!process.stdin.isTTY)
  throw new Error(
    "Run in an interactive terminal. Passwords are never passed on command lines or environment variables.",
  );
const muted = new Writable({
  write(_chunk, _encoding, done) {
    done();
  },
});
const input = createInterface({
  input: process.stdin,
  output: muted,
  terminal: true,
});
try {
  process.stdout.write(
    "Password (hidden, 12+ characters, at most 72 UTF-8 bytes): ",
  );
  const password = await input.question("");
  process.stdout.write("\n");
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72)
    throw new Error("Password length rejected.");
  process.stdout.write(`${await hash(password, 12)}\n`);
} finally {
  input.close();
}

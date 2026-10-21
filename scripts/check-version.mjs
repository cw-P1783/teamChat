import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function parseVersion(version) {
  if (typeof version !== "string" || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(`Expected a stable MAJOR.MINOR.PATCH version, received ${version}`);
  }
  return version.split(".").map(BigInt);
}

export function validateVersion(pkg, lock, baseVersion) {
  const current = parseVersion(pkg.version);
  if (lock.version !== pkg.version || lock.packages?.[""]?.version !== pkg.version) {
    throw new Error("package.json and both package-lock.json root versions must match");
  }
  if (baseVersion !== undefined) {
    const base = parseVersion(baseVersion);
    const index = current.findIndex((value, i) => value !== base[i]);
    if (index === -1 || current[index] < base[index]) {
      throw new Error(`Release version ${pkg.version} must be greater than main's ${baseVersion}`);
    }
  }
  return pkg.version;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 0 && (args.length !== 2 || args[0] !== "--base-ref")) {
    throw new Error("Usage: npm run version:check -- [--base-ref origin/main]");
  }
  const root = fileURLToPath(new URL("../", import.meta.url));
  const readJson = (name) => JSON.parse(readFileSync(new URL(`../${name}`, import.meta.url), "utf8"));
  const pkg = readJson("package.json");
  const lock = readJson("package-lock.json");
  const baseVersion = args.length
    ? JSON.parse(execFileSync("git", ["show", `${args[1]}:package.json`], { cwd: root, encoding: "utf8" })).version
    : undefined;
  const version = validateVersion(pkg, lock, baseVersion);
  if (args.length) {
    const existing = execFileSync("git", ["tag", "--list", `v${version}`], { cwd: root, encoding: "utf8" }).trim();
    if (existing) throw new Error(`Release tag v${version} already exists; do not reuse a published version`);
  }
  console.log(`Version ${version} is valid${baseVersion ? ` and newer than ${baseVersion}` : ""}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

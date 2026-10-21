// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseVersion, validateVersion } from "../scripts/check-version.mjs";

const metadata = (version: string) => ({
  pkg: { version },
  lock: { version, packages: { "": { version } } },
});

describe("release version validation", () => {
  it.each(["0.1.0", "1.0.0", "10.200.300"])("accepts matching stable version %s", (version) => {
    const { pkg, lock } = metadata(version);
    expect(validateVersion(pkg, lock)).toBe(version);
  });

  it.each(["01.2.3", "1.2", "v1.2.3", "1.2.3-rc.1", "1.2.3+build", "1.2.3\n"])("rejects unsupported version %j", (version) => {
    expect(() => parseVersion(version)).toThrow();
  });

  it("rejects drift in either lockfile root version", () => {
    const { pkg, lock } = metadata("0.1.1");
    expect(() => validateVersion(pkg, { ...lock, version: "0.1.0" })).toThrow("must match");
    expect(() => validateVersion(pkg, { ...lock, packages: { "": { version: "0.1.0" } } })).toThrow("must match");
    expect(() => validateVersion(pkg, { version: pkg.version })).toThrow("must match");
  });

  it.each([
    ["0.1.1", "0.1.0"],
    ["0.10.0", "0.9.9"],
    ["1.0.0", "0.99.99"],
  ])("accepts release %s after %s", (version, base) => {
    const { pkg, lock } = metadata(version);
    expect(validateVersion(pkg, lock, base)).toBe(version);
  });

  it.each([
    ["0.1.0", "0.1.0"],
    ["0.1.0", "0.1.1"],
    ["0.9.9", "0.10.0"],
  ])("rejects reused or older release %s after %s", (version, base) => {
    const { pkg, lock } = metadata(version);
    expect(() => validateVersion(pkg, lock, base)).toThrow("must be greater");
  });
});

import { getVersions, resolveVersion } from "../versions";
import { valid } from "semver";

describe("versions", () => {
  describe("resolveVersion", () => {
    test("should correctly resolve version", async () => {
      await expect(
        resolveVersion("2.x", ["2.9.2", "2.8.2"], "stable")
      ).resolves.toBe("2.9.2");

      // Support version range.
      await expect(
        resolveVersion(
          ">= 2.7 < 2.9",
          ["2.9.2", "2.8.2", "2.7.9", "2.8.3"],
          "stable"
        )
      ).resolves.toBe("2.8.3");

      await expect(
        resolveVersion(
          "> 2.10.0-1.0.dev <= 2.10.0-2.1.dev",
          ["2.10.0-1.0.dev", "2.10.0-2.0.dev", "2.10.0-2.1.dev"],
          "dev"
        )
      ).resolves.toBe("2.10.0-2.1.dev");
    });
  });

  describe("getVersions", () => {
    test("should return only valid versions", async () => {
      const [stable, beta, dev] = await Promise.all([
        getVersions("stable"),
        getVersions("beta"),
        getVersions("dev"),
      ]);

      stable.forEach(version => expect(valid(version)).toBeTruthy());
      beta.forEach(version => expect(valid(version)).toBeTruthy());
      dev.forEach(version => expect(valid(version)).toBeTruthy());
    });
  });
});

import { format } from "url";
import { debug, info } from "@actions/core";
import * as semver from "semver";
import { getHttpClient } from "./httpClient";
import { Channel } from "./types";

type DartVersion = string;
type DartVersions = DartVersion[];

export async function resolveVersion(
  versionSpec: DartVersion,
  versions: DartVersions,
  channel: Channel
): Promise<DartVersion> {
  info(`Attempt to resolve version ${versionSpec}.`);

  if (versionSpec === "latest") {
    return (await getLatestVersion(channel)) ?? versionSpec;
  }

  let version: string | null = null;
  try {
    version = semver.maxSatisfying(versions, versionSpec);
  } catch (err) {
    info("Unable to resolve version from dist manifest");
    debug(err.message);
    debug(err.stack);
  }

  if (version !== null) {
    info(`Resolve ${versionSpec} to ${version}.`);
  } else {
    info("Unable to resolve version.");
    version = versionSpec;
  }

  return version;
}

interface GetVersionsResult {
  kind: string;
  prefixes: string[];
}

export async function getVersions(channel: Channel): Promise<DartVersions> {
  const dataUrl = format({
    protocol: "https",
    host: "www.googleapis.com",
    pathname: "/storage/v1/b/dart-archive/o",
    query: {
      delimiter: "/",
      prefix: `channels/${channel}/release/`,
      alt: "json",
    },
  });
  const httpClient = getHttpClient();
  const response = await httpClient.getJson<GetVersionsResult>(dataUrl);
  const prefix = `channels/${channel}/release/`;
  const rawVersions = response?.result?.prefixes ?? [];
  const versions: DartVersions = [];

  const prefixLength = prefix.length;
  for (const rawVersion of rawVersions) {
    const potentialVersion = rawVersion.slice(
      // strip prefix
      prefixLength,

      // strip suffix `/`.
      rawVersion.length - 1
    );

    if (semver.valid(potentialVersion)) {
      versions.push(potentialVersion);
    }
  }

  return versions;
}

interface GetLatestVersionResult {
  date: string;
  revision: string;
  version: string;
}

async function getLatestVersion(channel: Channel): Promise<DartVersion | null> {
  info("Attempt to resolve latest version.");

  const dataUrl = format({
    protocol: "https",
    host: "storage.googleapis.com",
    pathname: `/dart-archive/channels/${channel}/release/latest/VERSION`,
  });
  const httpClient = getHttpClient();

  try {
    const response = await httpClient.getJson<GetLatestVersionResult>(dataUrl);
    const version = response?.result?.version;

    if (!version) {
      return null;
    }

    return version;
  } catch (err) {
    info("Failed to resolve latest version.");
    debug(err.message);
    debug(err.stack);
  }

  return null;
}

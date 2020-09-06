import * as os from "os";
import { join } from "path";
import {
  cacheDir,
  downloadTool,
  extractZip,
  find as findTool,
} from "@actions/tool-cache";
import { addPath, info, setOutput } from "@actions/core";
import { getVersions, resolveVersion } from "./versions";
import { Channel } from "./types";

const TOOL_NAME = "dart";

export async function getDart(
  versionSpec: string,
  channel: Channel
): Promise<void> {
  const versions = await getVersions(channel);
  let resolvedVersion = await resolveVersion(versionSpec, versions, channel);
  let toolPath: string = await findTool(TOOL_NAME, resolvedVersion);

  if (toolPath) {
    info(`Found tool in cache "${toolPath}".`);
  } else {
    info(`Attempt to download ${versionSpec}.`);

    const platform = getPlatform();
    const arch = getArch();

    const downloadPath = await downloadTool(
      `https://storage.googleapis.com/dart-archive/channels/${channel}/release/${resolvedVersion}/sdk/dartsdk-${platform}-${arch}-release.zip`
    );
    info("Done");

    info("Extracting.");
    const extractPath = await extractZip(downloadPath);
    info("Done");

    info("Adding to cache");
    toolPath = await cacheDir(extractPath, TOOL_NAME, resolvedVersion);
    info("Done");
  }

  const sdkPath = join(toolPath, "dart-sdk");
  const binPath = join(sdkPath, "bin");

  addPath(binPath);
  setOutput("dart-sdk", sdkPath);
}

function getPlatform() {
  const platform = os.platform();
  switch (platform) {
    case "win32":
      return "windows";

    case "darwin":
      return "macos";

    case "linux":
      return "linux";
  }

  throw new Error("Unsupported platform!");
}

// Possible values are 'arm', 'arm64', 'ia32', 'mips', 'mipsel', 'ppc', 'ppc64', 's390', 's390x', 'x32', and 'x64'.
function getArch() {
  const arch = os.arch();
  switch (arch) {
    case "x32":
      return "ia32";

    case "x64":
    case "arm":
    case "arm64":
      return arch;
  }

  throw new Error("Unsupported arch!");
}

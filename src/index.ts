import { setFailed, getInput } from "@actions/core";
import { getDart } from "./installer";
import { Channel } from "./types";

const DEFAULT_VERSION = "latest";
const DEFAULT_CHANNEL: Channel = "stable";
const VALID_CHANNELS = ["dev", "beta", "stable"];

(async function main() {
  try {
    const version = getInput("version") ?? DEFAULT_VERSION;
    const channel = getInput("channel") ?? DEFAULT_CHANNEL;
    if (!VALID_CHANNELS.includes(channel)) {
      return setFailed(
        `Invalid channel, expected one of ${VALID_CHANNELS.join(
          ", "
        )}, was ${channel}`
      );
    }

    await getDart(version, channel as Channel);
  } catch (err) {
    setFailed(err.message);
  }
})();

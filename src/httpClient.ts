import { HttpClient } from "@actions/http-client";

let client: HttpClient;
function getHttpClient() {
  if (typeof client === "undefined") {
    client = new HttpClient("setup-dart", [], {
      allowRetries: true,
      maxRetries: 3,
    });
  }

  return client;
}

export { getHttpClient };

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { bridge, muppet } from "muppet";
import "../resources/index.js";
import "../tools/index.js";
import { match } from "path-to-regexp";
import { logger } from "../logger.js";
import { getSuiMCPState } from "../state/index.js";
import { getPackageVersion } from "../utils/version.js";
import { app } from "./app.js";

const WALRUS_ROUTES = [
	match<{ network: string; blobId: string }>(":network/blob/:blobId"),
	match<{ network: string; objectId: string }>(
		":network/blob/by-object-id/:objectId",
	),
];

export async function startServer() {
	const { exists } = await getSuiMCPState();
	if (!exists) {
		logger.fatal(
			"Could not find the SuiMCP configuration. Please run `npx @jordangens/sui-mcp init` to create one.",
		);
		process.exit(1);
	}

	const mcp = muppet(app, {
		name: "SuiMCP",
		version: await getPackageVersion(),
		resources: {
			walrus: async (uri) => {
				const url = new URL(uri);

				const match = WALRUS_ROUTES.map((fn) => fn(url.pathname))
					.filter(Boolean)
					.at(0);

				if (!match) {
					throw new Error(`Unknown Walrus resource: ${uri}`);
				}

				if (!["mainnet", "testnet"].includes(match.params.network)) {
					throw new Error(`Invalid network: ${match.params.network}`);
				}

				let response: Response;
				if ("objectId" in match.params) {
					const objectId = match.params.objectId;
					response = await fetch(
						`https://aggregator.walrus-${match.params.network}.walrus.space/v1/blobs/by-object-id/${objectId}`,
					);
				} else if ("blobId" in match.params) {
					const blobId = match.params.blobId;
					response = await fetch(
						`https://aggregator.walrus-${match.params.network}.walrus.space/v1/blobs/${blobId}`,
					);
				} else {
					throw new Error(`Unknown Walrus resource: ${uri}`);
				}

				if (!response.ok) {
					throw new Error(`Failed to fetch blob: ${response.statusText}`);
				}

				return {
					contents: [
						{
							uri,
							name: "Blob Contents",
							text: await response.text(),
							mimeType: response.headers.get("content-type") ?? "text/plain",
						},
					],
				};
			},
		},
	});

	await bridge({
		mcp,
		transport: new StdioServerTransport(),
	});

	logger.info("SuiMCP started, listening on stdio");

	return await mcp;
}

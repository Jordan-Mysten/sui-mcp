// import { registerResources, type Resource } from "muppet";
// import { app } from "../server/app.js";

import { type Resource, registerResources } from "muppet";
import { logger } from "../logger.js";
import { app } from "../server/app.js";

app.post(
	"/documents",
	registerResources((c) => {
		return c.json<Resource[]>([
			{
				type: "template",
				uri: "walrus:{network}/blob/{blobId}",
				name: "Walrus Blob (by blob ID)",
				description:
					"Load blob contents from the Walrus, fetched by the blob ID. Network must be one of 'mainnet' or 'testnet'.",
				completion: async (args) => {
					if (args.name === "network") {
						return ["mainnet", "testnet"];
					}

					return [];
				},
			},
			{
				type: "template",
				uri: "walrus:{network}/blob/by-object-id/{objectId}",
				name: "Walrus Blob (by object ID)",
				description:
					"Load blob contents from the Walrus, fetched by the Sui Object ID. Network must be one of 'mainnet' or 'testnet'.",
				completion: async (args) => {
					if (args.name === "network") {
						return ["mainnet", "testnet"];
					}

					return [];
				},
			},
		]);
	}),
);

// TODO: Add more resources:
// app.post(
//   "/documents",
//   registerResources((c) =>
//     c.json<Resource[]>([
//       {
//         uri: "https://sdk.mystenlabs.com/llms.txt",
//         name: "Sui TypeScript SDK Docs",
//         description:
//           "The documentation for the Sui TypeScript SDK (@mysten/sui), including React SDKs (@mysten/dapp-kit).",
//         mimeType: "text/plain",
//       },
//       {
//         uri: "https://docs.sui.io/sui-api-ref",
//         name: "Sui JSON RPC Reference",
//         description:
//           "The documentation for the Sui JSON RPC API, which is the primary way to interact with the Sui blockchain.",
//         mimeType: "text/html",
//       },
//     ])
//   )
// );

import path from "node:path";
import { pino } from "pino";
import pretty from "pino-pretty";

export const logger = pino(
	{ level: "info" },
	pino.multistream(
		[
			// NOTE: We need to pass in the destination as 2 (stderr) since stdout is already being used
			// for communication via MCP.
			pretty({ destination: 2 }),
			process.env.SUI_MCP_LOG_FILE !== "off"
				? pino.destination({
						dest:
							process.env.SUI_MCP_LOG_FILE ||
							path.join(import.meta.dirname, "sui-mcp.log"),
						append: false,
					})
				: undefined,
		].filter(Boolean) as pino.DestinationStream[],
	),
);

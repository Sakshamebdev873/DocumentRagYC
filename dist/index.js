"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./config/prisma");
const PORT = process.env.PORT || 3001;
const server = app_1.default.listen(PORT, () => {
    console.log(`Enterprise RAG Platform listening on port ${PORT}`);
});
let isShuttingDown = false;
async function shutdown(signal) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.log(`${signal} received. Shutting down server gracefully...`);
    server.close(async (serverError) => {
        if (serverError) {
            console.error("Error while closing HTTP server:", serverError);
            process.exit(1);
            return;
        }
        try {
            await prisma_1.prisma.$disconnect();
            console.log("Prisma disconnected. Shutdown complete.");
            process.exit(0);
        }
        catch (disconnectError) {
            console.error("Error while disconnecting Prisma:", disconnectError);
            process.exit(1);
        }
    });
    setTimeout(async () => {
        console.error("Forced shutdown after timeout.");
        try {
            await prisma_1.prisma.$disconnect();
        }
        catch (disconnectError) {
            console.error("Error during forced Prisma disconnect:", disconnectError);
        }
        process.exit(1);
    }, 10000).unref();
}
process.on("SIGINT", () => {
    void shutdown("SIGINT");
});
process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    void shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    void shutdown("unhandledRejection");
});

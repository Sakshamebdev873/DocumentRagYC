import "dotenv/config";
import type { Server } from "node:http";
import app from "./app";
import { prisma } from "./config/prisma";

const PORT = process.env.PORT || 3001;

const server: Server = app.listen(PORT, () => {
  console.log(`Enterprise RAG Platform listening on port ${PORT}`);
});

let isShuttingDown = false;

async function shutdown(signal: string) {
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
      await prisma.$disconnect();
      console.log("Prisma disconnected. Shutdown complete.");
      process.exit(0);
    } catch (disconnectError) {
      console.error("Error while disconnecting Prisma:", disconnectError);
      process.exit(1);
    }
  });

  setTimeout(async () => {
    console.error("Forced shutdown after timeout.");
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error during forced Prisma disconnect:", disconnectError);
    }
    process.exit(1);
  }, 10_000).unref();
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


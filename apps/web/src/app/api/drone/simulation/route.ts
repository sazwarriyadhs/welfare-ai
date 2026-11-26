import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const CONTAINER = "welfare-ai-px4-gazebo-v2";

async function docker(args: string[]) {
  return execFileAsync("docker", args, {
    timeout: 60000,
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const hostname = requestUrl.hostname.toLowerCase();
    const origin = request.headers.get("origin");

    const localHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname === "[::1]";

    if (!localHost || !origin || origin !== requestUrl.origin) {
      return jsonError("Local same-origin request required", 403);
    }

    if (
      !(request.headers.get("content-type") || "")
        .toLowerCase()
        .includes("application/json")
    ) {
      return jsonError("JSON required", 415);
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const action =
      typeof body === "object" && body !== null && "action" in body
        ? (body as { action?: unknown }).action
        : undefined;

    if (action !== "start" && action !== "reset") {
      return jsonError("Unsupported action", 400);
    }

    const inspected = await docker([
      "inspect",
      "--format",
      "{{.State.Running}}",
      CONTAINER,
    ]);

    const running = inspected.stdout.trim() === "true";

    if (action === "start") {
      if (!running) {
        await docker(["start", CONTAINER]);
      }
    } else {
      await docker(["restart", "--timeout", "20", CONTAINER]);
    }

    const verified = await docker([
      "inspect",
      "--format",
      "{{.State.Running}}",
      CONTAINER,
    ]);

    if (verified.stdout.trim() !== "true") {
      throw new Error("Gazebo container did not reach running state");
    }

    return NextResponse.json({
      ok: true,
      action,
      container: CONTAINER,
      running: true,
      message:
        action === "reset"
          ? "Gazebo simulation restarted"
          : "Gazebo simulation is running",
    });
  } catch (error) {
    console.error("Drone simulation control failed:", error);

    return jsonError(
      "Simulation control failed. Check Docker and container status.",
      500
    );
  }
}

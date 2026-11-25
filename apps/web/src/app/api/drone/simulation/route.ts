import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";


const execFileAsync = promisify(execFile);
const CONTAINER = "px4-official";

async function docker(args: string[]) {
  return execFileAsync("docker", args, {
    timeout: 60000,
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    const requestUrl = new URL(request.url);
    const hostname = requestUrl.hostname.toLowerCase();

    const localHost =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1";

    if (!localHost || !origin || origin !== requestUrl.origin) {
      return NextResponse.json(
        { ok: false, error: "Local same-origin request required" },
        { status: 403 }
      );
    }

    if (!(request.headers.get("content-type") || "").includes("application/json")) {
      return NextResponse.json(
        { ok: false, error: "JSON required" },
        { status: 415 }
      );
    }

    const body = await request.json();
    const action = body?.action;

    if (action !== "start" && action !== "reset") {
      return NextResponse.json(
        { ok: false, error: "Unsupported action" },
        { status: 400 }
      );
    }

    const inspected = await docker([
      "inspect", "--format", "{{.State.Running}}", CONTAINER
    ]);

    const running = inspected.stdout.trim() === "true";

    if (action === "start") {
      if (!running) {
        await docker(["start", CONTAINER]);
      }
    } else {
      if (running) {
        await docker(["restart", "--timeout", "20", CONTAINER]);
      } else {
        await docker(["start", CONTAINER]);
      }
    }

    const verified = await docker([
      "inspect", "--format", "{{.State.Running}}", CONTAINER
    ]);

    if (verified.stdout.trim() !== "true") {
      throw new Error("Gazebo container did not reach running state");
    }

    return NextResponse.json({
      ok: true,
      action,
      container: CONTAINER,
      running: true,
      message: action === "reset"
        ? "Gazebo simulation restarted"
        : "Gazebo simulation is running",
    });
  } catch (error) {
    console.error("Drone simulation control failed:", error);
    return NextResponse.json(
      { ok: false, error: "Simulation control failed. Check Docker and container status." },
      { status: 500 }
    );
  }
}

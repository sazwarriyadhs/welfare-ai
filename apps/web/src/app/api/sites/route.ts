import { connection, NextResponse } from "next/server";

export async function GET() {
  await connection();

  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!configuredBaseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL belum dikonfigurasi." },
      { status: 500 },
    );
  }

  const baseUrl = configuredBaseUrl.replace(/\/+$/, "");

  try {
    const upstream = await fetch(`${baseUrl}/api/v1/sites`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const responseText = await upstream.text();

    let payload: unknown;

    try {
      payload = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Backend mengirim respons yang bukan JSON valid." },
        { status: 502 },
      );
    }

    return NextResponse.json(payload, {
      status: upstream.status,
    });
  } catch (error) {
    console.error("Sites upstream request failed:", error);

    return NextResponse.json(
      { error: "Tidak dapat terhubung ke Welfare AI Sites API." },
      { status: 502 },
    );
  }
}
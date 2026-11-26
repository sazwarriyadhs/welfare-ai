import { connection, NextRequest, NextResponse } from "next/server";

const ALLOWED_SPECIES = new Set([
  "cattle",
  "sheep",
  "goat",
]);

export async function GET(request: NextRequest) {
  await connection();

  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!configuredBaseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL belum dikonfigurasi." },
      { status: 500 },
    );
  }

  const species = request.nextUrl.searchParams
    .get("species")
    ?.trim()
    .toLowerCase();

  if (species && !ALLOWED_SPECIES.has(species)) {
    return NextResponse.json(
      { error: "Spesies tidak didukung oleh master breed." },
      { status: 400 },
    );
  }

  const baseUrl = configuredBaseUrl.replace(/\/+$/, "");
  const upstreamUrl = new URL(
    `${baseUrl}/api/v1/livestock-breeds`,
  );

  if (species) {
    upstreamUrl.searchParams.set("species", species);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
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
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Livestock breeds upstream request failed:", error);

    return NextResponse.json(
      { error: "Tidak dapat terhubung ke Livestock Breeds API." },
      { status: 502 },
    );
  }
}

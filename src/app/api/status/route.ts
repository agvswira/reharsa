import { connection } from "next/server";
import { serviceStatus } from "@/lib/server/env";

// Memberi tahu UI layanan mana yang sudah dikonfigurasi, tanpa membuka key.
export async function GET() {
  await connection();
  return Response.json(serviceStatus());
}

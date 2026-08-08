import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
  region: process.env.S3_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "openpims",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "openpims123",
  },
  forcePathStyle: true, // required for MinIO
});

const BUCKET = process.env.S3_BUCKET ?? "openpims";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileName, mimeType } = (await req.json()) as {
    fileName?: string;
    mimeType?: string;
  };
  if (!fileName) {
    return NextResponse.json({ error: "fileName required" }, { status: 400 });
  }

  const ext = fileName.split(".").pop() ?? "bin";
  // Use built-in crypto — no nanoid dependency needed
  const uniqueId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const fileKey = `marketing/${uniqueId}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: fileKey,
    ContentType: mimeType ?? "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  const fileUrl = `${process.env.S3_ENDPOINT ?? "http://localhost:9000"}/${BUCKET}/${fileKey}`;

  return NextResponse.json({ uploadUrl, fileKey, fileUrl });
}

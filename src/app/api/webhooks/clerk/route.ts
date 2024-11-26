import { db } from "@/server/db";
import { Webhook } from "svix";
import { headers } from "next/headers";
import {type  WebhookEvent } from "@clerk/nextjs/server";

export const POST = async (req: Request) => {
  const WEBHOOK_SECRET = process.env.SIGNING_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }
  console.log("❤️route trigger for creating a user" );
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", { status: 400 });
  }
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", { status: 400 });
  }

  console.log("evt", evt);
  const emailAddress = evt.data.email_addresses[0].email_address;
  const firstName = evt.data.first_name;
  const lastName = evt.data.last_name;
  const imageUrl = evt.data.image_url;
  const id = evt.data.id;

  try {
    const user = await db.user.upsert({
      create: { id, emailAddress, firstName, lastName, imageUrl },
      where: { id },
      update: { emailAddress, firstName, lastName, imageUrl },
    });
    console.log("User updated:", user);
  } catch (error) {
    console.log("User not updated:", error);
    return new Response("Error in updating user", { status: 500 });
  }


  return new Response("Webhook processed", { status: 200 });
};

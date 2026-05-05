import { Router } from "express";
import { db, bookingsTable, propertiesTable, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { CreateBookingBody, UpdateBookingStatusBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

async function formatBooking(booking: typeof bookingsTable.$inferSelect) {
  const [property] = await db
    .select({ title: propertiesTable.title, city: propertiesTable.city })
    .from(propertiesTable)
    .where(eq(propertiesTable.id, booking.propertyId))
    .limit(1);

  const [tenant] = await db
    .select({ name: usersTable.name, phone: usersTable.phone, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, booking.tenantId))
    .limit(1);

  return {
    id: booking.id,
    propertyId: booking.propertyId,
    propertyTitle: property?.title ?? "Unknown Property",
    propertyCity: property?.city ?? "Unknown",
    tenantId: booking.tenantId,
    tenantName: tenant?.name ?? "Unknown",
    tenantPhone: tenant?.phone ?? null,
    tenantEmail: tenant?.email ?? "",
    message: booking.message,
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
  };
}

router.get("/bookings", requireAuth, async (req, res) => {
  const session = req.session as { userId?: number; userRole?: string };

  let bookings;
  if (session.userRole === "owner") {
    const myPropertyIds = await db
      .select({ id: propertiesTable.id })
      .from(propertiesTable)
      .where(eq(propertiesTable.ownerId, session.userId!));

    if (myPropertyIds.length === 0) {
      res.json([]);
      return;
    }

    bookings = await db
      .select()
      .from(bookingsTable)
      .where(
        or(
          ...myPropertyIds.map((p) => eq(bookingsTable.propertyId, p.id)),
        ),
      )
      .orderBy(bookingsTable.createdAt);
  } else {
    bookings = await db
      .select()
      .from(bookingsTable)
      .where(eq(bookingsTable.tenantId, session.userId!))
      .orderBy(bookingsTable.createdAt);
  }

  const formatted = await Promise.all(bookings.map(formatBooking));
  res.json(formatted);
});

router.post("/bookings", requireAuth, async (req, res) => {
  const session = req.session as { userId?: number; userRole?: string };
  if (session.userRole !== "tenant") {
    res.status(403).json({ error: "Only tenants can create booking inquiries" });
    return;
  }

  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { propertyId, message } = parsed.data;

  const [prop] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, propertyId))
    .limit(1);

  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      propertyId,
      tenantId: session.userId!,
      message: message ?? null,
    })
    .returning();

  const formatted = await formatBooking(booking);
  res.status(201).json(formatted);
});

router.put("/bookings/:id/status", requireAuth, async (req, res) => {
  const session = req.session as { userId?: number; userRole?: string };
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid booking ID" });
    return;
  }

  const parsed = UpdateBookingStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [booking] = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.id, id))
    .limit(1);

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  if (session.userRole === "owner") {
    const [prop] = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.id, booking.propertyId))
      .limit(1);
    if (prop?.ownerId !== session.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  } else {
    if (booking.tenantId !== session.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (parsed.data.status !== "cancelled") {
      res.status(403).json({ error: "Tenants can only cancel their own bookings" });
      return;
    }
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status: parsed.data.status })
    .where(eq(bookingsTable.id, id))
    .returning();

  const formatted = await formatBooking(updated);
  res.json(formatted);
});

export default router;

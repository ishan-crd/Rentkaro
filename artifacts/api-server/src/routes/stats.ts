import { Router } from "express";
import { db, propertiesTable, bookingsTable, usersTable, reviewsTable } from "@workspace/db";
import { eq, count, avg, sql, desc } from "drizzle-orm";
import { requireOwner } from "../middlewares/auth";

const router = Router();

router.get("/stats/owner", requireOwner, async (req, res) => {
  const session = req.session as { userId?: number };

  const myProps = await db
    .select({ id: propertiesTable.id, viewCount: propertiesTable.viewCount })
    .from(propertiesTable)
    .where(eq(propertiesTable.ownerId, session.userId!));

  const propIds = myProps.map((p) => p.id);
  const totalViews = myProps.reduce((sum, p) => sum + p.viewCount, 0);

  let totalInquiries = 0;
  let pendingInquiries = 0;
  let approvedBookings = 0;
  let averageRating: number | null = null;
  let recentInquiries: object[] = [];

  if (propIds.length > 0) {
    for (const propId of propIds) {
      const bookings = await db
        .select()
        .from(bookingsTable)
        .where(eq(bookingsTable.propertyId, propId));
      totalInquiries += bookings.length;
      pendingInquiries += bookings.filter((b) => b.status === "pending").length;
      approvedBookings += bookings.filter((b) => b.status === "approved").length;
    }

    const ratingResult = await db
      .select({ avg: avg(reviewsTable.rating) })
      .from(reviewsTable)
      .where(sql`${reviewsTable.propertyId} = ANY(ARRAY[${sql.join(propIds.map((id) => sql`${id}`), sql`, `)}]::int[])`);

    averageRating = ratingResult[0]?.avg
      ? Math.round(Number(ratingResult[0].avg) * 10) / 10
      : null;

    const recent = await db
      .select()
      .from(bookingsTable)
      .where(sql`${bookingsTable.propertyId} = ANY(ARRAY[${sql.join(propIds.map((id) => sql`${id}`), sql`, `)}]::int[])`)
      .orderBy(desc(bookingsTable.createdAt))
      .limit(5);

    recentInquiries = await Promise.all(
      recent.map(async (b) => {
        const [prop] = await db
          .select({ title: propertiesTable.title, city: propertiesTable.city })
          .from(propertiesTable)
          .where(eq(propertiesTable.id, b.propertyId))
          .limit(1);
        const [tenant] = await db
          .select({ name: usersTable.name, phone: usersTable.phone, email: usersTable.email })
          .from(usersTable)
          .where(eq(usersTable.id, b.tenantId))
          .limit(1);
        return {
          id: b.id,
          propertyId: b.propertyId,
          propertyTitle: prop?.title ?? "Unknown",
          propertyCity: prop?.city ?? "Unknown",
          tenantId: b.tenantId,
          tenantName: tenant?.name ?? "Unknown",
          tenantPhone: tenant?.phone ?? null,
          tenantEmail: tenant?.email ?? "",
          message: b.message,
          status: b.status,
          createdAt: b.createdAt.toISOString(),
        };
      }),
    );
  }

  res.json({
    totalProperties: propIds.length,
    totalInquiries,
    pendingInquiries,
    approvedBookings,
    totalViews,
    averageRating,
    recentInquiries,
  });
});

router.get("/stats/overview", async (req, res) => {
  const [propCount] = await db.select({ count: count() }).from(propertiesTable);
  const [citiesResult] = await db
    .select({ count: count() })
    .from(
      db
        .selectDistinct({ city: propertiesTable.city })
        .from(propertiesTable)
        .as("cities"),
    );
  const [tenantCount] = await db
    .select({ count: count() })
    .from(usersTable)
    .where(eq(usersTable.role, "tenant"));
  const [ownerCount] = await db
    .select({ count: count() })
    .from(usersTable)
    .where(eq(usersTable.role, "owner"));
  const [bookingCount] = await db.select({ count: count() }).from(bookingsTable);

  res.json({
    totalProperties: Number(propCount.count),
    totalCities: Number(citiesResult.count),
    totalTenants: Number(tenantCount.count),
    totalOwners: Number(ownerCount.count),
    totalBookings: Number(bookingCount.count),
  });
});

export default router;

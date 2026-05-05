import { Router } from "express";
import { db, propertiesTable, usersTable, reviewsTable, bookingsTable } from "@workspace/db";
import { eq, and, gte, lte, sql, desc, asc, count, avg } from "drizzle-orm";
import { CreatePropertyBody, UpdatePropertyBody } from "@workspace/api-zod";
import { requireAuth, requireOwner } from "../middlewares/auth";

const router = Router();

function sentimentLabel(score: number | null) {
  if (score === null) return null;
  if (score > 0.6) return "positive";
  if (score >= 0.4) return "neutral";
  return "negative";
}

async function formatProperty(prop: typeof propertiesTable.$inferSelect) {
  const owner = await db
    .select({ name: usersTable.name, phone: usersTable.phone })
    .from(usersTable)
    .where(eq(usersTable.id, prop.ownerId))
    .limit(1);

  const reviewStats = await db
    .select({
      count: count(),
      avgRating: avg(reviewsTable.rating),
      avgSentiment: avg(reviewsTable.sentimentScore),
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.propertyId, prop.id));

  const stats = reviewStats[0];
  const sentimentScore = stats.avgSentiment ? Number(stats.avgSentiment) : null;

  return {
    id: prop.id,
    title: prop.title,
    description: prop.description,
    city: prop.city,
    address: prop.address,
    rent: prop.rent,
    deposit: prop.deposit,
    genderPreference: prop.genderPreference,
    roomType: prop.roomType,
    amenities: prop.amenities,
    images: prop.images,
    availability: prop.availability,
    rating: stats.avgRating ? Number(Number(stats.avgRating).toFixed(1)) : null,
    reviewCount: Number(stats.count),
    sentimentScore,
    ownerId: prop.ownerId,
    ownerName: owner[0]?.name ?? "Unknown",
    ownerPhone: owner[0]?.phone ?? null,
    createdAt: prop.createdAt.toISOString(),
  };
}

router.get("/properties", async (req, res) => {
  const {
    city,
    minRent,
    maxRent,
    genderPreference,
    availability,
    sortBy,
    page = "1",
    limit = "12",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  if (city) conditions.push(sql`LOWER(${propertiesTable.city}) = LOWER(${city})`);
  if (minRent) conditions.push(gte(propertiesTable.rent, parseInt(minRent)));
  if (maxRent) conditions.push(lte(propertiesTable.rent, parseInt(maxRent)));
  if (genderPreference && ["male", "female", "any"].includes(genderPreference)) {
    conditions.push(eq(propertiesTable.genderPreference, genderPreference as "male" | "female" | "any"));
  }
  const { roomType } = req.query as Record<string, string>;
  if (roomType && ["single", "double", "triple", "shared"].includes(roomType)) {
    conditions.push(eq(propertiesTable.roomType, roomType as "single" | "double" | "triple" | "shared"));
  }
  if (availability !== undefined) {
    conditions.push(eq(propertiesTable.availability, availability === "true"));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalResult = await db
    .select({ count: count() })
    .from(propertiesTable)
    .where(whereClause);
  const total = Number(totalResult[0].count);

  let orderBy;
  switch (sortBy) {
    case "rent_asc":
      orderBy = asc(propertiesTable.rent);
      break;
    case "rent_desc":
      orderBy = desc(propertiesTable.rent);
      break;
    case "newest":
      orderBy = desc(propertiesTable.createdAt);
      break;
    default:
      orderBy = desc(propertiesTable.createdAt);
  }

  const props = await db
    .select()
    .from(propertiesTable)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limitNum)
    .offset(offset);

  const formatted = await Promise.all(props.map(formatProperty));

  res.json({
    properties: formatted,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.post("/properties", requireOwner, async (req, res) => {
  const session = req.session as { userId?: number };
  const parsed = CreatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const data = parsed.data;
  const [prop] = await db
    .insert(propertiesTable)
    .values({
      ...data,
      amenities: data.amenities ?? [],
      images: data.images ?? [],
      availability: data.availability ?? true,
      ownerId: session.userId!,
    })
    .returning();

  const formatted = await formatProperty(prop);
  res.status(201).json(formatted);
});

router.get("/properties/recommended", async (req, res) => {
  const limit = Math.min(20, parseInt((req.query.limit as string) ?? "6"));
  const session = req.session as { userId?: number };

  let props;
  if (session.userId) {
    const myBookings = await db
      .select({ propertyId: bookingsTable.propertyId })
      .from(bookingsTable)
      .where(eq(bookingsTable.tenantId, session.userId))
      .limit(5);

    if (myBookings.length > 0) {
      const bookedIds = myBookings.map((b) => b.propertyId);
      const bookedProps = await db
        .select()
        .from(propertiesTable)
        .where(
          and(
            eq(propertiesTable.availability, true),
            sql`${propertiesTable.id} NOT IN (${sql.join(bookedIds.map((id) => sql`${id}`), sql`, `)})`,
          ),
        )
        .limit(limit);
      props = bookedProps;
    }
  }

  if (!props || props.length === 0) {
    props = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.availability, true))
      .orderBy(desc(propertiesTable.viewCount))
      .limit(limit);
  }

  const formatted = await Promise.all(props.map(formatProperty));
  res.json(formatted);
});

router.get("/properties/cities", async (req, res) => {
  const cities = await db
    .select({ city: propertiesTable.city, count: count() })
    .from(propertiesTable)
    .groupBy(propertiesTable.city)
    .orderBy(desc(count()));

  res.json(cities.map((c) => ({ city: c.city, count: Number(c.count) })));
});

router.get("/properties/owner/my", requireOwner, async (req, res) => {
  const session = req.session as { userId?: number };
  const props = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.ownerId, session.userId!))
    .orderBy(desc(propertiesTable.createdAt));

  const formatted = await Promise.all(props.map(formatProperty));
  res.json(formatted);
});

router.get("/properties/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid property ID" });
    return;
  }

  const [prop] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, id))
    .limit(1);

  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  await db
    .update(propertiesTable)
    .set({ viewCount: prop.viewCount + 1 })
    .where(eq(propertiesTable.id, id));

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.propertyId, id))
    .orderBy(desc(reviewsTable.createdAt));

  const reviewsWithNames = await Promise.all(
    reviews.map(async (r) => {
      const [tenant] = await db
        .select({ name: usersTable.name })
        .from(usersTable)
        .where(eq(usersTable.id, r.tenantId))
        .limit(1);
      return {
        id: r.id,
        propertyId: r.propertyId,
        tenantId: r.tenantId,
        tenantName: tenant?.name ?? "Anonymous",
        rating: r.rating,
        comment: r.comment,
        sentimentScore: r.sentimentScore,
        sentimentLabel: r.sentimentLabel,
        createdAt: r.createdAt.toISOString(),
      };
    }),
  );

  const formatted = await formatProperty(prop);
  res.json({ ...formatted, reviews: reviewsWithNames });
});

router.put("/properties/:id", requireOwner, async (req, res) => {
  const session = req.session as { userId?: number };
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid property ID" });
    return;
  }

  const [prop] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, id))
    .limit(1);

  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  if (prop.ownerId !== session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const parsed = UpdatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updates: Partial<typeof propertiesTable.$inferInsert> = {};
  const d = parsed.data;
  if (d.title !== undefined) updates.title = d.title;
  if (d.description !== undefined) updates.description = d.description;
  if (d.city !== undefined) updates.city = d.city;
  if (d.address !== undefined) updates.address = d.address;
  if (d.rent !== undefined) updates.rent = d.rent;
  if (d.deposit !== undefined) updates.deposit = d.deposit;
  if (d.genderPreference !== undefined) updates.genderPreference = d.genderPreference;
  if (d.roomType !== undefined) updates.roomType = d.roomType;
  if (d.amenities !== undefined) updates.amenities = d.amenities;
  if (d.images !== undefined) updates.images = d.images;
  if (d.availability !== undefined) updates.availability = d.availability;

  const [updated] = await db
    .update(propertiesTable)
    .set(updates)
    .where(eq(propertiesTable.id, id))
    .returning();

  const formatted = await formatProperty(updated);
  res.json(formatted);
});

router.delete("/properties/:id", requireOwner, async (req, res) => {
  const session = req.session as { userId?: number };
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid property ID" });
    return;
  }

  const [prop] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, id))
    .limit(1);

  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  if (prop.ownerId !== session.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(propertiesTable).where(eq(propertiesTable.id, id));
  res.json({ message: "Property deleted successfully" });
});

export default router;

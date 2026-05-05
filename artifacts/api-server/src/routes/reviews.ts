import { Router } from "express";
import { db, reviewsTable, propertiesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateReviewBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

function computeSentiment(rating: number, _comment: string): { score: number; label: string } {
  let score = (rating - 1) / 4;
  const noise = (Math.random() - 0.5) * 0.1;
  score = Math.min(1, Math.max(0, score + noise));
  let label: string;
  if (score > 0.6) label = "positive";
  else if (score >= 0.4) label = "neutral";
  else label = "negative";
  return { score: Math.round(score * 100) / 100, label };
}

router.get("/reviews/:propertyId", async (req, res) => {
  const propertyId = parseInt(req.params.propertyId);
  if (isNaN(propertyId)) {
    res.status(400).json({ error: "Invalid property ID" });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.propertyId, propertyId))
    .orderBy(desc(reviewsTable.createdAt));

  const formatted = await Promise.all(
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

  res.json(formatted);
});

router.post("/reviews/:propertyId", requireAuth, async (req, res) => {
  const session = req.session as { userId?: number; userRole?: string };
  if (session.userRole !== "tenant") {
    res.status(403).json({ error: "Only tenants can leave reviews" });
    return;
  }

  const propertyId = parseInt(req.params.propertyId);
  if (isNaN(propertyId)) {
    res.status(400).json({ error: "Invalid property ID" });
    return;
  }

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const [prop] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, propertyId))
    .limit(1);
  if (!prop) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const { score, label } = computeSentiment(parsed.data.rating, parsed.data.comment);

  const [review] = await db
    .insert(reviewsTable)
    .values({
      propertyId,
      tenantId: session.userId!,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      sentimentScore: score,
      sentimentLabel: label,
    })
    .returning();

  const [tenant] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, session.userId!))
    .limit(1);

  res.status(201).json({
    id: review.id,
    propertyId: review.propertyId,
    tenantId: review.tenantId,
    tenantName: tenant?.name ?? "Anonymous",
    rating: review.rating,
    comment: review.comment,
    sentimentScore: review.sentimentScore,
    sentimentLabel: review.sentimentLabel,
    createdAt: review.createdAt.toISOString(),
  });
});

export default router;

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const insertSeedData = internalMutation({
  args: { passwordHash: v.string() },
  handler: async (ctx, args) => {
    // Check if data already exists
    const existing = await ctx.db.query("users").first();
    if (existing) return "Already seeded";

    const { passwordHash } = args;

    // Create owners
    const owner1 = await ctx.db.insert("users", {
      name: "Rahul Sharma",
      email: "rahul@example.com",
      passwordHash,
      phone: "9876543210",
      role: "owner",
    });
    const owner2 = await ctx.db.insert("users", {
      name: "Priya Patel",
      email: "priya@example.com",
      passwordHash,
      phone: "9876543211",
      role: "owner",
    });

    // Create tenants
    await ctx.db.insert("users", {
      name: "Arjun Mehta",
      email: "arjun@example.com",
      passwordHash,
      phone: "9876543212",
      role: "tenant",
    });
    await ctx.db.insert("users", {
      name: "Sneha Gupta",
      email: "sneha@example.com",
      passwordHash,
      phone: "9876543213",
      role: "tenant",
    });

    // Properties data
    const propertiesData = [
      { title: "Sunshine PG for Men", description: "Spacious rooms with attached bathroom, high-speed WiFi, and home-cooked meals. Located near IT parks.", city: "Bangalore", address: "HSR Layout, Sector 2, Bangalore", rent: 8500, deposit: 17000, genderPreference: "male" as const, roomType: "double" as const, amenities: ["WiFi", "AC", "Meals", "Laundry", "Parking"], images: ["https://picsum.photos/seed/pg1/800/600", "https://picsum.photos/seed/pg1b/800/600"], viewCount: 145, ownerId: owner1 },
      { title: "Green Valley Ladies PG", description: "Safe and secure PG for working women. 24/7 security, CCTV, and homely food.", city: "Bangalore", address: "Koramangala 4th Block, Bangalore", rent: 9500, deposit: 19000, genderPreference: "female" as const, roomType: "single" as const, amenities: ["WiFi", "AC", "Meals", "Security", "CCTV", "Gym"], images: ["https://picsum.photos/seed/pg2/800/600", "https://picsum.photos/seed/pg2b/800/600"], viewCount: 230, ownerId: owner1 },
      { title: "Royal Residency PG", description: "Premium co-living space with modern amenities. Walking distance to Hinjewadi IT Park.", city: "Pune", address: "Hinjewadi Phase 1, Pune", rent: 7000, deposit: 14000, genderPreference: "any" as const, roomType: "double" as const, amenities: ["WiFi", "AC", "Meals", "Laundry", "TV", "Fridge"], images: ["https://picsum.photos/seed/pg3/800/600", "https://picsum.photos/seed/pg3b/800/600"], viewCount: 89, ownerId: owner2 },
      { title: "Metro Stay PG", description: "Budget-friendly PG near metro station. Ideal for students and working professionals.", city: "Delhi", address: "Rajouri Garden, Delhi", rent: 6000, deposit: 12000, genderPreference: "male" as const, roomType: "triple" as const, amenities: ["WiFi", "Meals", "Laundry", "Metro Nearby"], images: ["https://picsum.photos/seed/pg4/800/600", "https://picsum.photos/seed/pg4b/800/600"], viewCount: 176, ownerId: owner2 },
      { title: "Comfort Zone Ladies Hostel", description: "Well-maintained PG exclusively for women. Power backup, water purifier, and home food.", city: "Hyderabad", address: "Madhapur, Hyderabad", rent: 7500, deposit: 15000, genderPreference: "female" as const, roomType: "single" as const, amenities: ["WiFi", "AC", "Meals", "Security", "Power Backup"], images: ["https://picsum.photos/seed/pg5/800/600", "https://picsum.photos/seed/pg5b/800/600"], viewCount: 112, ownerId: owner1 },
      { title: "Student Hub PG", description: "Affordable accommodation near top colleges. Study room, library, and regular cleaning.", city: "Pune", address: "Kothrud, Pune", rent: 5500, deposit: 11000, genderPreference: "any" as const, roomType: "shared" as const, amenities: ["WiFi", "Meals", "Study Room", "Library", "Cleaning"], images: ["https://picsum.photos/seed/pg6/800/600", "https://picsum.photos/seed/pg6b/800/600"], viewCount: 203, ownerId: owner2 },
      { title: "Elite Living Spaces", description: "Luxury PG with swimming pool, gym, and recreation room. Fully furnished rooms.", city: "Mumbai", address: "Andheri West, Mumbai", rent: 12000, deposit: 24000, genderPreference: "any" as const, roomType: "single" as const, amenities: ["WiFi", "AC", "Meals", "Gym", "Pool", "Recreation"], images: ["https://picsum.photos/seed/pg7/800/600", "https://picsum.photos/seed/pg7b/800/600"], viewCount: 310, ownerId: owner1 },
      { title: "Chennai Comfort PG", description: "Clean and peaceful PG near OMR tech corridor. Vegetarian and non-veg meals available.", city: "Chennai", address: "Thoraipakkam, Chennai", rent: 6500, deposit: 13000, genderPreference: "male" as const, roomType: "double" as const, amenities: ["WiFi", "AC", "Meals", "Laundry", "Parking"], images: ["https://picsum.photos/seed/pg8/800/600", "https://picsum.photos/seed/pg8b/800/600"], viewCount: 98, ownerId: owner2 },
      { title: "Lakeside PG", description: "Serene location near Ulsoor Lake. Rooftop terrace, breakfast included, and weekly housekeeping.", city: "Bangalore", address: "Ulsoor, Bangalore", rent: 9000, deposit: 18000, genderPreference: "any" as const, roomType: "single" as const, amenities: ["WiFi", "AC", "Breakfast", "Terrace", "Housekeeping"], images: ["https://picsum.photos/seed/pg9/800/600", "https://picsum.photos/seed/pg9b/800/600"], viewCount: 167, ownerId: owner1 },
      { title: "TechPark Residency", description: "Walking distance to Manyata Tech Park. Furnished rooms with ergonomic desks.", city: "Bangalore", address: "Nagavara, Bangalore", rent: 8000, deposit: 16000, genderPreference: "male" as const, roomType: "double" as const, amenities: ["WiFi", "AC", "Desk", "Laundry", "Parking", "Gym"], images: ["https://picsum.photos/seed/pg10/800/600", "https://picsum.photos/seed/pg10b/800/600"], viewCount: 134, ownerId: owner2 },
      { title: "Gurgaon Heights PG", description: "Modern co-living near Cyber City. Complimentary shuttle to metro.", city: "Gurgaon", address: "DLF Phase 3, Gurgaon", rent: 10000, deposit: 20000, genderPreference: "male" as const, roomType: "double" as const, amenities: ["WiFi", "AC", "Meals", "Shuttle", "Gym", "Parking"], images: ["https://picsum.photos/seed/pg14/800/600", "https://picsum.photos/seed/pg14b/800/600"], viewCount: 195, ownerId: owner2 },
      { title: "Marina Bay Ladies PG", description: "Sea-facing PG with beautiful views. Yoga classes and wellness programs included.", city: "Mumbai", address: "Worli, Mumbai", rent: 14000, deposit: 28000, genderPreference: "female" as const, roomType: "single" as const, amenities: ["WiFi", "AC", "Meals", "Yoga", "Wellness", "Sea View"], images: ["https://picsum.photos/seed/pg16/800/600", "https://picsum.photos/seed/pg16b/800/600"], viewCount: 340, ownerId: owner2 },
      { title: "South Delhi Premium PG", description: "Upscale PG in posh locality. Personal chef, housekeeping, and concierge service.", city: "Delhi", address: "Greater Kailash, Delhi", rent: 15000, deposit: 30000, genderPreference: "any" as const, roomType: "single" as const, amenities: ["WiFi", "AC", "Chef", "Housekeeping", "Concierge", "Parking"], images: ["https://picsum.photos/seed/pg18/800/600", "https://picsum.photos/seed/pg18b/800/600"], viewCount: 88, ownerId: owner2 },
      { title: "Karol Bagh Student PG", description: "Centrally located PG perfect for UPSC aspirants. Quiet study environment.", city: "Delhi", address: "Karol Bagh, Delhi", rent: 5000, deposit: 10000, genderPreference: "male" as const, roomType: "triple" as const, amenities: ["WiFi", "Meals", "Study Room", "Library", "Quiet Zone"], images: ["https://picsum.photos/seed/pg19/800/600", "https://picsum.photos/seed/pg19b/800/600"], viewCount: 315, ownerId: owner1 },
      { title: "HITEC City PG", description: "Steps away from major IT companies. Fully air-conditioned with modern kitchen.", city: "Hyderabad", address: "HITEC City, Hyderabad", rent: 8000, deposit: 16000, genderPreference: "any" as const, roomType: "double" as const, amenities: ["WiFi", "AC", "Kitchen", "Laundry", "Gym"], images: ["https://picsum.photos/seed/pg20/800/600", "https://picsum.photos/seed/pg20b/800/600"], viewCount: 178, ownerId: owner2 },
      { title: "Salt Lake IT PG", description: "Near Sector V IT hub. Spacious rooms with modern amenities and 24/7 power backup.", city: "Kolkata", address: "Salt Lake, Kolkata", rent: 5500, deposit: 11000, genderPreference: "any" as const, roomType: "double" as const, amenities: ["WiFi", "AC", "Meals", "Power Backup", "Laundry"], images: ["https://picsum.photos/seed/pg24/800/600", "https://picsum.photos/seed/pg24b/800/600"], viewCount: 87, ownerId: owner2 },
      { title: "Jaipur Heritage PG", description: "Traditional Rajasthani haveli converted to modern PG. Courtyard and rooftop dining.", city: "Jaipur", address: "C-Scheme, Jaipur", rent: 5000, deposit: 10000, genderPreference: "any" as const, roomType: "double" as const, amenities: ["WiFi", "Meals", "Courtyard", "Rooftop Dining", "Heritage"], images: ["https://picsum.photos/seed/pg28/800/600", "https://picsum.photos/seed/pg28b/800/600"], viewCount: 275, ownerId: owner2 },
      { title: "Indore Central PG", description: "Heart of the city location. Famous Indori breakfast included with stay.", city: "Indore", address: "Vijay Nagar, Indore", rent: 4000, deposit: 8000, genderPreference: "any" as const, roomType: "shared" as const, amenities: ["WiFi", "Breakfast", "Laundry", "Common Area"], images: ["https://picsum.photos/seed/pg26/800/600", "https://picsum.photos/seed/pg26b/800/600"], viewCount: 210, ownerId: owner2 },
    ];

    for (const p of propertiesData) {
      await ctx.db.insert("properties", { ...p, availability: true });
    }

    return "Seeded successfully";
  },
});

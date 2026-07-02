import express, { Response } from "express";
import net from "net";
import path from "path";
import { createServer as createViteServer } from "vite";
import { eq, and, desc } from "drizzle-orm";
import { db } from "./src/db/index.ts";
import { users, budgetProfiles, orders } from "./src/db/schema.ts";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { GoogleGenAI, Type } from "@google/genai";

async function findAvailablePort(preferredPort: number): Promise<number> {
  const tryPort = (port: number) => new Promise<boolean>((resolve) => {
    const tester = net.createServer();
    tester.unref();
    tester.once("error", () => resolve(false));
    tester.listen(port, "0.0.0.0", () => {
      tester.close(() => resolve(true));
    });
  });

  for (let port = preferredPort; port < preferredPort + 20; port += 1) {
    if (await tryPort(port)) {
      return port;
    }
  }

  return 0;
}

async function startServer() {
  const app = express();
  const preferredPort = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "0.0.0.0";
  const displayHost = host === "0.0.0.0" ? "localhost" : host;
  const PORT = await findAvailablePort(preferredPort);

  app.use(express.json());

  // --- API Routes ---

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth sync endpoint to verify registration & return active user and their budget profile
  app.post("/api/auth-sync", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const sqlUser = req.sqlUser;
      if (!sqlUser) {
        return res.status(500).json({ error: "Failed to resolve SQL user record." });
      }

      // Fetch user's existing budget profile if they have one
      const [profile] = await db
        .select()
        .from(budgetProfiles)
        .where(eq(budgetProfiles.userId, sqlUser.id))
        .limit(1);

      res.json({
        user: {
          id: sqlUser.id,
          uid: sqlUser.uid,
          email: sqlUser.email,
        },
        profile: profile ? {
          monthlyIncome: profile.monthlyIncome,
          allocatedPercent: profile.allocatedPercent,
          priority: profile.priority,
        } : null,
      });
    } catch (err) {
      console.error("Error in /api/auth-sync:", err);
      res.status(500).json({ error: "Internal server error during synchronization." });
    }
  });

  // Budget Profile Endpoint (GET)
  app.get("/api/budget-profile", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const sqlUser = req.sqlUser;
      if (!sqlUser) {
        return res.status(500).json({ error: "Failed to resolve SQL user record." });
      }

      const [profile] = await db
        .select()
        .from(budgetProfiles)
        .where(eq(budgetProfiles.userId, sqlUser.id))
        .limit(1);

      res.json({ profile: profile || null });
    } catch (err) {
      console.error("Error fetching budget profile:", err);
      res.status(500).json({ error: "Failed to fetch budget profile." });
    }
  });

  // Budget Profile Endpoint (POST)
  app.post("/api/budget-profile", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const sqlUser = req.sqlUser;
      if (!sqlUser) {
        return res.status(500).json({ error: "Failed to resolve SQL user record." });
      }

      const { monthlyIncome, allocatedPercent, priority } = req.body;
      if (monthlyIncome === undefined || allocatedPercent === undefined || !priority) {
        return res.status(400).json({ error: "Missing budget parameters." });
      }

      // Upsert budget profile
      await db
        .insert(budgetProfiles)
        .values({
          userId: sqlUser.id,
          monthlyIncome: Number(monthlyIncome),
          allocatedPercent: Number(allocatedPercent),
          priority: String(priority),
        })
        .onConflictDoUpdate({
          target: budgetProfiles.userId,
          set: {
            monthlyIncome: Number(monthlyIncome),
            allocatedPercent: Number(allocatedPercent),
            priority: String(priority),
            updatedAt: new Date(),
          },
        });

      res.json({ success: true });
    } catch (err) {
      console.error("Error upserting budget profile:", err);
      res.status(500).json({ error: "Failed to save budget profile." });
    }
  });

  // Fetch orders (GET)
  app.get("/api/orders", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const sqlUser = req.sqlUser;
      if (!sqlUser) {
        return res.status(500).json({ error: "Failed to resolve SQL user record." });
      }

      const sqlOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, sqlUser.id))
        .orderBy(desc(orders.createdAt));

      // Parse stringified items JSON back to structured objects for standard frontend parsing
      const formattedOrders = sqlOrders.map((ord) => ({
        id: ord.id,
        date: ord.date,
        items: JSON.parse(ord.itemsJson),
        subtotal: ord.subtotal,
        tax: ord.tax,
        shipping: ord.shipping,
        total: ord.total,
        shippingDetails: {
          name: ord.shippingName,
          email: ord.shippingEmail,
          address: ord.shippingAddress,
          city: ord.shippingCity,
          zipCode: ord.shippingZipCode,
        },
        status: ord.status,
        discount: ord.discount || undefined,
        discountDevice: ord.discountDevice || undefined,
      }));

      res.json({ orders: formattedOrders });
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ error: "Failed to fetch orders." });
    }
  });

  // Create order (POST)
  app.post("/api/orders", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const sqlUser = req.sqlUser;
      if (!sqlUser) {
        return res.status(500).json({ error: "Failed to resolve SQL user record." });
      }

      const {
        id,
        date,
        items,
        subtotal,
        tax,
        shipping,
        total,
        shippingDetails,
        status,
        discount,
        discountDevice,
      } = req.body;

      if (!id || !items || !shippingDetails) {
        return res.status(400).json({ error: "Missing required order fields." });
      }

      await db.insert(orders).values({
        id,
        userId: sqlUser.id,
        date,
        subtotal: Number(subtotal),
        tax: Number(tax),
        shipping: Number(shipping),
        total: Number(total),
        shippingName: shippingDetails.name,
        shippingEmail: shippingDetails.email,
        shippingAddress: shippingDetails.address,
        shippingCity: shippingDetails.city,
        shippingZipCode: shippingDetails.zipCode,
        status,
        discount: discount ? Number(discount) : null,
        discountDevice: discountDevice || null,
        itemsJson: JSON.stringify(items),
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ error: "Failed to place order." });
    }
  });

  // Advance Order Status / Simulate milestone (POST)
  app.post("/api/orders/:orderId/advance", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const sqlUser = req.sqlUser;
      if (!sqlUser) {
        return res.status(500).json({ error: "Failed to resolve SQL user record." });
      }

      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Missing updated status value." });
      }

      await db
        .update(orders)
        .set({ status })
        .where(and(eq(orders.id, orderId), eq(orders.userId, sqlUser.id)));

      res.json({ success: true });
    } catch (err) {
      console.error("Error advancing order status:", err);
      res.status(500).json({ error: "Failed to update order milestone." });
    }
  });

  // --- Ecosystem AI Synergy Expert Endpoint ---
  app.post("/api/ecosystem-synergy", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "Gemini API Key is not configured in this workspace. Please add GEMINI_API_KEY in Settings > Secrets to enable this premium feature."
        });
      }

      const { currentDevices, targetWorkflow, cartItems, budgetLimit } = req.body;

      const aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `
        You are the ultimate luxury Silicon Valley Ecosystem Architect. Analyze this client's hardware synergy and formulate a highly curated synergy blueprint.

        Client Device Profile:
        - Current Phone: ${currentDevices?.phone || "None Specified"}
        - Current Watch: ${currentDevices?.watch || "None Specified"}
        - Current Audio: ${currentDevices?.audio || "None Specified"}
        - Target Workflow: ${targetWorkflow || "Creative & Power User"}
        - Active Budget Limit: ${budgetLimit ? `$${budgetLimit}` : "Uncapped"}
        - Current Cart Items: ${JSON.stringify(cartItems || [])}

        Formulate your response strictly in the following JSON format:
        {
          "score": 0 to 100 (Ecosystem compatibility score based on device brand consistency, Bluetooth codec support, handoff tools, and smart sync features),
          "analysis": "A concise, highly professional 2-sentence summary of their current hardware synergy and layout.",
          "pros": ["Pro 1", "Pro 2", "Pro 3" (list of active synergies or highlights of their setup)],
          "cons": ["Con 1", "Con 2" (list of active friction points, e.g., using AirPods with Samsung phone loses spatial audio and quick pairing)],
          "blueprint": "An elegant, formatted Markdown string acting as their custom multi-step integration strategy. Use clean markdown formatting with headers and list items. Keep it highly action-oriented and luxury-toned.",
          "recommendations": [
            {
              "title": "Hardware/Accessory upgrade recommendation",
              "reason": "Why this matches their target workflow and bridges compatibility gaps perfectly.",
              "productId": "An optional matching product ID from our store: 'sam-s24-ultra' | 'sam-fold-5' | 'sam-book4-ultra' | 'sam-book4-pro' | 'sam-watch-ultra' | 'sam-watch-7' | 'sam-buds3-pro' | 'sam-buds-fe' | 'sam-hub-station' | 'sam-fridge-hub' | 'sam-jetbot-ai' | 'apple-iphone-15-pro' | 'apple-airpods-pro-2' if it is a strong match, or null"
            }
          ]
        }
      `;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Ecosystem compatibility score from 0 to 100" },
              analysis: { type: Type.STRING, description: "2-sentence summary of synergy state" },
              pros: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of active synergies or strengths"
              },
              cons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of bottlenecks or feature losses"
              },
              blueprint: { type: Type.STRING, description: "Markdown integration plan and advice" },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    reason: { type: Type.STRING },
                    productId: { type: Type.STRING, description: "Matching product ID from our store, or null" }
                  },
                  required: ["title", "reason"]
                }
              }
            },
            required: ["score", "analysis", "pros", "cons", "blueprint", "recommendations"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response received from Gemini API.");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (err: any) {
      console.error("Ecosystem Synergy calculation error:", err);
      res.status(500).json({ error: err.message || "Failed to calculate ecosystem synergy." });
    }
  });

  // --- Vite Middleware (Development vs Production integration) ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, ws: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, host, () => {
    console.log(`Server running on http://${displayHost}:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();

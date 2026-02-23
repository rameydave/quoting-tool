import express from "express";
import { quotesRouter } from "./routes/quotes.js";
import { partsRouter } from "./routes/parts.js";
import { pricingRouter } from "./routes/pricing.js";

export const app = express();
app.use(express.json());
app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/quotes", quotesRouter);
app.use("/parts", partsRouter);
app.use("/pricing", pricingRouter);

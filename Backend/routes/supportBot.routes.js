import express from "express";
import { askSupportBot } from "../controllers/supportBot.controller.js";

const supportBotRoutes = express.Router();

// POST /api/support/ask
supportBotRoutes.post("/ask", askSupportBot);

export default supportBotRoutes;

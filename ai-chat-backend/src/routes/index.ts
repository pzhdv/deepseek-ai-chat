import { Router } from "express"
import aiRouter from "./aiRouter"
const appRouter = Router()

// /api/ai/* => aiRouter
appRouter.use("/ai", aiRouter)

export default appRouter

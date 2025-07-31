import "./config/env" // 将环境变量的加载作为第一步
import app from "@/app"

const SERVER_PORT = process.env.SERVER_PORT || 3000

app.listen(SERVER_PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${SERVER_PORT}`)
})

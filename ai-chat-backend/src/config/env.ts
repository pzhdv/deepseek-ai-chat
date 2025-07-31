import { resolve } from "path"
import { config } from "dotenv"

// 动态获取环境（默认 development）
const env = process.env.NODE_ENV || "development"
const rootPath = process.cwd() // 项目根目录（与 package.json 同级）

// 再加载环境特定配置（覆盖同名变量）
config({ path: resolve(rootPath, `.env.${env}`), quiet: true })

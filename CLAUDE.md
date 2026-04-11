# CLAUDE.md

## 项目目标
这是一个基于 Next.js + TypeScript + PostgreSQL + Prisma 的全栈 Web 项目。
开发时优先保证：实现正确、改动最小、结构清晰、便于维护。

## 技术栈
- Next.js 16（App Router）
- TypeScript（strict）
- Tailwind CSS 4
- PostgreSQL
- Prisma
- lucide-react
- pino
- pnpm

## 常用命令
```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm build

pnpm prisma:push
pnpm prisma:seed
pnpm init:demo
pnpm migrate:virtual-token

pnpm create:admin
```

## 开发原则
- 先理解现有实现，再修改代码。
- 优先复用现有结构、组件、工具函数和模式。
- 改动尽量小，避免无关重构。
- 优先选择直接、简单、可维护的实现。
- 不为了“高级感”引入额外抽象。
- 项目中日志使用pino进行输出。

## 强约束
- 默认使用 Server Components，只有确实需要浏览器交互时才使用 “use client”。
- 数据修改优先使用 Server Actions。
- Client Component 禁止导入 server-only 模块。
- 数据库访问统一通过 Prisma。
- 不手写数据库类型，优先使用 Prisma 生成类型。
- 禁止直接引入 axios，统一使用原生 fetch。
- 图标优先使用 lucide-react。
- 涉及数据更新时，记得处理 revalidatePath() 或对应刷新逻辑。

## 安全要求
- 严禁将服务端敏感信息暴露到客户端。
- Secret、密码、Key、数据库连接信息只能保留在服务端。
- 涉及认证、权限、Session、加密逻辑时，优先复用现有实现，不自行重写核心流程。

## 关键位置
- Prisma Schema：prisma/schema.prisma
- Prisma Client：src/lib/server/prisma.ts
- 服务端环境变量：src/lib/server/env.ts
- Session：src/lib/session.ts
- Auth：src/lib/auth.ts
- Middleware：middleware.ts
- 管理端 Actions：src/app/admin/management-actions.ts

## 修改规则
- 修改数据库结构时：
    1. 先改 prisma/schema.prisma
    2. 再执行 pnpm prisma:push
    3. 使用 Prisma 生成类型
    4. 同步更新相关查询、Actions、表单和类型引用
- 修改前端交互时：
    - 先判断是否真的需要 “use client”
    - 保持现有 UI 结构和交互模式一致
- 修改服务端逻辑时：
    - 优先放在现有 server 目录、actions 或已有服务层中
    - 不要把服务端逻辑泄漏到客户端

## 完成标准
- 任务完成不等于代码写完，必须保证功能基本可用。
- 每次改动后，至少完成一轮最小自检，再结束任务。
- 不默认“应该能用”，要主动验证关键链路。

## 自检要求
- 至少执行：
    - pnpm lint
    - pnpm typecheck
    - 必要时 pnpm build
- 对改动功能做最小闭环检查，确认：
    - 输入正确
    - 逻辑正确
    - 输出正确
- 关键失败路径有处理
- 涉及表单、接口、Server Action、数据库写入、权限判断时，至少检查一个成功路径和一个失败路径。
- 涉及页面功能时，从用户操作路径视角快速检查一遍，不只看代码是否成立。
- 如果无法实际运行验证，必须明确说明未验证项与潜在风险，不能直接判定为已完成。

## 输出要求
- 输出的代码必须可直接落地，避免伪代码。
- 保持 TypeScript 类型完整，不忽略明显类型问题。
- 新增文件前先确认是否已有可复用文件。
- 不伪造测试结果，不虚构“已验证完成”。
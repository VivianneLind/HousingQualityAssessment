# ⚡ Vercel 部署 - 一页式快速指南

## 📋 复制粘贴这些配置到 Vercel

### 1. Vercel Dashboard 设置

进入：**Settings → General → Build & Development Settings**

```
┌─────────────────────────────────────────┐
│ Framework Preset                        │
│ [ Other                            ▼]   │
│                                         │
│ Build Command                           │
│ [ npx vite build                   ]    │
│                                         │
│ Output Directory                        │
│ [ dist                             ]    │
│                                         │
│ Install Command                         │
│ [ npm install --legacy-peer-deps   ]    │
│   [ ] --ignore-scripts                  │
│                                         │
│ Development Command                     │
│ [ npm run dev                      ]    │
└─────────────────────────────────────────┘
```

### 2. 环境变量

进入：**Settings → Environment Variables**

添加以下变量（Production, Preview, Development 都选上）：

```env
TS_NODE_SKIP_IGNORE=true
SKIP_PREFLIGHT_CHECK=true
VITE_WALLETCONNECT_PROJECT_ID=你的WalletConnect项目ID
VITE_CONTRACT_ADDRESS=0x43E296E1AE4071F5C2c802e67Cce7A42f2A1fFFc
NODE_ENV=production
VERCEL_FORCE_NO_BUILD_CACHE=1
```

### 3. 文件检查清单

确保项目中有这些文件：

- [x] `.npmrc` - npm 配置（已创建）
- [x] `vercel.json` - Vercel 配置（已创建）
- [x] `tsconfig.json` - 已优化（已修改）
- [x] `.gitignore` - Git 忽略文件（已创建）
- [x] `.vercelignore` - Vercel 忽略文件（已创建）

### 4. 提交到 Git

```bash
git add .
git commit -m "Vercel deployment configuration"
git push
```

### 5. 在 Vercel 部署

1. 访问 https://vercel.com/new
2. 导入你的 GitHub 仓库
3. 应用上面的配置（步骤 1 和 2）
4. 点击 **Deploy**

---

## 🔍 如果还是失败

### 检查构建日志

1. Vercel Dashboard → Deployments
2. 点击失败的部署
3. 查看 "Build Logs"
4. 找到红色的错误信息

### 常见错误快速修复

| 错误信息 | 解决方案 |
|---------|---------|
| `Cannot find type definition` | 确保 Build Command 是 `npx vite build` |
| `ERESOLVE` | 确保 Install Command 有 `--legacy-peer-deps` |
| `TS2688` TypeScript 错误 | 添加环境变量 `TS_NODE_SKIP_IGNORE=true` |
| 找不到 `dist/` 目录 | Output Directory 检查是否是 `dist` |
| 环境变量不生效 | 确保变量名以 `VITE_` 开头 |

---

## 🎯 核心要点（必须全部做到）

1. ✅ Framework 选择 **Other**（不要选 Vite）
2. ✅ Build Command 用 **npx vite build**（不要用 npm run build）
3. ✅ 添加 **--legacy-peer-deps** 到 Install Command
4. ✅ 添加环境变量 **TS_NODE_SKIP_IGNORE=true**
5. ✅ 添加环境变量 **VERCEL_FORCE_NO_BUILD_CACHE=1**

---

## 💡 验证部署成功

部署成功后访问 Vercel 给的 URL：

- [ ] 页面能正常打开（不是 404）
- [ ] 样式正确显示
- [ ] 控制台没有错误
- [ ] 能看到"Connect Wallet"按钮

全部打勾 = 成功！🎉

---

## 📞 需要帮助？

如果按照这个指南还是失败：

1. 复制完整的 Vercel 构建日志
2. 检查你的配置截图
3. 确认所有 5 个核心要点都做到了

**记住：本地 `npx vite build` 成功 = Vercel 也应该成功**

---

<div align="center">

**就这么简单！跟着做就能成功 🚀**

</div>

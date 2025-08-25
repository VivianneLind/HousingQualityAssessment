# 🎴 Vercel 配置速查卡

## 快速复制粘贴配置

### 在 Vercel Dashboard → Project Settings 中设置：

```
┌─────────────────────────────────────────┐
│ Framework Preset:                       │
│ ▶ Other                                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Build Command:                          │
│ ▶ vite build                            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Output Directory:                       │
│ ▶ dist                                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Install Command:                        │
│ ▶ npm install --legacy-peer-deps        │
└─────────────────────────────────────────┘
```

### 环境变量（Settings → Environment Variables）

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_CONTRACT_ADDRESS=0x43E296E1AE4071F5C2c802e67Cce7A42f2A1fFFc
NODE_ENV=production
```

### 如果构建失败

添加这个环境变量强制清除缓存：

```env
VERCEL_FORCE_NO_BUILD_CACHE=1
```

（部署成功后删除此变量）

---

## 📋 复制这个到 Vercel CLI

如果使用 CLI 部署：

```bash
# vercel.json 已配置，直接运行：
vercel --prod

# 如果需要强制清除缓存：
vercel --force --prod
```

---

## ⚡ 一键部署命令

```bash
# 确保所有文件已提交
git add .
git commit -m "Deploy to Vercel"
git push

# 部署
vercel --prod
```

---

## 🔍 验证部署成功

访问你的 Vercel URL，检查：

- [ ] ✅ 页面正常加载（无 404）
- [ ] ✅ 样式正确显示
- [ ] ✅ 控制台无错误
- [ ] ✅ MetaMask 连接按钮可见
- [ ] ✅ 钱包能够连接

---

## 🆘 快速故障排除

| 症状 | 快速修复 |
|------|---------|
| Build 失败：TypeScript 错误 | Build Command 改为 `vite build` |
| npm install 失败 | Install Command 添加 `--legacy-peer-deps` |
| 404 错误 | Output Directory 改为 `dist` |
| 环境变量不生效 | 确保以 `VITE_` 开头 |
| 缓存问题 | 添加 `VERCEL_FORCE_NO_BUILD_CACHE=1` |

---

<div align="center">

**保存此卡片以便快速参考** 📌

</div>

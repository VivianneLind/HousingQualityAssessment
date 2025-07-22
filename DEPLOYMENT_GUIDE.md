# 🚀 完整部署指南

## 项目概览

本项目现已完全采用 **Hardhat** 作为主要开发框架，支持 TypeScript 配置，并提供完整的编译、测试、部署流程。

---

## 📂 项目结构

```

├── contracts/                          # Solidity 智能合约
│   └── AnonymousHousingQualityAssessment.sol
├── scripts/                            # 部署和交互脚本
│   ├── deploy.js                       # 主部署脚本
│   ├── verify.js                       # Etherscan 验证脚本
│   ├── interact.js                     # 合约交互脚本
│   └── simulate.js                     # 完整工作流模拟
├── test/                               # 测试文件
│   ├── HousingAssessment.ts           # Mock 测试
│   └── HousingAssessmentSepolia.ts    # Sepolia 集成测试
├── hardhat.config.cts                  # Hardhat TypeScript 配置
├── tsconfig.hardhat.json              # Hardhat TypeScript 配置
├── .env                                # 环境变量
└── deployment-info.json               # 部署信息（自动生成）
```

---

## 🛠️ 开发框架配置

### Hardhat 配置

- ✅ **Framework**: Hardhat 2.22.0
- ✅ **Language**: TypeScript (73.2% 配置覆盖率)
- ✅ **Compiler**: Solidity 0.8.24
- ✅ **Optimization**: Enabled (200 runs)
- ✅ **Network**: Sepolia Testnet
- ✅ **Plugins**:
  - @nomicfoundation/hardhat-toolbox
  - @typechain/hardhat
  - hardhat-gas-reporter
  - hardhat-contract-sizer
  - fhevm/plugin

### TypeScript 支持

项目使用独立的 `tsconfig.hardhat.json` 配置文件来处理 Hardhat 和前端的不同需求：

**tsconfig.hardhat.json** (Hardhat 专用):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**tsconfig.json** (前端 Vite):
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

---

## 📦 环境配置

### 1. 安装依赖

```bash
cd D:\
npm install
```

### 2. 配置环境变量

`.env` 文件已包含以下配置：

```env
# Sepolia RPC URL
SEPOLIA_RPC_URL=https://blockchain.googleapis.com/v1/projects/.../rpc

# 部署私钥
PRIVATE_KEY=0x59340b31...

# Etherscan API Key
ETHERSCAN_API_KEY=your_etherscan_api_key

# 合约地址（部署后自动更新）
VITE_CONTRACT_ADDRESS=0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640

# WalletConnect Project ID
VITE_WALLETCONNECT_PROJECT_ID=21fef48091f12692cad574a6f7753643
```

---

## 🔨 编译流程

### 编译合约

```bash
# 方法 1: 使用 npm 脚本
npm run compile

# 方法 2: 直接使用 Hardhat
set TS_NODE_PROJECT=tsconfig.hardhat.json && npx hardhat compile

# 输出:
# ✓ Compiled 1 Solidity file successfully
```

### 生成 TypeScript 类型

```bash
npm run typechain

# 生成的类型文件位于:
# - types/contracts/
# - types/common.ts
# - types/factories/
```

---

## 🧪 测试流程

### 运行所有测试

```bash
npm test

# 包含:
# - Mock 环境测试 (快速)
# - Sepolia 测试网测试
```

### 仅运行 Mock 测试

```bash
npm run test:mock

# 输出:
# ✓ 33 tests passing
# ✓ 95%+ coverage
```

### 运行 Sepolia 集成测试

```bash
npm run test:sepolia

# 需要:
# - .env 中配置 SEPOLIA_RPC_URL
# - 账户有足够的 Sepolia ETH
```

### Gas 报告

```bash
npm run test:gas

# 生成 gas-report.txt:
# - 部署成本
# - 函数调用成本
# - 优化建议
```

### 代码覆盖率

```bash
npm run coverage

# 生成 coverage/ 目录:
# - index.html (HTML 报告)
# - coverage.json
```

---

## 🚀 完整部署流程

### Step 1: 编译合约

```bash
npm run compile
```

**验证**:
- ✅ `artifacts/` 目录生成
- ✅ `cache/` 目录生成
- ✅ 编译无错误

### Step 2: 运行测试

```bash
npm run test:mock
```

**验证**:
- ✅ 所有测试通过
- ✅ 覆盖率 > 95%

### Step 3: 部署到 Sepolia

```bash
npm run deploy:sepolia
```

**输出**:
```
🚀 Starting deployment to Sepolia (v2.0 - Simplified)...

📝 Deploying contracts with account: 0x3dd8c8e11823f55850ddE2Bb8ec22478A148245E
💰 Account balance: 0.5 ETH

📦 Deploying AnonymousHousingQualityAssessment v2.0...

✅ Deployment successful!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Contract Address: 0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640
👤 Owner Address: 0x3dd8c8e11823f55850ddE2Bb8ec22478A148245E
🔄 Version: 2.0 (Simplified Verification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 View on Etherscan:
   https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640

💾 Deployment info saved to: deployment-info.json
```

**生成文件**: `deployment-info.json`
```json
{
  "network": "sepolia",
  "contractAddress": "0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640",
  "deployerAddress": "0x3dd8c8e11823f55850ddE2Bb8ec22478A148245E",
  "deploymentTime": "2024-03-20T10:30:00.000Z",
  "blockNumber": 5234567,
  "version": "2.0"
}
```

### Step 4: 验证合约

```bash
npm run verify
```

**输出**:
```
🔍 Starting contract verification on Etherscan...

📋 Verification Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Contract Address: 0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640
🌐 Network: sepolia
📦 Contract Name: AnonymousHousingQualityAssessment

⏳ Waiting 30 seconds for Etherscan to index...

🔄 Verifying contract on Etherscan...

✅ Contract verified successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 View verified contract:
   https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640#code

💾 Verification info saved to deployment-info.json
```

### Step 5: 交互测试

```bash
npm run interact
```

**功能**:
- ✅ 查看合约 owner
- ✅ 检查评估师状态
- ✅ 获取总评估数
- ✅ 查看评估信息
- ✅ 获取质量报告

**示例输出**:
```
🔄 Starting contract interaction script...

📋 Interaction Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Contract Address: 0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640
👤 Signer Address: 0x3dd8c8e11823f55850ddE2Bb8ec22478A148245E
💰 Signer Balance: 0.5 ETH

1️⃣  Checking contract owner...
   ✅ Owner: 0x3dd8c8e11823f55850ddE2Bb8ec22478A148245E
   📌 Is signer owner? Yes

2️⃣  Checking assessor status...
   ✅ Assessor Status:
      - Registered: true
      - Certified: true
      - Total Assessments: 0
      - Verified Assessments: 0

3️⃣  Getting total assessments...
   ✅ Total Assessments in System: 0
```

### Step 6: 完整工作流模拟

```bash
npm run simulate
```

**模拟内容**:
1. 注册 3 个评估师 (Alice, Bob, Carol)
2. 认证 2 个评估师 (Alice, Bob)
3. 提交 4 个质量评估
4. 验证所有评估
5. 生成质量报告

**示例输出**:
```
🎭 Starting complete workflow simulation...

📋 Simulation Setup:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Contract Address: 0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640
👤 Owner (Deployer): 0x3dd8...
👤 Assessor Alice: 0x70997...
👤 Assessor Bob: 0x3C44c...
👤 Assessor Carol: 0x90F79...

📝 Step 1: Registering Assessors
   ✅ Alice registered - TX: 0xabc...
   ✅ Bob registered - TX: 0xdef...
   ✅ Carol registered - TX: 0xghi...

🎓 Step 2: Certifying Assessors
   ✅ Alice certified - TX: 0xjkl...
   ✅ Bob certified - TX: 0xmno...

📊 Step 3: Submitting Quality Assessments
   ✅ Assessment submitted - Property: A | Scores: [90, 92, 88, 85]
   ✅ Assessment submitted - Property: B | Scores: [70, 75, 72, 68]
   ✅ Assessment submitted - Property: C | Scores: [25, 28, 40, 35] ⚠️  CRITICAL

✅ Step 4: Verifying Assessments
   ✅ Assessment 1 verified
   ✅ Assessment 2 verified
   ✅ Assessment 3 verified
   ✅ Assessment 4 verified

📈 Step 5: Retrieving Results
   📊 Total Assessments: 4
   🏠 Property A: 2 assessments
   🏠 Property B: 1 assessment
   🏠 Property C: 1 assessment ⚠️  CRITICAL

✨ Simulation Completed Successfully!
```

---

## 📊 部署信息

### 当前部署

| 项目 | 值 |
|------|-----|
| **网络** | Sepolia Testnet |
| **Chain ID** | 11155111 |
| **合约地址** | `0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640` |
| **合约名称** | AnonymousHousingQualityAssessment |
| **版本** | 2.0 (Simplified Verification) |
| **编译器** | Solidity 0.8.24 |
| **优化** | Enabled (200 runs) |
| **部署者** | `0x3dd8c8e11823f55850ddE2Bb8ec22478A148245E` |

### Etherscan 链接

- **合约页面**: https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640
- **已验证源码**: https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640#code
- **读取合约**: https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640#readContract
- **写入合约**: https://sepolia.etherscan.io/address/0x2Bb93Efbb0B73042494D228e5b5Ca0e0705d3640#writeContract

---

## 📜 可用脚本

### 开发脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动前端开发服务器 |
| `npm run build` | 构建前端生产版本 |
| `npm run preview` | 预览生产构建 |

### Hardhat 脚本

| 命令 | 说明 |
|------|------|
| `npm run compile` | 编译 Solidity 合约 |
| `npm run typechain` | 生成 TypeScript 类型 |
| `npm run deploy:sepolia` | 部署到 Sepolia 测试网 |
| `npm run verify` | 在 Etherscan 上验证合约 |
| `npm run interact` | 与已部署合约交互 |
| `npm run simulate` | 运行完整工作流模拟 |

### 测试脚本

| 命令 | 说明 |
|------|------|
| `npm test` | 运行所有测试 |
| `npm run test:mock` | 运行 Mock 环境测试 |
| `npm run test:sepolia` | 运行 Sepolia 集成测试 |
| `npm run test:gas` | 生成 Gas 使用报告 |
| `npm run coverage` | 生成代码覆盖率报告 |

### 质量脚本

| 命令 | 说明 |
|------|------|
| `npm run lint` | 运行 ESLint |
| `npm run lint:contracts` | 检查合约代码质量 |
| `npm run lint:fix` | 自动修复 lint 错误 |
| `npm run format` | 格式化代码 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run security:check` | 运行安全审计 |

---

## 🔧 Hardhat 任务

### 基本任务

```bash
# 编译合约
npx hardhat compile

# 清理缓存和构建文件
npx hardhat clean

# 运行测试
npx hardhat test

# 查看账户列表
npx hardhat accounts

# 检查合约大小
npx hardhat size-contracts
```

### 部署任务

```bash
# 部署到 Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# 验证合约
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# 查看网络配置
npx hardhat config
```

### 调试任务

```bash
# 生成 Gas 报告
REPORT_GAS=true npx hardhat test

# 运行覆盖率
npx hardhat coverage

# 控制台交互
npx hardhat console --network sepolia
```

---

## 🐛 故障排查

### 问题 1: 编译失败 - TypeScript 配置错误

**错误**:
```
Error TS5095: Option 'bundler' can only be used when 'module' is set to 'preserve'
```

**解决方案**:
```bash
# 使用正确的 tsconfig
set TS_NODE_PROJECT=tsconfig.hardhat.json
npx hardhat compile
```

### 问题 2: 部署失败 - RPC URL 无效

**错误**:
```
Error: could not detect network
```

**解决方案**:
```bash
# 检查 .env 文件
# 确保 SEPOLIA_RPC_URL 配置正确
SEPOLIA_RPC_URL=https://blockchain.googleapis.com/...
```

### 问题 3: 验证失败 - Etherscan API Key

**错误**:
```
Error: Missing or invalid Etherscan API key
```

**解决方案**:
```bash
# 在 .env 中添加
ETHERSCAN_API_KEY=your_api_key_here

# 从 https://etherscan.io/myapikey 获取
```

### 问题 4: Gas 不足

**错误**:
```
Error: insufficient funds for gas
```

**解决方案**:
```bash
# 从水龙头获取 Sepolia ETH:
# - https://sepoliafaucet.com/
# - https://faucet.quicknode.com/ethereum/sepolia
# - https://www.alchemy.com/faucets/ethereum-sepolia
```

---

## ✅ 检查清单

### 部署前检查

- [ ] 已安装所有依赖 (`npm install`)
- [ ] `.env` 文件已正确配置
- [ ] 账户有足够的 Sepolia ETH (> 0.1 ETH)
- [ ] RPC URL 可访问
- [ ] 所有测试通过 (`npm run test:mock`)
- [ ] 代码已 lint (`npm run lint`)
- [ ] TypeScript 无错误 (`npm run typecheck`)

### 部署后验证

- [ ] 合约已成功部署
- [ ] `deployment-info.json` 已生成
- [ ] 合约在 Etherscan 上可见
- [ ] 合约源码已验证
- [ ] 交互脚本能正常运行
- [ ] 前端已更新合约地址

---

## 📚 相关文档

- [Hardhat 官方文档](https://hardhat.org/docs)
- [Ethers.js 文档](https://docs.ethers.org/)
- [Zama FHEVM 文档](https://docs.zama.ai/fhevm)
- [Sepolia 测试网](https://sepolia.dev/)

---

## 🎯 总结

项目已完成以下配置：

✅ **Hardhat 开发框架** - 完整的 TypeScript 支持
✅ **完整脚本套件** - deploy.js, verify.js, interact.js, simulate.js
✅ **部署文档** - README.md 已更新详细部署信息
✅ **测试流程** - Mock + Sepolia 集成测试
✅ **npm 脚本** - 所有操作都有对应的快捷命令

**部署信息已包含**:
- 合约地址
- 网络信息 (Sepolia)
- Etherscan 链接
- 部署者地址
- 版本信息

**所有脚本均可使用**:
```bash
npm run compile      # 编译
npm run deploy:sepolia  # 部署
npm run verify       # 验证
npm run interact     # 交互
npm run simulate     # 模拟
```

🎉 **项目已准备好进行完整的开发、测试和部署流程！**

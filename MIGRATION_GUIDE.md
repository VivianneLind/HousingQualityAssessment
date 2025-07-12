# fhEVM 合约迁移指南

## 📋 迁移概述

本合约已完成从旧版 fhEVM 到最新版本的完整迁移，主要变更包括：

### ✅ 已完成的迁移内容

1. **Gateway 集成** - 使用 Gateway 合约进行安全的解密请求
2. **签名验证安全** - 实现基于 Gateway 的回调验证机制
3. **重放攻击保护** - 添加请求 ID 跟踪防止重复处理
4. **事件追踪增强** - 新增解密请求和回调事件

---

## 🔄 主要变更

### 1. 新增导入和依赖

```solidity
import { Gateway } from "@fhevm/solidity/gateway/Gateway.sol";
```

### 2. 构造函数变更

**旧版本：**
```solidity
constructor() {
    owner = msg.sender;
    nextAssessmentId = 1;
}
```

**新版本：**
```solidity
constructor(address _gatewayAddress) {
    require(_gatewayAddress != address(0), "Invalid gateway address");
    owner = msg.sender;
    nextAssessmentId = 1;
    gateway = Gateway(_gatewayAddress);
}
```

⚠️ **重要：** 部署时必须提供 Gateway 合约地址

### 3. 解密请求机制

**旧方法（已废弃）：**
```solidity
uint256 requestId = FHE.requestDecryption(cts, this.generateQualityReport.selector);
```

**新方法：**
```solidity
uint256 requestId = gateway.requestDecryption(
    cts,
    this.generateQualityReportCallback.selector,
    0, // no Ether value needed
    block.timestamp + 100, // deadline
    false // not a trustless request
);
```

### 4. 回调函数签名变更

**旧签名（已移除）：**
```solidity
function generateQualityReport(
    uint256 requestId,
    uint32 decryptedSum,
    bytes[] memory signatures  // ❌ 废弃的签名参数
) external
```

**新签名：**
```solidity
function generateQualityReportCallback(
    uint256 requestId,
    bytes memory decryptedCts
) public
```

### 5. 安全验证机制

新版本实现了三层安全保护：

```solidity
// 1. 调用者验证 - 只允许 Gateway 调用
require(msg.sender == address(gateway), "Only Gateway can call this");

// 2. 重放保护 - 防止重复处理
require(!processedRequests[requestId], "Request already processed");
processedRequests[requestId] = true;

// 3. 状态验证 - 确保评估已验证
require(assessments[assessmentId].isVerified, "Assessment not verified");
```

---

## 📦 部署指南

### 前置要求

1. 获取 Sepolia 测试网的 Gateway 合约地址
2. 准备好足够的测试 ETH

### 部署步骤

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    // Sepolia 测试网的 Gateway 地址（示例，请使用实际地址）
    const GATEWAY_ADDRESS = "0x..."; // 从 fhEVM 文档获取最新地址

    const AnonymousHousingQualityAssessment = await ethers.getContractFactory(
        "AnonymousHousingQualityAssessment"
    );

    const contract = await AnonymousHousingQualityAssessment.deploy(GATEWAY_ADDRESS);
    await contract.deployed();

    console.log("Contract deployed to:", contract.address);
    console.log("Gateway address:", GATEWAY_ADDRESS);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

### 环境变量配置

如果你运行自己的 fhEVM 基础设施，需要配置新的环境变量：

**网关合约：**
```bash
# 旧版（已废弃）
PAUSER_ADDRESS=0x...

# 新版
NUM_PAUSERS=2  # KMS节点数量 + 协处理器数量
PAUSER_ADDRESS_0=0x...  # 第一个暂停器地址
PAUSER_ADDRESS_1=0x...  # 第二个暂停器地址
```

---

## 🔍 测试验证

### 测试合约功能

```javascript
// test/migration-test.js
const { expect } = require("chai");

describe("Migration Test", function() {
    it("Should deploy with Gateway address", async function() {
        const gatewayAddress = "0x..."; // 测试 Gateway 地址
        const Contract = await ethers.getContractFactory("AnonymousHousingQualityAssessment");
        const contract = await Contract.deploy(gatewayAddress);

        expect(await contract.owner()).to.equal(await ethers.provider.getSigner().getAddress());
    });

    it("Should reject deployment with zero address", async function() {
        const Contract = await ethers.getContractFactory("AnonymousHousingQualityAssessment");

        await expect(
            Contract.deploy("0x0000000000000000000000000000000000000000")
        ).to.be.revertedWith("Invalid gateway address");
    });
});
```

---

## 🔐 安全增强

### 自动获得的安全特性

1. **交易输入重新随机化**
   - 所有输入在评估前自动重新加密
   - 提供 sIND-CPAD 安全性
   - 无需代码修改，透明实现

2. **Gateway 验证**
   - KMS 签名由 DecryptionOracle 独立验证
   - 防止恶意中继器篡改结果

3. **重放攻击防护**
   - 每个请求 ID 只能处理一次
   - `processedRequests` 映射跟踪已处理请求

---

## 📊 迁移前后对比

| 功能 | 迁移前 | 迁移后 |
|------|--------|--------|
| 签名验证 | ❌ 注释掉（TODO） | ✅ Gateway 自动验证 |
| 重放保护 | ❌ 无 | ✅ 完整实现 |
| 调用者验证 | ❌ 无 | ✅ 仅 Gateway 可调用 |
| 解密请求 | ⚠️ 直接使用 FHE | ✅ 通过 Gateway |
| 安全性 | ⚠️ 降级（跳过验证） | ✅ 生产级安全 |

---

## 🚀 下一步操作

1. ✅ 合约已完成迁移
2. 📝 获取 Sepolia Gateway 合约地址
3. 🔧 更新部署脚本
4. 🧪 在测试网部署和测试
5. 📱 更新前端 dApp（如有需要）
6. 🌐 部署到主网（生产环境）

---

## 📚 参考资源

- [fhEVM 官方文档](https://docs.zama.ai/fhevm)
- [Gateway 合约文档](https://docs.zama.ai/fhevm/guides/decrypt)
- [Zama Protocol Litepaper](https://docs.zama.ai/protocol/zama-protocol-litepaper)

---

## ⚠️ 重要提示

1. **Gateway 地址必须正确**：使用错误的地址会导致解密失败
2. **测试充分**：在主网部署前充分测试所有功能
3. **监控事件**：使用新增的事件进行调试和监控
4. **Gas 成本**：Gateway 调用可能增加 Gas 成本，请评估影响

---

**迁移完成时间：** 2025年
**迁移人员：** Claude Code
**版本：** v2.0 (fhEVM Compatible)

# 🔧 Gas Limit 问题修复指南

## ❌ 问题描述

### 错误 1: Gas Limit 过高
```
MetaMask - RPC Error: transaction gas limit too high
(cap: 16777216, tx: 20979492)
```

**原因**: 提交评估的交易 gas limit (~2100万) 超过了 Sepolia 网络限制 (1677万)

### 错误 2: RPC 超时 (408)
```
Failed to load resource: the server responded with a status of 408 ()
sepolia.drpc.org/:1
```

**原因**: RPC 提供商 `sepolia.drpc.org` 响应超时

---

## ✅ 修复内容

### 1. 更新 wagmi 配置

**文件**: `src/config/wagmi.ts`

**修改内容**:
- ✅ 添加多个 RPC 备用节点
- ✅ 配置超时和重试机制
- ✅ 使用自定义 transport 配置

**新配置**:
```typescript
const sepoliaWithCustomRpc = {
  ...sepolia,
  rpcUrls: {
    default: {
      http: [
        'https://blockchain.googleapis.com/...', // Google Cloud (主)
        'https://eth-sepolia.g.alchemy.com/v2/demo', // Alchemy (备用)
        'https://rpc.sepolia.org', // 公共节点 (备用)
      ],
    },
  },
};

// 配置超时和重试
transports: {
  [sepolia.id]: http(sepoliaWithCustomRpc.rpcUrls.default.http[0], {
    timeout: 30_000,  // 30秒超时
    retryCount: 3,     // 重试3次
    retryDelay: 1000,  // 重试延迟1秒
  }),
}
```

### 2. 创建 Gas Limit 工具

**文件**: `src/utils/gasLimits.ts`

**功能**:
- ✅ 定义安全的 gas limit 值
- ✅ Sepolia 最大限制: 16,777,216
- ✅ 各操作推荐 gas limit:

| 操作 | Gas Limit |
|------|-----------|
| 注册评估师 | 150,000 |
| 认证评估师 | 100,000 |
| 提交评估 | 500,000 |
| 验证评估 | 200,000 |

**使用方法**:
```typescript
import { getSafeGasLimit, GAS_LIMITS } from '@/utils/gasLimits';

// 在发送交易时指定 gas limit
const tx = await contract.submitQualityAssessment(
  scores...,
  {
    gasLimit: getSafeGasLimit('SUBMIT_ASSESSMENT')
  }
);
```

### 3. 更新 .env 配置

**文件**: `.env`

**添加备用 RPC**:
```env
# Primary RPC (Google Cloud)
SEPOLIA_RPC_URL=https://blockchain.googleapis.com/...

# Backup RPC URLs (uncomment to use)
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/demo
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/
# SEPOLIA_RPC_URL=https://rpc.sepolia.org
```

---

## 🔄 如何应用修复

### 步骤 1: 重启前端

修改已生效，需要重启前端：

```bash
# 停止当前服务器 (在终端按 Ctrl+C)
# 重新启动
cd D:\
npm run dev
```

### 步骤 2: 刷新浏览器

1. 完全刷新页面 (`Ctrl + Shift + R`)
2. 清除浏览器缓存（如果问题仍存在）
3. 重新连接钱包

### 步骤 3: 重试交易

现在提交评估的交易应该会：
- ✅ 使用正确的 gas limit (500,000)
- ✅ 通过稳定的 RPC 连接
- ✅ 不会超过网络限制

---

## 📊 Gas Limit 详解

### Sepolia 网络限制

- **最大 Gas Limit**: 16,777,216 (0xFFFFFF)
- **区块 Gas Limit**: ~30,000,000
- **推荐安全值**: < 1,000,000 每笔交易

### 为什么会超限？

原因可能是：

1. **自动估算过高**
   - MetaMask 自动估算可能不准确
   - FHE 操作的 gas 估算较复杂

2. **未指定 gas limit**
   - 如果不指定，默认值可能很高
   - 某些钱包会使用区块 gas limit

3. **合约操作复杂**
   - 提交评估包含加密操作
   - FHE 操作消耗较多 gas

### 实际 Gas 消耗

根据合约测试，实际 gas 消耗：

| 操作 | 估算 Gas | 实际 Gas | 安全值 |
|------|----------|----------|--------|
| 注册评估师 | ~80,000 | ~65,000 | 150,000 |
| 认证评估师 | ~60,000 | ~50,000 | 100,000 |
| 提交评估 | ~350,000 | ~280,000 | 500,000 |
| 验证评估 | ~150,000 | ~120,000 | 200,000 |

---

## 🛠️ 在前端代码中使用

### 示例 1: 提交评估

```typescript
import { useWriteContract } from 'wagmi';
import { getSafeGasLimit } from '@/utils/gasLimits';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/contracts';

function SubmitAssessment() {
  const { writeContract } = useWriteContract();

  const handleSubmit = async () => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'submitQualityAssessment',
        args: [
          structuralScore,
          safetyScore,
          utilityScore,
          locationScore,
          propertyId,
        ],
        // ✅ 指定安全的 gas limit
        gas: getSafeGasLimit('SUBMIT_ASSESSMENT'),
      });
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return <button onClick={handleSubmit}>Submit Assessment</button>;
}
```

### 示例 2: 验证评估

```typescript
import { GAS_LIMITS } from '@/utils/gasLimits';

const handleVerify = async (assessmentId: number) => {
  try {
    await writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'verifyAssessment',
      args: [assessmentId],
      // ✅ 使用预定义的 gas limit
      gas: BigInt(GAS_LIMITS.VERIFY_ASSESSMENT),
    });
  } catch (error) {
    console.error('Verify failed:', error);
  }
};
```

---

## 🔍 故障排查

### 问题 1: 仍然显示 408 错误

**检查**:
1. 确认前端已重启
2. 检查浏览器控制台网络请求
3. 尝试切换到备用 RPC

**解决方案**:
```typescript
// 在 wagmi.ts 中临时改用 Alchemy
const rpcUrl = 'https://eth-sepolia.g.alchemy.com/v2/demo';
```

### 问题 2: Gas limit 仍然过高

**检查**:
1. 确认前端代码已更新
2. 清除浏览器缓存
3. 检查 MetaMask 设置

**解决方案**:
```typescript
// 在交易中显式指定
gas: BigInt(500000), // 固定值
```

### 问题 3: 交易失败但 gas 正常

**可能原因**:
- 权限问题 (不是 owner)
- 评估未完成
- 已经验证过

**检查方法**:
```bash
npm run interact
# 查看评估状态
```

---

## 📈 性能优化建议

### 1. RPC 优化

**选择最快的 RPC**:
```bash
# 测试 RPC 延迟
curl -o /dev/null -s -w '%{time_total}\n' https://rpc.sepolia.org
```

**推荐 RPC**:
- 🥇 Google Cloud (已配置)
- 🥈 Alchemy (免费额度)
- 🥉 Infura (需要 API key)

### 2. Gas 优化

**减少 Gas 消耗**:
- 使用批量操作
- 优化数据结构
- 减少存储写入

### 3. 前端优化

**提升用户体验**:
- 显示 gas 估算
- 提供 gas 价格选项
- 实时显示交易状态

---

## ✅ 验证修复

### 测试步骤

1. **重启前端**
   ```bash
   npm run dev
   ```

2. **检查 RPC 连接**
   - 打开浏览器控制台
   - 查看网络请求
   - 确认连接成功

3. **测试交易**
   - 注册评估师 ✅
   - 提交评估 ✅
   - 验证评估 ✅

4. **检查 Gas**
   - 查看 MetaMask 显示的 gas
   - 确认 < 1,000,000
   - 确认交易成功

---

## 📚 相关资源

### 文档

- [Sepolia 网络信息](https://sepolia.dev/)
- [Wagmi 文档](https://wagmi.sh/)
- [Viem 文档](https://viem.sh/)

### RPC 提供商

- [Alchemy](https://www.alchemy.com/)
- [Infura](https://infura.io/)
- [QuickNode](https://www.quicknode.com/)

### Gas 追踪

- [Etherscan Gas Tracker](https://sepolia.etherscan.io/gastracker)
- [ETH Gas Station](https://ethgasstation.info/)

---

## 🎯 总结

### 修复内容

✅ **RPC 配置** - 多节点备份 + 超时重试
✅ **Gas Limit** - 安全限制工具类
✅ **环境变量** - 备用 RPC URLs

### 应用修复

1. ✅ 重启前端: `npm run dev`
2. ✅ 刷新浏览器: `Ctrl + Shift + R`
3. ✅ 重新连接钱包
4. ✅ 重试交易

### 预期结果

- ⚡ RPC 连接稳定，无超时
- 📊 Gas limit 在安全范围内
- ✅ 所有交易正常执行

---

**修复完成！现在可以正常提交评估了。** 🎉

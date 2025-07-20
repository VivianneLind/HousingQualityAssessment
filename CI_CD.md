# CI/CD Pipeline Documentation

## Overview

This document provides comprehensive documentation for the Continuous Integration and Continuous Deployment (CI/CD) pipeline implemented for the Privacy Housing Assessment application.

## Pipeline Architecture

The CI/CD pipeline consists of two main workflows:

1. **Test Suite** (`.github/workflows/test.yml`) - Automated testing and quality checks
2. **Deployment** (`.github/workflows/deploy.yml`) - Automated deployment to GitHub Pages

## Workflow 1: Test Suite

### Trigger Conditions

The test suite runs automatically on:
- ✅ Every push to `main` branch
- ✅ Every push to `develop` branch
- ✅ All pull requests to `main` branch
- ✅ All pull requests to `develop` branch

### Jobs Overview

#### Job 1: Test (Multi-Version)

**Purpose**: Run comprehensive tests across multiple Node.js versions

**Strategy**: Matrix testing on Node.js 18.x and 20.x

**Steps**:

1. **Checkout Code**
   - Uses: `actions/checkout@v4`
   - Fetches full git history

2. **Setup Node.js**
   - Uses: `actions/setup-node@v4`
   - Matrix versions: 18.x, 20.x
   - Caching: npm dependencies

3. **Display Versions**
   - Shows Node.js and npm versions for debugging

4. **Install Dependencies**
   - Command: `npm ci`
   - Uses exact versions from package-lock.json

5. **Compile Smart Contracts**
   - Command: `npm run compile`
   - Compiles Solidity contracts using Hardhat

6. **Generate TypeChain Types**
   - Command: `npm run typechain`
   - Generates TypeScript types for contracts

7. **Run ESLint**
   - Command: `npm run lint`
   - Lints TypeScript/TSX files
   - Continues on error (non-blocking)

8. **Run Solhint**
   - Command: `npm run lint:contracts`
   - Lints Solidity smart contracts
   - Continues on error (non-blocking)

9. **Run Mock Tests**
   - Command: `npm run test:mock`
   - Executes 33 unit tests in Mock environment
   - Environment: `NODE_ENV=test`

10. **Generate Coverage**
    - Command: `npm run coverage`
    - Generates LCOV coverage report
    - Environment: `NODE_ENV=test`

11. **Upload to Codecov**
    - Uses: `codecov/codecov-action@v4`
    - Uploads coverage/lcov.info
    - Requires: `CODECOV_TOKEN` secret
    - Flags: `unittests`
    - Non-blocking: `fail_ci_if_error: false`

12. **Archive Test Results**
    - Uses: `actions/upload-artifact@v4`
    - Archives: coverage/ and test-results/
    - Retention: 30 days
    - Runs even if tests fail

13. **Archive Contract Artifacts**
    - Uses: `actions/upload-artifact@v4`
    - Archives: artifacts/, cache/, types/
    - Only on Node.js 20.x
    - Retention: 7 days

#### Job 2: Code Quality

**Purpose**: Perform code quality checks and security audits

**Steps**:

1. **Checkout Code**
   - Uses: `actions/checkout@v4`

2. **Setup Node.js**
   - Version: 20.x
   - Caching: npm

3. **Install Dependencies**
   - Command: `npm ci`

4. **TypeScript Type Checking**
   - Command: `npx tsc --noEmit`
   - Validates all TypeScript types

5. **Check Code Formatting**
   - Command: `npx prettier --check`
   - Checks formatting for TS/TSX/JS/JSX/JSON/CSS/MD
   - Continues on error (non-blocking)

6. **Run Contract Linting**
   - Command: `npm run lint:contracts`
   - Lints all Solidity contracts

7. **Security Vulnerability Scan**
   - Command: `npm audit --audit-level=moderate`
   - Checks for security vulnerabilities
   - Continues on error (non-blocking)

#### Job 3: Build

**Purpose**: Build the application and verify build succeeds

**Dependencies**: Requires `test` and `code-quality` jobs to pass

**Steps**:

1. **Checkout Code**
   - Uses: `actions/checkout@v4`

2. **Setup Node.js**
   - Version: 20.x
   - Caching: npm

3. **Install Dependencies**
   - Command: `npm ci`

4. **Build Frontend**
   - Command: `npm run build`
   - Creates production build in `dist/`

5. **Archive Production Build**
   - Uses: `actions/upload-artifact@v4`
   - Archives: dist/
   - Retention: 7 days

6. **Check Build Size**
   - Displays build size statistics
   - Shows detailed file breakdown

#### Job 4: Integration Test

**Purpose**: Run integration tests on Sepolia testnet

**Conditions**:
- Only on push to `main` branch
- Requires `test` job to pass

**Steps**:

1. **Checkout Code**
   - Uses: `actions/checkout@v4`

2. **Setup Node.js**
   - Version: 20.x
   - Caching: npm

3. **Install Dependencies**
   - Command: `npm ci`

4. **Compile Contracts**
   - Command: `npm run compile`

5. **Generate Types**
   - Command: `npm run typechain`

6. **Run Sepolia Tests**
   - Command: `npm run test:sepolia`
   - Requires secrets:
     - `SEPOLIA_RPC_URL`
     - `PRIVATE_KEY`
   - Continues on error (optional tests)

7. **Upload Test Results**
   - Archives integration test results
   - Retention: 30 days

#### Job 5: Summary

**Purpose**: Aggregate and report final test status

**Dependencies**: Runs after `test`, `code-quality`, and `build`

**Runs**: Always (even if previous jobs fail)

**Logic**:
- Checks status of all previous jobs
- Outputs summary to console
- Exits with error if any critical job failed
- Shows ✅ if all checks passed
- Shows ❌ if any checks failed

## Workflow 2: Deployment

### Trigger Conditions

The deployment workflow runs automatically on:
- ✅ Every push to `main` branch
- ✅ Manual trigger via `workflow_dispatch`

### Permissions

Required permissions:
- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - Generate deployment tokens

### Concurrency Control

- Group: `pages`
- Cancel in progress: `true`
- Ensures only one deployment runs at a time

### Jobs Overview

#### Job 1: Test

**Purpose**: Run full test suite before deployment

**Steps**:

1. **Checkout Code**
2. **Setup Node.js** (version 20)
3. **Install Dependencies**
4. **Compile Contracts**
5. **Generate TypeChain Types**
6. **Run Tests** (`npm run test:mock`)
7. **Run Linter** (continues on error)

#### Job 2: Build

**Purpose**: Build production-ready application

**Dependencies**: Requires `test` job to pass

**Steps**:

1. **Checkout Code**
2. **Setup Node.js** (version 20)
3. **Install Dependencies**
4. **Build Application** (`npm run build`)
5. **Setup GitHub Pages**
6. **Upload Artifact** (dist/ directory)

#### Job 3: Deploy

**Purpose**: Deploy to GitHub Pages

**Dependencies**: Requires `build` job to pass

**Environment**:
- Name: `github-pages`
- URL: Deployment URL

**Steps**:

1. **Deploy to GitHub Pages**
   - Uses: `actions/deploy-pages@v4`
   - Deploys uploaded artifact

2. **Deployment Summary**
   - Shows success message
   - Displays deployment URL

## Configuration Files

### 1. `.solhint.json`

Solidity linting configuration:

```json
{
  "extends": "solhint:recommended",
  "plugins": ["prettier"],
  "rules": {
    "compiler-version": ["error", "^0.8.0"],
    "func-visibility": ["warn", { "ignoreConstructors": true }],
    "max-line-length": ["warn", 120],
    // ... comprehensive ruleset
  }
}
```

**Key Rules**:
- Compiler version: ^0.8.0 required
- Max line length: 120 characters
- Function visibility required
- Naming conventions enforced
- Security checks enabled

### 2. `.solhintignore`

Excluded directories:
- node_modules/
- artifacts/
- cache/
- coverage/
- typechain/
- types/
- dist/

### 3. `codecov.yml`

Codecov configuration:

```yaml
coverage:
  status:
    project:
      target: 90%
      threshold: 2%
    patch:
      target: 85%
      threshold: 5%
```

**Settings**:
- Project coverage target: 90%
- Patch coverage target: 85%
- Precision: 2 decimal places
- Range: 70-100%

### 4. `.prettierrc`

Code formatting configuration:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Solidity Overrides**:
- Print width: 120
- Tab width: 4
- Single quotes: false

### 5. `.prettierignore`

Excluded from formatting:
- node_modules/
- dist/
- artifacts/
- coverage/
- *.log
- package-lock.json

## Required Secrets

Configure these secrets in GitHub repository settings:

### For Testing
- `CODECOV_TOKEN` - Codecov upload token (get from codecov.io)

### For Integration Tests
- `SEPOLIA_RPC_URL` - Sepolia testnet RPC endpoint
- `PRIVATE_KEY` - Test account private key (with Sepolia ETH)

### How to Add Secrets

1. Go to repository Settings
2. Navigate to Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its value

## Local Development

### Running Quality Checks

```bash
# Linting
npm run lint              # ESLint
npm run lint:contracts    # Solhint
npm run lint:fix          # Auto-fix ESLint

# Formatting
npm run format            # Format all files
npm run format:check      # Check formatting
npm run format:contracts  # Format Solidity

# Type checking
npm run typecheck         # TypeScript

# Testing
npm run test:mock         # Unit tests
npm run coverage          # With coverage

# Security
npm audit                 # Security scan
```

### Pre-Commit Checklist

Before committing code:

1. ✅ Run `npm run lint` - No linting errors
2. ✅ Run `npm run lint:contracts` - Contracts pass Solhint
3. ✅ Run `npm run format:check` - Code is formatted
4. ✅ Run `npm run typecheck` - No type errors
5. ✅ Run `npm run test:mock` - All tests pass
6. ✅ Run `npm audit` - No critical vulnerabilities

### Git Hooks (Optional)

Consider adding these with `husky`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm run format:check",
      "pre-push": "npm run test:mock"
    }
  }
}
```

## Workflow Visualization

```
Push to main/develop or PR
         |
         v
    ┌─────────────────────────────────────┐
    │      Test Suite Workflow            │
    └─────────────────────────────────────┘
         |
         ├── Job 1: Test (Node 18.x & 20.x)
         |    ├── Compile contracts
         |    ├── Run tests
         |    ├── Generate coverage
         |    └── Upload to Codecov
         |
         ├── Job 2: Code Quality
         |    ├── TypeScript check
         |    ├── Prettier check
         |    ├── Solhint
         |    └── Security audit
         |
         ├── Job 3: Build
         |    ├── Build application
         |    └── Archive artifacts
         |
         ├── Job 4: Integration (main only)
         |    └── Sepolia tests
         |
         └── Job 5: Summary
              └── Report status

Push to main
         |
         v
    ┌─────────────────────────────────────┐
    │     Deployment Workflow             │
    └─────────────────────────────────────┘
         |
         ├── Job 1: Test
         |    └── Run test suite
         |
         ├── Job 2: Build
         |    └── Build for production
         |
         └── Job 3: Deploy
              └── Deploy to GitHub Pages
```

## Performance Metrics

### Expected Workflow Times

| Workflow | Job | Duration |
|----------|-----|----------|
| Test Suite | Test (each version) | ~5 minutes |
| Test Suite | Code Quality | ~2 minutes |
| Test Suite | Build | ~3 minutes |
| Test Suite | Integration | ~5 minutes |
| **Total Test Suite** | | **~15 minutes** |
| Deployment | Test | ~5 minutes |
| Deployment | Build | ~3 minutes |
| Deployment | Deploy | ~1 minute |
| **Total Deployment** | | **~9 minutes** |

### Optimization Tips

1. **Caching**: npm dependencies are cached automatically
2. **Parallel Jobs**: Test and code-quality run in parallel
3. **Fail Fast**: Non-critical checks continue on error
4. **Artifact Retention**: Limited to 7-30 days

## Troubleshooting

### Common Issues

#### 1. Tests Fail in CI but Pass Locally

**Causes**:
- Different Node.js versions
- Missing environment variables
- Timing issues in tests

**Solutions**:
```bash
# Test with specific Node version
nvm use 18
npm run test:mock

# Check environment
echo $NODE_ENV
```

#### 2. Codecov Upload Fails

**Causes**:
- Missing CODECOV_TOKEN
- Invalid token
- Coverage file not generated

**Solutions**:
1. Verify token in repository secrets
2. Check coverage file exists: `ls coverage/lcov.info`
3. Test locally: `npx codecov`

#### 3. Deployment Fails

**Causes**:
- Tests failed
- Build errors
- GitHub Pages not enabled

**Solutions**:
1. Check test logs
2. Build locally: `npm run build`
3. Enable GitHub Pages in repository settings

#### 4. Solhint Errors

**Causes**:
- Contract style violations
- Missing contracts/ directory

**Solutions**:
```bash
# Run locally
npm run lint:contracts

# Check if contracts exist
ls contracts/
```

## Best Practices

### 1. Branch Strategy

- `main` - Production branch (triggers deployment)
- `develop` - Development branch (runs tests only)
- Feature branches - Create PR to `develop`

### 2. Pull Request Workflow

1. Create feature branch from `develop`
2. Make changes and commit
3. Open PR to `develop`
4. CI runs automatically
5. Address any failures
6. Get code review
7. Merge to `develop`
8. Periodically merge `develop` to `main` for deployment

### 3. Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `test:` - Add tests
- `docs:` - Documentation
- `ci:` - CI/CD changes
- `refactor:` - Code refactoring

### 4. Code Review Checklist

- ✅ All CI checks pass
- ✅ Code is formatted
- ✅ Tests are added/updated
- ✅ Documentation updated
- ✅ No security vulnerabilities
- ✅ Coverage maintained

## Monitoring and Alerts

### GitHub Actions

- View workflow runs: Repository → Actions tab
- Check logs for each job
- Download artifacts
- Re-run failed workflows

### Codecov Dashboard

- View coverage reports at codecov.io
- Track coverage trends
- Review uncovered lines
- See PR coverage diff

### Notifications

Configure notifications in:
- GitHub Settings → Notifications
- Watch repository for all activity
- Enable email/Slack notifications

## Maintenance

### Regular Tasks

**Weekly**:
- Review failed workflow runs
- Check coverage trends
- Update dependencies: `npm update`

**Monthly**:
- Review and update CI configuration
- Check for new GitHub Actions versions
- Audit dependencies: `npm audit`

**Quarterly**:
- Review and update coverage targets
- Optimize workflow performance
- Update documentation

## Resources

### Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Codecov Documentation](https://docs.codecov.com/)
- [Solhint Rules](https://github.com/protofire/solhint/docs/rules.html)
- [Prettier Options](https://prettier.io/docs/en/options.html)

### Tools
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Codecov Dashboard](https://codecov.io)
- [npm Package Health](https://snyk.io/advisor/npm-package)

### Support
- Create issue in repository
- Check workflow logs
- Review previous successful runs

---

**Last Updated**: 2025-10-18
**Version**: 1.0.0
**Status**: ✅ Production Ready

# Operational Scripts

> **"If it can be scripted, script it. Never guess."**

This folder contains deterministic scripts for operations that should be reliable and repeatable.

## When to Add Scripts Here

Add a script when:
- The operation has clear inputs and outputs
- You've done the same operation 3+ times manually
- The operation is fragile (easy to mess up)
- You need consistency across environments

## Structure

```
scripts/ops/
├── README.md           # This file
├── db/                 # Database utilities
│   ├── validate_migration.ts
│   └── check_rls_policies.ts
└── deploy/             # Deployment helpers
    └── pre_deploy_check.ts
```

## Philosophy

**The 3-Layer Architecture:**

1. **Directive** (SKILL.md) - What to do, when to do it
2. **Orchestration** (AI Agent) - Understands intent, invokes right tools
3. **Execution** (Scripts) - Deterministic code that runs reliably

The AI never writes code from scratch if a script already exists. It routes to the right tool.

## Creating New Scripts

```typescript
// scripts/ops/example.ts

/**
 * [What this script does]
 *
 * Usage: npx tsx scripts/ops/example.ts [args]
 */

async function main() {
  // Deterministic logic here
  console.log('✅ Operation complete');
}

main().catch(console.error);
```

## Pipeline Scripts (Run from Master Repo)

Pipeline scripts (`post-build.sh`, `chain.sh`, `admin-panel.sh`) are **NOT copied into builds**.
They live in the master SAAS repo and are run with `--project` pointing at this build:

```bash
# From the SAAS repo:
bash bloom/scripts/ops/post-build.sh /path/to/bloom-builds/brandops --provocateur
bash bloom/scripts/ops/chain.sh --local-submission /path/to/bloom-builds/brandops
```

This prevents copy drift — every build always uses the latest pipeline version.

## Existing Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `bloom-build.sh` | Build orchestration | `bash scripts/ops/bloom-build.sh` |
| `build-daemon.sh` | Background build daemon | `bash scripts/ops/build-daemon.sh` |
| `deploy-demo.sh` | Demo deployment | `bash scripts/ops/deploy-demo.sh` |
| `package-for-client.sh` | Client package export | `bash scripts/ops/package-for-client.sh` |

## Best Practices

1. **Single responsibility** - One script, one job
2. **Clear output** - Log what's happening
3. **Error handling** - Fail loudly with helpful messages
4. **Idempotent** - Safe to run multiple times
5. **Documented** - Comment the "why", not just the "what"

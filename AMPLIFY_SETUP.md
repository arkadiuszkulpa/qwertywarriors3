# Amplify Gen 2 Setup Guide

## Prerequisites
- Node.js 18+
- AWS account with credentials configured
- IAM user needs `AdministratorAccess-Amplify` policy (or equivalent permissions)

## Quick Start

The Amplify backend structure is already created in this project. Just run:

```bash
npx ampx sandbox
```

This will:
1. Bootstrap CDK (first time only)
2. Deploy DynamoDB table + AppSync API + Cognito Identity Pool
3. Generate `amplify_outputs.json`

## After Sandbox Starts

Copy the generated config to the public folder:

```bash
cp amplify_outputs.json public/amplify_outputs.json
```

The game will automatically detect and enable the leaderboard.

## Project Structure

```
amplify/
├── backend.ts          # Main backend definition
├── data/
│   └── resource.ts     # Score model schema (DynamoDB + AppSync)
└── tsconfig.json       # TypeScript config for Amplify
```

## How Authentication Works

- **Guest access**: Players don't need to sign in
- Amplify creates a Cognito Identity Pool with unauthenticated access
- The Score model allows guest users to create and read scores

## Production Deployment

```bash
npx ampx pipeline-deploy --branch main
```

Or connect to Amplify Hosting for CI/CD.

## Troubleshooting

**CDK Bootstrap Error:**
If you see SSM permission errors, your IAM user needs the `AdministratorAccess-Amplify` managed policy.

**"Amplify not configured" in game:**
- Ensure `amplify_outputs.json` exists in the `public/` folder
- Check browser console for errors

**Sandbox not connecting:**
- Make sure `npx ampx sandbox` is still running
- Check that AWS credentials are configured (`aws configure`)

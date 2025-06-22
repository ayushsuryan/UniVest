# GitLab CI/CD Setup for UniVest Backend

## Overview

This repository uses GitLab CI/CD to automatically deploy the UniVest backend to a VPS server.

## Server Details

- **IP**: 157.180.90.43
- **User**: root
- **Application Path**: /var/www/finance-backend
- **Process Manager**: PM2

## Required GitLab CI/CD Variables

### 1. SSH_PRIVATE_KEY

- **Type**: Variable
- **Value**: The complete RSA private key (including BEGIN/END lines)
- **Protected**: Can be checked if the main branch is protected
- **Masked**: Should NOT be masked (RSA keys contain unmaskable characters)

### 2. SSH_KNOWN_HOSTS

- **Type**: Variable
- **Value**: SSH host fingerprints (obtained via `ssh-keyscan -H 157.180.90.43`)
- **Protected**: Can be checked if the main branch is protected
- **Masked**: Can be masked

## Deployment Process

1. **Build Stage**: Installs production dependencies
2. **Test Stage**: Runs tests (if available)
3. **Deploy Stage**:
   - Syncs files to server using rsync
   - Installs dependencies on server
   - Restarts application using PM2

## Troubleshooting

### SSH Key Issues

If you get "Error loading key" errors:

1. Ensure SSH_PRIVATE_KEY variable is set correctly
2. Check if variable is protected but branch is not (or vice versa)
3. Verify the key format is correct (RSA private key)

### Protected Variables

- Protected variables only work on protected branches
- Either protect your main branch or unprotect the variables

## Local SSH Access

To SSH into the server locally:

```bash
ssh root@157.180.90.43
```

# GitHub Fine-Grained Token Permissions Table

This table provides a comprehensive overview of GitHub permissions with recommended settings for GitHub Actions automation and Copilot integration.

| ID | Permission Category | Permission Name | Description | Recommended Setting |
|---:|-------------------|-----------------|-------------|--------------------|
| 1 | Actions | Actions | Control over workflows, workflow runs and artifacts | Read & Write |
| 2 | Administration | Administration | Repository creation, deletion, settings, teams, and collaborators | Read-only |
| 3 | Code | Contents | Repository contents, commits, branches, downloads, releases, and merges | Read & Write |
| 4 | Code | Commit Statuses | Create commit statuses | Read & Write |
| 5 | Code | Custom Properties | View and manage repository custom properties | Read-only |
| 6 | Collaboration | Issues | Issues and related comments, assignees, labels, and milestones | Read & Write |
| 7 | Collaboration | Pull Requests | Pull requests and related comments, assignees, labels, milestones | Read & Write |
| 8 | Collaboration | Discussions | Create and edit comments and labels | Read & Write |
| 9 | Collaboration | Projects | Project board access and management | Read & Write |
| 10 | Security | Dependabot Alerts | Retrieve Dependabot alerts | Read-only |
| 11 | Security | Dependabot Secrets | Manage Dependabot repository secrets | No access |
| 12 | Security | Code Scanning | View and manage code scanning alerts | Read-only |
| 13 | Security | Secret Scanning | View and manage secret scanning alerts | Read-only |
| 14 | Deployment | Environments | Manage repository environments | Read & Write |
| 15 | Deployment | Deployments | Deployments and deployment statuses | Read & Write |
| 16 | Integration | Secrets | Manage Actions repository secrets | Read & Write |
| 17 | Integration | Variables | Manage Actions repository variables | Read & Write |
| 18 | Integration | Workflows | Delete GitHub Action workflow files | Read & Write |
| 19 | Integration | Webhooks | Manage the post-receive hooks for a repository | Read-only |
| 20 | Repository Info | Metadata | Search repositories, list collaborators, access metadata | Read-only |
| 21 | Repository Info | Pages | GitHub Pages statuses, configuration, and builds | Read & Write |

## Permission Setting Rationale

### Critical for Automation
- **Actions (R&W)**: Required for workflow execution and management
- **Contents (R&W)**: Needed for Copilot to make code changes and commits
- **Issues & Pull Requests (R&W)**: Essential for automated issue/PR management
- **Projects (R&W)**: Necessary for project board automation
- **Workflows (R&W)**: Required for updating workflow files

### Security Considerations
- **Security Alerts (Read-only)**: Allows monitoring without modification
- **Secrets Management (R&W)**: Required for managing automation secrets
- **Administration (Read-only)**: Limits potential security risks

### Integration Support
- **Metadata (Read-only)**: Required for basic repository operations
- **Variables (R&W)**: Needed for workflow configuration
- **Deployments (R&W)**: Supports automated deployment processes

## Best Practices
1. Review permissions regularly
2. Set appropriate expiration dates for tokens
3. Use separate tokens for different automation purposes
4. Monitor token usage in audit logs
5. Never commit tokens to source control

## Notes
- These recommendations assume a typical development workflow using GitHub Actions and Copilot
- Adjust permissions based on your specific security requirements
- Consider creating multiple tokens with different permission sets for different purposes

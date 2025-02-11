# File Edit Check Server Implementation

## Core Feature: Preventing Blind File Modifications

Implemented a safety mechanism to prevent accidental file overwrites by requiring explicit read operations before any modifications:

### Implementation Details

1. File State Tracking
   - Added `readFiles` Set to maintain list of files that have been explicitly read
   - Files are removed from the set after successful write/diff operations

2. Pre-modification Verification
   - Before any write operation:
     ```typescript
     const exists = await callMcpTool("filesystem", "get_file_info", { path })
       .then(() => true)
       .catch(() => false);
     if (exists && !readFiles.has(path)) {
       throw new McpError(
         ErrorCode.InvalidRequest,
         `Blind write prevented: File "${path}" exists. Please use checked_read_file to verify the file before modifying it.`
       );
     }
     ```
   - Similar check for diff operations:
     ```typescript
     if (!readFiles.has(path)) {
       throw new McpError(
         ErrorCode.InvalidRequest,
         `Blind diff prevented: File "${path}" must be read using checked_read_file before applying a diff.`
       );
     }
     ```

3. Commit Message Guidance
   - Added to write/diff responses to ensure thorough documentation:
     ```typescript
     return {
       ...result,
       commitMessageGuidance: COMMIT_MESSAGE_GUIDANCE
     };
     ```

### Safety Mechanisms

1. Explicit Read Requirement
   - Files must be read using `checked_read_file` before modification
   - Prevents accidental overwrites of existing files
   - Forces developers to verify file contents before changes

2. Automatic State Management
   - Files are tracked in memory while being modified
   - State is cleared after successful write/diff operations
   - Prevents stale state from affecting future operations

3. Clear Error Messages
   - Descriptive errors explain why operations were blocked
   - Guides users toward proper usage patterns
   - References specific files in error messages

### Documentation Standards

The server enforces detailed commit messages by including guidance in tool responses:

```typescript
const COMMIT_MESSAGE_GUIDANCE = `Create a detailed, specific, measured, descriptive commit message that leaves meticulous forensic evidence for future users and agents to know and understand every action and intention. Make sure not to be unjustifiably definitive in your claims. Future agents and users must be able to understand the true state and the complete thinking and actions in code from commit messages.`;
```

This ensures that all changes are properly documented with:
- Clear explanation of modifications
- Rationale behind changes
- Impact on system behavior
- Considerations for future maintenance

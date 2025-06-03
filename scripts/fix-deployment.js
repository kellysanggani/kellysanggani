// Git Deployment Troubleshooting Script
console.log("🔧 Git Deployment Troubleshooting Tool")
console.log("=".repeat(50))

// Common deployment errors and their solutions
const commonErrors = {
  "Permission denied (publickey)": {
    description: "SSH key authentication failed",
    solutions: [
      "Check if SSH key is added to GitHub: ssh -T git@github.com",
      'Generate new SSH key: ssh-keygen -t ed25519 -C "your_email@example.com"',
      "Add SSH key to ssh-agent: ssh-add ~/.ssh/id_ed25519",
      "Add public key to GitHub Settings > SSH and GPG keys",
    ],
  },
  "fatal: remote origin already exists": {
    description: "Remote origin is already configured",
    solutions: [
      "Remove existing origin: git remote remove origin",
      "Add correct origin: git remote add origin git@github.com:username/repo.git",
      "Or update existing: git remote set-url origin git@github.com:username/repo.git",
    ],
  },
  "Updates were rejected because the remote contains work": {
    description: "Remote branch has commits not in local branch",
    solutions: [
      "Pull latest changes: git pull origin cinema-stock",
      "Force push (CAUTION): git push --force-with-lease origin cinema-stock",
      "Merge conflicts: git pull --rebase origin cinema-stock",
    ],
  },
  "fatal: refusing to merge unrelated histories": {
    description: "Local and remote repositories have different histories",
    solutions: [
      "Allow unrelated histories: git pull --allow-unrelated-histories origin cinema-stock",
      "Then push: git push origin cinema-stock",
    ],
  },
  "fatal: branch cinema-stock does not exist": {
    description: "Target branch does not exist on remote",
    solutions: [
      "Create and push new branch: git checkout -b cinema-stock",
      "Push new branch: git push -u origin cinema-stock",
      "Or push to existing branch: git push origin HEAD:cinema-stock",
    ],
  },
}

console.log("📋 Common Git Deployment Errors and Solutions:")
console.log("")

Object.entries(commonErrors).forEach(([error, info], index) => {
  console.log(`${index + 1}. ${error}`)
  console.log(`   Description: ${info.description}`)
  console.log("   Solutions:")
  info.solutions.forEach((solution, i) => {
    console.log(`   ${i + 1}. ${solution}`)
  })
  console.log("")
})

console.log("🔍 Step-by-Step Troubleshooting:")
console.log("")

const troubleshootingSteps = [
  {
    step: "Check Git Status",
    commands: ["git status", "git branch -a", "git remote -v"],
    description: "Verify current branch, uncommitted changes, and remote configuration",
  },
  {
    step: "Check Authentication",
    commands: ["ssh -T git@github.com", "git config --global user.name", "git config --global user.email"],
    description: "Verify SSH authentication and Git configuration",
  },
  {
    step: "Sync with Remote",
    commands: ["git fetch origin", "git pull origin cinema-stock", "git push origin cinema-stock"],
    description: "Fetch latest changes and attempt to push",
  },
  {
    step: "Force Sync (if needed)",
    commands: ["git pull --rebase origin cinema-stock", "git push --force-with-lease origin cinema-stock"],
    description: "Force synchronization (use with caution)",
  },
]

troubleshootingSteps.forEach((step, index) => {
  console.log(`Step ${index + 1}: ${step.step}`)
  console.log(`Description: ${step.description}`)
  console.log("Commands:")
  step.commands.forEach((cmd) => console.log(`  $ ${cmd}`))
  console.log("")
})

console.log("⚠️  Important Notes:")
console.log("- Always backup your work before force pushing")
console.log("- Use --force-with-lease instead of --force for safety")
console.log("- Make sure you are on the correct branch before pushing")
console.log("- Check that your SSH key has write access to the repository")
console.log("")

console.log("🆘 If you are still having issues, please share:")
console.log("1. The exact error message you are seeing")
console.log("2. Output of: git remote -v")
console.log("3. Output of: git status")
console.log("4. Output of: git branch -a")

// Git Quick Fix Script
console.log("🔧 Git Quick Fix Tool")
console.log("=".repeat(40))

function showQuickFixes() {
  console.log("🚨 Quick Fixes for Common Git Issues:")
  console.log("")

  const quickFixes = [
    {
      issue: "Cannot push to branch",
      fix: ["git pull origin cinema-stock", "git push origin cinema-stock"],
    },
    {
      issue: "Branch does not exist",
      fix: ["git checkout -b cinema-stock", "git push -u origin cinema-stock"],
    },
    {
      issue: "Authentication failed",
      fix: [
        'ssh-keygen -t ed25519 -C "your_email@example.com"',
        "cat ~/.ssh/id_ed25519.pub",
        "# Copy the output and add to GitHub SSH keys",
      ],
    },
    {
      issue: "Merge conflicts",
      fix: [
        "git status",
        "# Edit conflicted files",
        "git add .",
        'git commit -m "Resolve merge conflicts"',
        "git push origin cinema-stock",
      ],
    },
    {
      issue: "Uncommitted changes blocking pull",
      fix: ["git stash", "git pull origin cinema-stock", "git stash pop"],
    },
    {
      issue: "Wrong remote URL",
      fix: [
        "git remote -v",
        "git remote set-url origin git@github.com:kellysanggani/cinema-stock.git",
        "git push origin cinema-stock",
      ],
    },
  ]

  quickFixes.forEach((item, index) => {
    console.log(`${index + 1}. ${item.issue}:`)
    item.fix.forEach((cmd) => {
      if (cmd.startsWith("#")) {
        console.log(`   ${cmd}`)
      } else {
        console.log(`   $ ${cmd}`)
      }
    })
    console.log("")
  })

  console.log("🎯 Most Common Solution:")
  console.log("If you are getting permission errors, the issue is likely SSH authentication.")
  console.log("")
  console.log("Quick SSH Setup:")
  console.log('1. $ ssh-keygen -t ed25519 -C "your_email@example.com"')
  console.log("2. $ cat ~/.ssh/id_ed25519.pub")
  console.log("3. Copy the output and add it to GitHub > Settings > SSH and GPG keys")
  console.log("4. $ ssh -T git@github.com  # Test connection")
  console.log("5. $ git push origin cinema-stock")
}

showQuickFixes()

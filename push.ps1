cd c:\ECET-Resource-Hub\ecet-guru
$env:GIT_EDITOR = 'true'
$env:GIT_AUTHOR_NAME = 'GitHub Copilot'
$env:GIT_AUTHOR_EMAIL = 'copilot@github.com'
$env:GIT_COMMITTER_NAME = 'GitHub Copilot'
$env:GIT_COMMITTER_EMAIL = 'copilot@github.com'

git add -A
git commit --no-edit -m "fix: add UUID detection and suspense boundary for folder navigation

- Add useRouter import to folder page
- Implement UUID regex validation to detect slug vs UUID
- Auto-redirect slug-based URLs to /redirect?key=slug  
- Ensures useSearchParams wrapped in Suspense boundary
- Resolves Vercel 400 Bad Request errors"

if ($LASTEXITCODE -eq 0) {
    Write-Output "Commit successful, pushing to GitHub..."
    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Output "Push successful!"
    } else {
        Write-Output "Push failed with code: $LASTEXITCODE"
    }
} else {
    Write-Output "Commit failed or nothing to commit"
}

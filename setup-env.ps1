$env:IMAP_USER = "github@luotao.qzz.io"
$env:IMAP_PASSWORD = "20050508luoTAO"
$env:IMAP_HOST = "imap.qiye.aliyun.com"
$env:IMAP_PORT = "993"

Write-Host "Adding IMAP_USER..."
$env:IMAP_USER | npx vercel env add IMAP_USER production

Write-Host "Adding IMAP_PASSWORD..."
$env:IMAP_PASSWORD | npx vercel env add IMAP_PASSWORD production

Write-Host "Adding IMAP_HOST..."
$env:IMAP_HOST | npx vercel env add IMAP_HOST production

Write-Host "Adding IMAP_PORT..."
$env:IMAP_PORT | npx vercel env add IMAP_PORT production

Write-Host "Done!"

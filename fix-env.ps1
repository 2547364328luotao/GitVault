# 使用 Vercel CLI 的交互式方式添加环境变量
# 不使用管道,避免换行符问题

Write-Host "请按照提示逐个输入环境变量值 (不要有任何额外的空格或换行符):" -ForegroundColor Yellow
Write-Host ""

Write-Host "正在设置 IMAP_USER..." -ForegroundColor Cyan
Write-Host "当提示时,请输入: github@luotao.qzz.io" -ForegroundColor Green
npx vercel env add IMAP_USER production

Write-Host ""
Write-Host "正在设置 IMAP_PASSWORD..." -ForegroundColor Cyan  
Write-Host "当提示时,请输入: 20050508luoTAO" -ForegroundColor Green
npx vercel env add IMAP_PASSWORD production

Write-Host ""
Write-Host "正在设置 IMAP_HOST..." -ForegroundColor Cyan
Write-Host "当提示时,请输入: imap.qiye.aliyun.com" -ForegroundColor Green
npx vercel env add IMAP_HOST production

Write-Host ""
Write-Host "正在设置 IMAP_PORT..." -ForegroundColor Cyan
Write-Host "当提示时,请输入: 993" -ForegroundColor Green
npx vercel env add IMAP_PORT production

Write-Host ""
Write-Host "环境变量设置完成!" -ForegroundColor Green
Write-Host "现在请运行: npx vercel --prod" -ForegroundColor Yellow

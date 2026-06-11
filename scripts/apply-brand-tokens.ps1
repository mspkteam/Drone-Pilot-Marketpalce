# Replace hardcoded hex with unified RAS Tailwind tokens across src/
$replacements = [ordered]@{
  'text-[#f5f1ea]' = 'text-ras-heading'
  'text-[#f4f1ea]' = 'text-ras-text'
  'text-[#e5e2e1]' = 'text-ras-text'
  'text-[#a39684]' = 'text-ras-warm'
  'text-[#d0c5af]' = 'text-ras-warm'
  'text-[#a8a29a]' = 'text-ras-muted'
  'text-[#8a847a]' = 'text-ras-soft'
  'text-[#d8b339]' = 'text-gold'
  'text-[#e9c349]' = 'text-gold-light'
  'text-[#e4c55a]' = 'text-gold-light'
  'text-[#0e0a07]' = 'text-ras-cta'
  'text-[#11100d]' = 'text-ras-cta'
  'text-[#3c2f00]' = 'text-ras-waitlist'
  'bg-[#131313]' = 'bg-ras-bg'
  'bg-[#0e0e0d]' = 'bg-ras-soft'
  'bg-[#0e0e0e]' = 'bg-ras-soft'
  'bg-[#11100f]' = 'bg-ras-section'
  'bg-[#10100f]' = 'bg-ras-section'
  'bg-[#201f1f]' = 'bg-ras-card'
  'bg-[#201f1d]' = 'bg-ras-card'
  'bg-[#171512]' = 'bg-ras-card-warm'
  'bg-[#1a1917]' = 'bg-surface'
  'border-[#4d4635]' = 'border-ras-border-muted'
  'border-[rgba(235,169,65,0.11)]' = 'border-ras-gold-subtle'
  'hover:text-[#e4c55a]' = 'hover:text-gold-light'
  'hover:text-[#d8b339]' = 'hover:text-gold'
  'focus:border-[#3c2f00]/40' = 'focus:border-ras-waitlist/40'
  'focus:ring-[#3c2f00]/25' = 'focus:ring-ras-waitlist/25'
  'text-[#3c2f00]/85' = 'text-ras-waitlist/85'
  'bg-[#3c2f00]/10' = 'bg-ras-waitlist/10'
  'border-[#3c2f00]/20' = 'border-ras-waitlist/20'
}

$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.ts,*.css
foreach ($file in $files) {
  $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
  if (-not $content) { continue }
  $original = $content
  foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
  }
  if ($content -ne $original) {
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated: $($file.FullName)"
  }
}

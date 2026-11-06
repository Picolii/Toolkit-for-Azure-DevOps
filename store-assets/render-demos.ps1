$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$demoOutput = Join-Path $PSScriptRoot 'screenshots'
New-Item -ItemType Directory -Path $demoOutput -Force | Out-Null

function Box($x, $y, $w, $h, $color) {
  $brush = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml($color))
  try { $script:canvas.FillRectangle($brush, $x, $y, $w, $h) } finally { $brush.Dispose() }
}
function Label($text, $x, $y, $size = 18, $color = '#eaf0f8', $bold = $false) {
  $weight = if ($bold) { [Drawing.FontStyle]::Bold } else { [Drawing.FontStyle]::Regular }
  $font = [Drawing.Font]::new('Segoe UI', [single]$size, $weight, [Drawing.GraphicsUnit]::Pixel)
  $brush = [Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml($color))
  try { $script:canvas.DrawString($text, $font, $brush, [single]$x, [single]$y) } finally { $font.Dispose(); $brush.Dispose() }
}
function Rule($x, $y, $w, $h, $color = '#4a586c') {
  $pen = [Drawing.Pen]::new([Drawing.ColorTranslator]::FromHtml($color), 2)
  try { $script:canvas.DrawRectangle($pen, $x, $y, $w, $h) } finally { $pen.Dispose() }
}
function Badge($text, $x, $y, $width, $current = $false) {
  $color = if ($current) { '#82c6ff' } else { '#c6d2e3' }
  Rule $x $y $width 30 $color
  Label $text ($x + 9) ($y + 3) 16 $color
}
function New-Demo($number, $title, $subtitle) {
  $script:bitmap = [Drawing.Bitmap]::new(1280, 800)
  $script:canvas = [Drawing.Graphics]::FromImage($script:bitmap)
  $script:canvas.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $script:canvas.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  Box 0 0 1280 800 '#101722'
  Box 0 0 1280 8 '#35b8ef'
  Label 'TOOLKIT FOR AZURE DEVOPS' 54 31 17 '#81caff' $true
  Label $title 54 70 36 '#f4f7fc' $true
  Label $subtitle 56 125 19 '#b5c3d7'
  Box 54 735 1172 1 '#354257'
  Label "$number / 03" 56 755 15 '#9eb1ca'
  Label 'ILLUSTRATED DEMO - FICTIONAL DATA - NOT A LIVE AZURE SCREENSHOT' 382 755 14 '#9eb1ca'
}
function Save-Demo($name) {
  try { $script:bitmap.Save((Join-Path $demoOutput $name), [Drawing.Imaging.ImageFormat]::Png) }
  finally { $script:canvas.Dispose(); $script:bitmap.Dispose() }
}

New-Demo '01' 'Turn work items into commit messages' 'Copy from an open work item or from linked items in a pull request.'
Box 54 180 1172 275 '#242d3a'
Box 54 180 1172 43 '#1b2330'
Label 'Demo Organization / Demo Project / Boards / Work items' 76 191 16 '#b5c3d7'
Label 'TASK 1042' 80 246 15 '#81caff' $true
Box 917 241 125 36 '#126ca9'
Label 'Copiar task' 933 247 17 '#ffffff' $true
Box 1055 241 140 36 '#344359'
Label 'Save & close' 1070 247 17
Label 'Improve checkout validation' 80 286 29 '#f4f7fc' $true
Label 'State: Active       Assigned to: Demo User' 80 338 17 '#c4cfde'
Badge 'api' 80 382 52
Badge 'checkout' 143 382 105
Label 'Description' 303 382 16 '#a9b9cd'
Label 'Validate required fields before completing a demo order.' 303 409 17
Box 54 480 563 219 '#1b2330'
Label '1. CLICK THE ADDED BUTTON' 76 501 15 '#81caff' $true
Label 'Use Copiar task in the work item header.' 76 537 20
Label 'The title, tags and ID become a commit.' 76 574 18 '#b5c3d7'
Label 'Also available on linked PR work items.' 76 626 18 '#b5c3d7'
Box 640 480 586 219 '#172a38'
Label '2. PASTE THE COPIED MESSAGE' 664 501 15 '#81caff' $true
Label 'feat(api, checkout): improve checkout validation' 664 550 18 '#e2f5ff'
Label '#1042' 664 601 22 '#81caff' $true
Label 'Example output with fictional work item data' 664 655 15 '#a8c1d2'
Save-Demo '01-copy-commit.png'

New-Demo '02' 'Know which project you are linking' 'Project labels appear beside results. A star highlights your current project.'
Box 54 180 754 519 '#242d3a'
Label 'Add link' 80 202 26 '#f4f7fc' $true
Label 'Link type:' 80 251 18
Box 80 282 699 42 '#1b2330'
Rule 80 282 699 42
Label 'Parent' 94 291 18
Label 'Work items to link' 80 342 18
Box 80 374 699 43 '#172432'
Rule 80 374 699 43 '#58b8ff'
Label 'maintenance' 94 384 18
$items = @(
  @('User Story 1042: Maintenance', 'Demo Project', $true, 160),
  @('User Story 2081: Maintenance', 'Sample Shop', $false, 128),
  @('Epic 3120: Maintenance tools', 'Example API', $false, 124),
  @('Task 4126: Maintenance checks', 'Demo Project', $true, 160)
)
$rowY = 436
foreach ($item in $items) {
  Label $item[0] 94 $rowY 18
  $badgeText = if ($item[2]) { [char]0x2605 + ' ' + $item[1] } else { $item[1] }
  Badge $badgeText 592 ($rowY - 2) $item[3] $item[2]
  $rowY += 53
}
Box 838 180 388 519 '#1b2330'
Label 'PROJECT CONTEXT' 862 209 15 '#81caff' $true
Label 'Demo Project' 862 248 28 '#f4f7fc' $true
Label 'Your current project' 862 290 18 '#b5c3d7'
Label ([char]0x2605 + ' Star = current project') 862 355 21 '#82c6ff' $true
Label 'Labels use the project name.' 862 412 18
Label 'The original result order stays.' 862 453 18
Label 'Select with mouse or keyboard.' 862 494 18
Label 'Shown when Azure data is available.' 862 641 15 '#b5c3d7'
Save-Demo '02-project-labels.png'

New-Demo '03' 'Choose the tools you want to use' 'Open the extension icon to enable or disable each module independently.'
Box 54 180 650 519 '#1b2330'
Label 'ONE TOOLKIT, THREE MODULES' 80 210 15 '#81caff' $true
Label 'Copy from an open work item' 80 263 25 '#f4f7fc' $true
Label 'Create a standardized commit message.' 80 303 19 '#b5c3d7'
Label 'Copy linked work items in a PR' 80 371 25 '#f4f7fc' $true
Label 'Access the same format from a pull request.' 80 411 19 '#b5c3d7'
Label 'Show projects in link selection' 80 479 25 '#f4f7fc' $true
Label 'Distinguish results with similar titles.' 80 519 19 '#b5c3d7'
Label 'Preferences are stored locally on your device.' 80 620 18 '#81caff'
Box 737 180 489 519 '#242d3a'
Label 'Toolkit' 764 203 28 '#f4f7fc' $true
Label 'Ferramentas para Azure DevOps' 764 244 16 '#b5c3d7'
Label 'SEUS MODULOS' 764 291 14 '#a9b9cd' $true
$modules = @(
  @('Copiar na task', 'Mensagem de commit no Work Item aberto.'),
  @('Copiar na PR', 'Copiar os work items vinculados a PR.'),
  @('Mostrar projetos', 'Identificar o projeto na selecao de vinculos.')
)
$moduleY = 331
foreach ($module in $modules) {
  Label $module[0] 764 $moduleY 20 '#f4f7fc' $true
  Label $module[1] 764 ($moduleY + 30) 14 '#b5c3d7'
  Box 1170 ($moduleY + 5) 24 24 '#0078d4'
  Label ([char]0x2713) 1173 ($moduleY + 3) 21 '#ffffff' $true
  $moduleY += 83
}
Label 'Save your work, then refresh Azure to apply.' 764 605 16 '#81caff'
Label 'Panel labels currently available in Portuguese.' 764 659 14 '#b5c3d7'
Save-Demo '03-module-panel.png'
Write-Output "Created 3 demonstration PNGs at $demoOutput"

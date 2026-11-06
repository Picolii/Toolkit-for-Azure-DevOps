# Reconstruct commits from the archived distribution ZIPs without replacing
# the user's working files. Run only once on the expected 1.0.2 parent.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
function Git-Checked {
  $GitArgs = $args
  $result = & git @GitArgs
  if ($LASTEXITCODE -ne 0) { throw "git failed: $($GitArgs -join ' ')" }
  return $result
}
$root = (Get-Location).Path
if ((Git-Checked rev-parse HEAD) -ne 'b090c380c1311482719debb73a21ad6e9cd1a26f') { throw 'Unexpected parent; stop to inspect history.' }
if (Git-Checked diff --cached --name-only) { throw 'Index must be empty before reconstruction.' }
$versions = @(
  @('1.1.0','copy-task-for-azure-devops','Add project labels and independent module controls'),
  @('1.1.1','copy-task-for-azure-devops','Improve project label visibility and add update checks'),
  @('1.1.2','copy-task-for-azure-devops','Use automatic compact project label widths'),
  @('1.1.3','picolii-toolkit-for-azure-devops','Rename extension to Picolii Toolkit'),
  @('1.1.4','toolkit-for-azure-devops','Rename extension to Toolkit for Azure DevOps'),
  @('1.2.0','toolkit-for-azure-devops','Localize interface for nine languages'),
  @('1.2.1','toolkit-for-azure-devops','Add saved language selector with automatic browser mode'),
  @('1.2.2','toolkit-for-azure-devops','Apply toolbox icon with Azure DevOps emblem'),
  @('1.2.3','toolkit-for-azure-devops','Enlarge toolbox artwork and popup icon')
)
foreach ($version in $versions) {
  if (Git-Checked tag --list "v$($version[0])") { throw "Tag already exists: v$($version[0])" }
}
$scratch = Join-Path ([IO.Path]::GetTempPath()) ('toolkit-history-' + [guid]::NewGuid())
New-Item -ItemType Directory -Path $scratch | Out-Null
foreach ($version in $versions) {
  $number = $version[0]
  $package = "dist/$($version[1])-$number.zip"
  $archive = [IO.Compression.ZipFile]::OpenRead((Join-Path $root $package))
  try {
    foreach ($entry in $archive.Entries) {
      if (-not $entry.Name) { continue }
      $relative = $entry.FullName.Replace('\','/')
      if ($relative -match '(^/|(^|/)\.\.(/|$)|:)') { throw "Unsafe ZIP path: $relative" }
      $target = [IO.Path]::GetFullPath((Join-Path $scratch $relative))
      if (-not $target.StartsWith($scratch + [IO.Path]::DirectorySeparatorChar)) { throw 'ZIP path outside staging directory.' }
      New-Item -ItemType Directory -Path ([IO.Path]::GetDirectoryName($target)) -Force | Out-Null
      [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$target,$true)
      $hash = Git-Checked hash-object -w --no-filters -- $target
      Git-Checked update-index --add --cacheinfo "100644,$hash,$relative" | Out-Null
    }
    $manifest = Get-Content -Raw -LiteralPath (Join-Path $scratch 'manifest.json') | ConvertFrom-Json
    if ($manifest.version -ne $number) { throw "Version mismatch: $number" }
    $name = if ($manifest.name -like '__MSG_*') { 'Toolkit for Azure DevOps' } else { $manifest.name }
    $features = @('Copy commit messages from open work items and linked PR work items.','Identify projects in Add link with compact labels and a current-project star.','Enable or disable modules from the extension popup; refresh Azure after changes.')
    if ([version]$number -ge [version]'1.2.0') { $features += 'Localized interface: English, Portuguese, Spanish, French, Italian, German, Japanese, Korean and Simplified Chinese.' }
    if ([version]$number -ge [version]'1.2.1') { $features += 'Choose a saved interface language or use the browser language automatically.' }
    $readme = @(
      "# $name",'',"Version **$number**",'',
      $version[2], '', '## Features','',
      ($features | ForEach-Object { "- $_" }), '',
      '## Install and update','',
      "Use the archived package [$package]($package), or load the repository folder in developer mode at edge://extensions or chrome://extensions.",
      'For local updates, replace files in the same installation folder, reload the extension and refresh Azure. Store installations receive approved updates through the browser.', '',
      '## Privacy and support','',
      'Work item data is processed locally; requests go to the current Azure DevOps organization. Module preferences are stored on the device. No developer analytics or tracking.',
      '[Privacy policy](PRIVACY.md) · [Support](https://github.com/Picolii/Toolkit-for-Azure-DevOps/issues)', '',
      '## History note','',
      'This version commit was reconstructed from its preserved distribution ZIP. The README is retrospective documentation; original package bytes are unchanged. Commit dates record reconstruction, not original publication dates.'
    ) -join "`n"
    $tempReadme = Join-Path $scratch 'version-readme.md'
    [IO.File]::WriteAllText($tempReadme,$readme + "`n",[Text.UTF8Encoding]::new($false))
    $readmeHash = Git-Checked hash-object -w --no-filters -- $tempReadme
    Git-Checked update-index --add --cacheinfo "100644,$readmeHash,README.md" | Out-Null
    Git-Checked add -- $package | Out-Null
    Git-Checked diff --cached --check | Out-Null
    Git-Checked commit -m "Release ${number}: $($version[2])" | Write-Output
    Git-Checked tag -a "v$number" -m "Version $number - reconstructed from preserved package" | Out-Null
  } finally { $archive.Dispose() }
}
foreach ($historical in @(@('1.0.0','21a45ee'),@('1.0.1','5fd56d9'),@('1.0.2','b090c38'))) {
  if (-not (Git-Checked tag --list "v$($historical[0])")) {
    Git-Checked tag -a "v$($historical[0])" $historical[1] -m "Version $($historical[0]) - original implementation commit" | Out-Null
  }
}
Write-Output "Version history reconstructed. User working files remain intact. Scratch archive: $scratch"

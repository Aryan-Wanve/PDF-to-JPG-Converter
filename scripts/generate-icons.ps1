Add-Type -AssemblyName System.Drawing

$sizes = @(16, 32, 48, 128)
$iconsDir = Join-Path $PSScriptRoot "..\icons"
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

foreach ($size in $sizes) {
  $bitmap = New-Object System.Drawing.Bitmap $size, $size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $rect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(20, 184, 166)), ([System.Drawing.Color]::FromArgb(56, 189, 248)), 45
  $radius = [Math]::Max(3, [Math]::Floor($size / 7))
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $radius * 2
  $path.AddArc(1, 1, $diameter, $diameter, 180, 90)
  $path.AddArc($size - $diameter - 1, 1, $diameter, $diameter, 270, 90)
  $path.AddArc($size - $diameter - 1, $size - $diameter - 1, $diameter, $diameter, 0, 90)
  $path.AddArc(1, $size - $diameter - 1, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  $graphics.FillPath($brush, $path)

  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 255, 255)), ([Math]::Max(1.4, $size / 18))
  $graphics.DrawLine($pen, $size * 0.28, $size * 0.30, $size * 0.72, $size * 0.30)
  $graphics.DrawLine($pen, $size * 0.28, $size * 0.50, $size * 0.62, $size * 0.50)
  $graphics.DrawLine($pen, $size * 0.28, $size * 0.70, $size * 0.72, $size * 0.70)

  $output = Join-Path $iconsDir "icon-$size.png"
  $bitmap.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

function New-PlaceholderPng {
  param(
    [string]$Path,
    [int]$Width,
    [int]$Height,
    [string]$Title,
    [string]$Subtitle
  )

  $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(246, 248, 251))

  $rect = New-Object System.Drawing.RectangleF 0, 0, $Width, $Height
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(13, 148, 136)), ([System.Drawing.Color]::FromArgb(56, 189, 248)), 25
  $graphics.FillRectangle($brush, 0, 0, $Width, $Height)

  $panelBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
  $panel = New-Object System.Drawing.RectangleF ($Width * 0.08), ($Height * 0.14), ($Width * 0.84), ($Height * 0.72)
  $graphics.FillRectangle($panelBrush, $panel)

  $titleFont = New-Object System.Drawing.Font "Segoe UI", ([Math]::Max(18, $Width / 24)), ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $subtitleFont = New-Object System.Drawing.Font "Segoe UI", ([Math]::Max(11, $Width / 42)), ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(18, 22, 31))
  $mutedBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(104, 115, 134))
  $graphics.DrawString($Title, $titleFont, $darkBrush, ($Width * 0.14), ($Height * 0.34))
  $graphics.DrawString($Subtitle, $subtitleFont, $mutedBrush, ($Width * 0.14), ($Height * 0.52))

  New-Item -ItemType Directory -Force -Path (Split-Path $Path) | Out-Null
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$screenshots = Join-Path $PSScriptRoot "..\store-assets\screenshots"
$banners = Join-Path $PSScriptRoot "..\store-assets\banners"
New-PlaceholderPng (Join-Path $screenshots "01-popup-ready.png") 1280 800 "PDF to JPG Converter" "Popup ready state placeholder"
New-PlaceholderPng (Join-Path $screenshots "02-popup-progress.png") 1280 800 "Converting PDF Pages" "Progress state placeholder"
New-PlaceholderPng (Join-Path $screenshots "03-popup-success.png") 1280 800 "JPG Export Complete" "Success state placeholder"
New-PlaceholderPng (Join-Path $screenshots "04-downloads-output.png") 1280 800 "Automatic Folder Output" "Downloads output placeholder"
New-PlaceholderPng (Join-Path $banners "small-promo-440x280.png") 440 280 "PDF to JPG" "Local Chrome conversion"
New-PlaceholderPng (Join-Path $banners "marquee-1400x560.png") 1400 560 "PDF to JPG Converter" "Convert PDFs to JPGs locally in Chrome"

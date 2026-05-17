Add-Type -AssemblyName System.Drawing

$root = Join-Path $PSScriptRoot ".."
$screenshotsDir = Join-Path $root "store-assets\screenshots"
$bannersDir = Join-Path $root "store-assets\banners"
New-Item -ItemType Directory -Force -Path $screenshotsDir | Out-Null
New-Item -ItemType Directory -Force -Path $bannersDir | Out-Null

function New-RoundRectPath {
  param([float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundRect {
  param($Graphics, [float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius, $Brush)
  $path = New-RoundRectPath $X $Y $Width $Height $Radius
  $Graphics.FillPath($Brush, $path)
  $path.Dispose()
}

function Stroke-RoundRect {
  param($Graphics, [float]$X, [float]$Y, [float]$Width, [float]$Height, [float]$Radius, $Pen)
  $path = New-RoundRectPath $X $Y $Width $Height $Radius
  $Graphics.DrawPath($Pen, $path)
  $path.Dispose()
}

function New-Font {
  param([float]$Size, [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Regular)
  return New-Object System.Drawing.Font "Segoe UI", $Size, $Style, ([System.Drawing.GraphicsUnit]::Pixel)
}

function Save-Png {
  param($Bitmap, [string]$Path)
  New-Item -ItemType Directory -Force -Path (Split-Path $Path) | Out-Null
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Draw-BrandIcon {
  param($Graphics, [float]$X, [float]$Y, [float]$Size)
  $rect = New-Object System.Drawing.RectangleF $X, $Y, $Size, $Size
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(45, 212, 191)), ([System.Drawing.Color]::FromArgb(56, 189, 248)), 45
  Fill-RoundRect $Graphics $X $Y $Size $Size ($Size / 5) $brush
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::White), ([Math]::Max(2, $Size / 12))
  $Graphics.DrawLine($pen, $X + $Size * 0.28, $Y + $Size * 0.30, $X + $Size * 0.72, $Y + $Size * 0.30)
  $Graphics.DrawLine($pen, $X + $Size * 0.28, $Y + $Size * 0.50, $X + $Size * 0.62, $Y + $Size * 0.50)
  $Graphics.DrawLine($pen, $X + $Size * 0.28, $Y + $Size * 0.70, $X + $Size * 0.72, $Y + $Size * 0.70)
  $pen.Dispose()
  $brush.Dispose()
}

function Draw-PopupMock {
  param($Graphics, [float]$X, [float]$Y, [float]$Scale, [string]$State)

  $panel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(18, 24, 33))
  $border = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(47, 59, 75)), 1
  Fill-RoundRect $Graphics $X $Y (360 * $Scale) (430 * $Scale) (10 * $Scale) $panel
  Stroke-RoundRect $Graphics $X $Y (360 * $Scale) (430 * $Scale) (10 * $Scale) $border

  $teal = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(45, 212, 191))
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(170, 196, 214))
  $track = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(31, 42, 56))
  $card = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(23, 32, 43))
  $button = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(24, 129, 120))

  $small = New-Font (12 * $Scale) ([System.Drawing.FontStyle]::Bold)
  $title = New-Font (24 * $Scale) ([System.Drawing.FontStyle]::Bold)
  $body = New-Font (13 * $Scale)

  $Graphics.DrawString("LOCAL PDF EXPORT", $small, $teal, $X + 22 * $Scale, $Y + 22 * $Scale)
  $Graphics.DrawString("PDF to JPG Converter", $title, $white, $X + 22 * $Scale, $Y + 46 * $Scale)

  Fill-RoundRect $Graphics ($X + 22 * $Scale) ($Y + 96 * $Scale) (316 * $Scale) (145 * $Scale) (8 * $Scale) $card
  Stroke-RoundRect $Graphics ($X + 22 * $Scale) ($Y + 96 * $Scale) (316 * $Scale) (145 * $Scale) (8 * $Scale) $border
  $Graphics.DrawString("JPG quality", $body, $white, $X + 40 * $Scale, $Y + 118 * $Scale)
  Fill-RoundRect $Graphics ($X + 40 * $Scale) ($Y + 153 * $Scale) (276 * $Scale) (7 * $Scale) (3 * $Scale) $track
  Fill-RoundRect $Graphics ($X + 40 * $Scale) ($Y + 153 * $Scale) (185 * $Scale) (7 * $Scale) (3 * $Scale) $teal
  $Graphics.DrawString("Resolution scale", $body, $white, $X + 40 * $Scale, $Y + 182 * $Scale)
  Fill-RoundRect $Graphics ($X + 40 * $Scale) ($Y + 208 * $Scale) (276 * $Scale) (36 * $Scale) (8 * $Scale) $track

  Fill-RoundRect $Graphics ($X + 22 * $Scale) ($Y + 260 * $Scale) (316 * $Scale) (92 * $Scale) (8 * $Scale) $card
  Stroke-RoundRect $Graphics ($X + 22 * $Scale) ($Y + 260 * $Scale) (316 * $Scale) (92 * $Scale) (8 * $Scale) $border

  if ($State -eq "success") {
    $Graphics.DrawString("Saved 18 JPGs", $body, $white, $X + 40 * $Scale, $Y + 284 * $Scale)
    Fill-RoundRect $Graphics ($X + 40 * $Scale) ($Y + 322 * $Scale) (276 * $Scale) (8 * $Scale) (4 * $Scale) $teal
  } elseif ($State -eq "progress") {
    $Graphics.DrawString("Encoding page 8 of 18", $body, $white, $X + 40 * $Scale, $Y + 284 * $Scale)
    Fill-RoundRect $Graphics ($X + 40 * $Scale) ($Y + 322 * $Scale) (276 * $Scale) (8 * $Scale) (4 * $Scale) $track
    Fill-RoundRect $Graphics ($X + 40 * $Scale) ($Y + 322 * $Scale) (122 * $Scale) (8 * $Scale) (4 * $Scale) $teal
  } else {
    $Graphics.DrawString("Ready to convert", $body, $white, $X + 40 * $Scale, $Y + 284 * $Scale)
    Fill-RoundRect $Graphics ($X + 40 * $Scale) ($Y + 322 * $Scale) (276 * $Scale) (8 * $Scale) (4 * $Scale) $track
  }

  Fill-RoundRect $Graphics ($X + 190 * $Scale) ($Y + 374 * $Scale) (148 * $Scale) (38 * $Scale) (8 * $Scale) $button
  $Graphics.DrawString("Convert", $body, $white, $X + 236 * $Scale, $Y + 384 * $Scale)
}

function Draw-BrowserFrame {
  param($Graphics, [int]$Width, [int]$Height, [string]$Mode)

  $bgRect = New-Object System.Drawing.RectangleF 0, 0, $Width, $Height
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $bgRect, ([System.Drawing.Color]::FromArgb(11, 18, 32)), ([System.Drawing.Color]::FromArgb(15, 118, 110)), 24
  $Graphics.FillRectangle($bg, 0, 0, $Width, $Height)

  $chrome = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(38, 45, 57))
  $viewer = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(229, 236, 243))
  $paper = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $line = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(191, 203, 216)), 2
  $red = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(239, 68, 68)), 2
  $teal = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(45, 212, 191))
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)

  Fill-RoundRect $Graphics 70 52 ($Width - 140) ($Height - 104) 18 $viewer
  Fill-RoundRect $Graphics 70 52 ($Width - 140) 58 18 $chrome
  $Graphics.DrawString("Chapter 01.pdf", (New-Font 18 ([System.Drawing.FontStyle]::Bold)), $white, 112, 72)

  Fill-RoundRect $Graphics 180 145 440 560 4 $paper
  for ($i = 0; $i -lt 7; $i++) {
    $y = 205 + $i * 54
    $Graphics.DrawLine($line, 230, $y, 570, $y)
  }
  $Graphics.DrawLine($red, 230, 365, 570, 365)
  $Graphics.DrawString("PDF page", (New-Font 28 ([System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(18, 24, 33))), 230, 165)

  Draw-PopupMock $Graphics 740 148 1 $Mode
  Draw-BrandIcon $Graphics 1030 92 54
  $Graphics.DrawString("Local PDF to JPG", (New-Font 30 ([System.Drawing.FontStyle]::Bold)), $white, 110, 720)
  $Graphics.DrawString("Quality, scale, ZIP export, and progress in one popup", (New-Font 18), $white, 110, 758)
}

function New-Screenshot {
  param([string]$Path, [string]$Mode)
  $bitmap = New-Object System.Drawing.Bitmap 1280, 800
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  Draw-BrowserFrame $graphics 1280 800 $Mode
  Save-Png $bitmap $Path
  $graphics.Dispose()
  $bitmap.Dispose()
}

function New-OutputScreenshot {
  param([string]$Path)
  $bitmap = New-Object System.Drawing.Bitmap 1280, 800
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  Draw-BrowserFrame $graphics 1280 800 "success"

  $card = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(247, 250, 252))
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(18, 24, 33))
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(71, 85, 105))
  Fill-RoundRect $graphics 140 520 500 150 12 $card
  $graphics.DrawString("Chrome Downloads", (New-Font 26 ([System.Drawing.FontStyle]::Bold)), $ink, 175, 548)
  $graphics.DrawString("Chapter 01.zip", (New-Font 20), $muted, 175, 590)
  $graphics.DrawString("Contains page-001.jpg through page-018.jpg", (New-Font 16), $muted, 175, 625)

  Save-Png $bitmap $Path
  $graphics.Dispose()
  $bitmap.Dispose()
}

function New-Promo {
  param([string]$Path, [int]$Width, [int]$Height, [bool]$Marquee)

  $bitmap = New-Object System.Drawing.Bitmap $Width, $Height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $rect = New-Object System.Drawing.RectangleF 0, 0, $Width, $Height
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(15, 23, 42)), ([System.Drawing.Color]::FromArgb(13, 148, 136)), 32
  $graphics.FillRectangle($bg, 0, 0, $Width, $Height)

  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(206, 241, 240))
  if ($Marquee) {
    Draw-BrandIcon $graphics 110 135 150
    $graphics.DrawString("PDF to JPG Converter", (New-Font 70 ([System.Drawing.FontStyle]::Bold)), $white, 310, 150)
    $graphics.DrawString("Local Chrome export with quality, scale, and ZIP controls", (New-Font 30), $muted, 318, 248)
    Draw-PopupMock $graphics 980 70 0.92 "progress"
  } else {
    Draw-BrandIcon $graphics 34 58 86
    $graphics.DrawString("PDF to JPG", (New-Font 38 ([System.Drawing.FontStyle]::Bold)), $white, 140, 78)
    $graphics.DrawString("Local Chrome export", (New-Font 20), $muted, 144, 127)
    Draw-PopupMock $graphics 298 38 0.42 "progress"
  }

  Save-Png $bitmap $Path
  $graphics.Dispose()
  $bitmap.Dispose()
}

New-Screenshot (Join-Path $screenshotsDir "01-popup-ready.png") "ready"
New-Screenshot (Join-Path $screenshotsDir "02-popup-progress.png") "progress"
New-Screenshot (Join-Path $screenshotsDir "03-popup-success.png") "success"
New-OutputScreenshot (Join-Path $screenshotsDir "04-downloads-output.png")
New-Promo (Join-Path $bannersDir "small-promo-440x280.png") 440 280 $false
New-Promo (Join-Path $bannersDir "marquee-1400x560.png") 1400 560 $true

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

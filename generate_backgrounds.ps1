param(
    [string[]]$Themes = @("datacenter", "office", "server", "dr"),
    [switch]$OpenPreview
)

$ErrorActionPreference = "Stop"

$python = "C:\Users\Paul\AppData\Local\Programs\Python\Python314\python.exe"
$script = "C:\Scripts\it-platformer\generate_custom.py"

$themePrompts = @{
    datacenter = "pixel art datacenter background with long dark server aisles, dense rack rows, blinking status lights, cable trays overhead, subtle cool green and cyan glow, layered depth, moody but readable"
    office     = "pixel art office floor background with desks, monitors, glass meeting rooms, ceiling lights, windows, subtle IT office atmosphere, layered depth, readable silhouettes"
    server     = "pixel art server room background with dense rack corridors, cooling units, storage cabinets, status lights, industrial raised-floor feel, layered tech depth"
    dr         = "pixel art disaster recovery site background with backup racks, storage arrays, dim emergency lighting, isolated facility feeling, purple and blue failover glow, layered depth"
}

$themeFiles = @{
    datacenter = "bg-datacenter"
    office     = "bg-office"
    server     = "bg-server"
    dr         = "bg-dr"
}

foreach ($theme in $Themes) {
    $normalized = $theme.ToLowerInvariant()
    if (-not $themePrompts.ContainsKey($normalized)) {
        Write-Warning "Skipping unknown theme '$theme'. Valid values: datacenter, office, server, dr"
        continue
    }

    $fileName = $themeFiles[$normalized]
    $description = $themePrompts[$normalized]

    Write-Host "Generating $fileName ..."

    $args = @(
        $script,
        "--file", $fileName,
        "--type", "background",
        "--view", "side",
        "--desc", $description
    )

    if ($OpenPreview) {
        $args += "--open"
    } else {
        $args += "--no-open"
    }

    & $python @args
}

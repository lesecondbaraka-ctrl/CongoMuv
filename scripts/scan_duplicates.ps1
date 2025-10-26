$root = 'C:\Users\LEGRAND\Downloads\CongoMuv'
Try {
    Write-Output "Scanning root: $root"
    $files = Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue
    Write-Output ("Found {0} files" -f $files.Count)

    Write-Output "Writing file_list.json..."
    $files | Select-Object FullName, Name, Length | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 (Join-Path $root 'file_list.json')

    Write-Output "Computing duplicate names..."
    $dupn = $files | Group-Object Name | Where-Object {$_.Count -gt 1} | ForEach-Object { [PSCustomObject]@{Name=$_.Name; Paths=$_.Group.FullName} }
    $dupn | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 (Join-Path $root 'duplicate_names.json')

    Write-Output "Computing hashes (this may take a while)..."
    $hashObjs = New-Object System.Collections.ArrayList
    foreach ($f in $files) {
        try {
            $h = Get-FileHash -Algorithm SHA256 -Path $f.FullName -ErrorAction Stop
            $null = $hashObjs.Add([PSCustomObject]@{Path=$f.FullName; Hash=$h.Hash; Size=$f.Length})
        } catch {
            Write-Output ("Hash error: {0} -> {1}" -f $f.FullName, $_.Exception.Message)
        }
    }

    Write-Output "Grouping by hash..."
    $duph = $hashObjs | Group-Object Hash | Where-Object {$_.Count -gt 1} | ForEach-Object { [PSCustomObject]@{Hash=$_.Name; Files=$_.Group | Select-Object Path, Size} }
    $duph | ConvertTo-Json -Depth 6 | Out-File -Encoding utf8 (Join-Path $root 'duplicate_hashes.json')

    Write-Output 'scan-done'
} catch {
    Write-Output ("scan-failed: {0}" -f $_.Exception.Message)
    exit 1
}

$files = Get-ChildItem -Path "src" -Recurse -Include *.tsx,*.ts

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match '(?<!dark:)bg-white/(?:\[[\d.]+\]|\d+)' -or $content -match '(?<!dark:)border-white/(?:\[[\d.]+\]|\d+)') {
        # Replace bg-white/X with bg-black/X dark:bg-white/X
        $newContent = [regex]::Replace($content, '(?<!dark:)bg-white/(\[[\d.]+\]|\d+)', 'bg-black/$1 dark:bg-white/$1')
        # Replace border-white/X with border-black/X dark:border-white/X
        $newContent = [regex]::Replace($newContent, '(?<!dark:)border-white/(\[[\d.]+\]|\d+)', 'border-black/$1 dark:border-white/$1')
        
        if ($newContent -cne $content) {
            [System.IO.File]::WriteAllText($file.FullName, $newContent)
            Write-Host "Updated: $($file.FullName)"
        }
    }
}

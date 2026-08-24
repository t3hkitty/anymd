<#
.SYNOPSIS
    PowerShell Markdown Merger (20260821-1002)
    Merges all *.md files in the current folder into a single file named merged_output.md.
.DESCRIPTION
    Excludes the output file to prevent recursive read/write errors.
    Encodes output as UTF-8.
#>

Get-ChildItem -Filter *.md | Where-Object { $_.Name -ne "merged_output.md" } | Sort-Object Name | ForEach-Object {
    "`n`n# Source: $($_.Name)`n`n" | Out-File -FilePath "merged_output.md" -Append -Encoding utf8
    Get-Content $_.FullName | Out-File -FilePath "merged_output.md" -Append -Encoding utf8
}

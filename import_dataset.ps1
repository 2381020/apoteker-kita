$allRecords = @();
$files = Get-ChildItem D:\file_coding\apoteker-kita\public\dataset\*.csv;
foreach ($file in $files) {
    $content = Import-Csv "$($file.FullName)";
    foreach ($row in $content) {
        $level = $row.Level.Trim();
        if ($level -eq 'Major') { $severity = 'berat' }
        elseif ($level -eq 'Moderate') { $severity = 'sedang' }
        else { $severity = 'ringan' };
        $desc = "Interaksi antara $($row.Drug_A) dan $($row.Drug_B) sebesar $level";
        $rec = 'Konsultasikan dengan dokter atau apoteker';
        $allRecords += [pscustomobject]@{
            drugbankId1 = $row.'DDInterID_A';
            drugbankId2 = $row.'DDInterID_B';
            severity = $severity;
            description = $desc;
            management = $rec;
        };
    }
}
Write-Host "Total records: $($allRecords.Count)" -ForegroundColor Yellow
$allRecords | Select-Object -First 3 | Format-Table | Write-Host -ForegroundColor Cyan
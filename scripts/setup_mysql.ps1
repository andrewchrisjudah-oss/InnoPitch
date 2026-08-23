$ErrorActionPreference = "Stop"

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$schema = Join-Path $PSScriptRoot "..\backend\mysql_schema.sql"

if (-not (Test-Path -LiteralPath $mysql)) {
    throw "MySQL CLI was not found at $mysql"
}

$credential = Get-Credential -UserName "root" -Message "Enter your local MySQL administrator password"
$plainPassword = $credential.GetNetworkCredential().Password
$env:MYSQL_PWD = $plainPassword

try {
    Get-Content -Raw -LiteralPath $schema | & $mysql --protocol=TCP --host=localhost --port=3306 --user=$($credential.UserName)
    if ($LASTEXITCODE -ne 0) { throw "MySQL schema creation failed." }
    Write-Host "KNOMO MySQL database created successfully: knomo_db" -ForegroundColor Green
    & $mysql --protocol=TCP --host=localhost --port=3306 --user=$($credential.UserName) --database=knomo_db --execute="SHOW TABLES;"
}
finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
    $plainPassword = $null
}

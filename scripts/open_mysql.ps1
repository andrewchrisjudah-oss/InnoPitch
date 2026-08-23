$ErrorActionPreference = "Stop"

$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if (-not (Test-Path -LiteralPath $mysql)) {
    throw "MySQL CLI was not found at $mysql"
}

$credential = Get-Credential -UserName "root" -Message "Sign in to the KNOMO MySQL database"
$plainPassword = $credential.GetNetworkCredential().Password
$env:MYSQL_PWD = $plainPassword

try {
    & $mysql --protocol=TCP --host=localhost --port=3306 --user=$($credential.UserName) --database=knomo_db
}
finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
    $plainPassword = $null
}

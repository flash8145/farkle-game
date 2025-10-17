# Farkle API Test Script
# This script tests all API endpoints and reports any errors

$baseUrl = "http://localhost:5186"
$testResults = @()

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  FARKLE API ENDPOINT TEST SUITE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Base URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Description" -ForegroundColor White
    Write-Host "  Method: $Method" -ForegroundColor Gray
    Write-Host "  URL: $baseUrl$Endpoint" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "Accept" = "application/json"
        }
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $params.Add("Body", $jsonBody)
            Write-Host "  Body: $jsonBody" -ForegroundColor Gray
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-Host "  ✅ SUCCESS" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor DarkGray
        Write-Host ""
        
        return @{
            Success = $true
            Endpoint = $Endpoint
            Description = $Description
            Response = $response
            Error = $null
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $errorMessage" -ForegroundColor Red
        Write-Host ""
        
        return @{
            Success = $false
            Endpoint = $Endpoint
            Description = $Description
            Response = $null
            Error = $errorMessage
            StatusCode = $statusCode
        }
    }
}

# ===========================================
# TEST 1: Check API is Running
# ===========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 1: API Health Check" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$result1 = Test-Endpoint -Method "GET" -Endpoint "/api/game/available" -Description "Get Available Games (Health Check)"
$testResults += $result1

# ===========================================
# TEST 2: Create Game
# ===========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 2: Create Game" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$createGameBody = @{
    playerName = "TestPlayer1"
}

$result2 = Test-Endpoint -Method "POST" -Endpoint "/api/game/create" -Description "Create New Game" -Body $createGameBody
$testResults += $result2

$gameId = $null
$gameCode = $null
$player1Id = $null

if ($result2.Success) {
    $gameId = $result2.Response.gameId
    $gameCode = $result2.Response.gameCode
    $player1Id = $result2.Response.playerId
    Write-Host "  🎮 Game Created!" -ForegroundColor Green
    Write-Host "  Game Code: $gameCode" -ForegroundColor Yellow
    Write-Host "  Game ID: $gameId" -ForegroundColor Yellow
    Write-Host "  Player 1 ID: $player1Id" -ForegroundColor Yellow
    Write-Host ""
}

# ===========================================
# TEST 3: Validate Game Code
# ===========================================
if ($gameCode) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 3: Validate Game Code" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $result3 = Test-Endpoint -Method "GET" -Endpoint "/api/game/validate/$gameCode" -Description "Validate Game Code"
    $testResults += $result3
}

# ===========================================
# TEST 4: Get Game by Code
# ===========================================
if ($gameCode) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 4: Get Game by Code" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $result4 = Test-Endpoint -Method "GET" -Endpoint "/api/game/code/$gameCode" -Description "Get Game by Code"
    $testResults += $result4
}

# ===========================================
# TEST 5: Join Game
# ===========================================
if ($gameCode) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 5: Join Game" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $joinGameBody = @{
        gameCode = $gameCode
        playerName = "TestPlayer2"
    }
    
    $result5 = Test-Endpoint -Method "POST" -Endpoint "/api/game/join" -Description "Join Game" -Body $joinGameBody
    $testResults += $result5
    
    $player2Id = $null
    if ($result5.Success) {
        $player2Id = $result5.Response.playerId
        Write-Host "  🎮 Player 2 Joined!" -ForegroundColor Green
        Write-Host "  Player 2 ID: $player2Id" -ForegroundColor Yellow
        Write-Host ""
    }
}

# ===========================================
# TEST 6: Get Game State
# ===========================================
if ($gameId) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 6: Get Game State" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $result6 = Test-Endpoint -Method "GET" -Endpoint "/api/game/$gameId" -Description "Get Game State"
    $testResults += $result6
}

# ===========================================
# TEST 7: Roll Dice (Player 1)
# ===========================================
if ($gameId -and $player1Id) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 7: Roll Dice (Player 1)" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $rollDiceBody = @{
        gameId = $gameId
        playerId = $player1Id
        numberOfDice = 6
    }
    
    $result7 = Test-Endpoint -Method "POST" -Endpoint "/api/game/roll" -Description "Roll Dice" -Body $rollDiceBody
    $testResults += $result7
    
    if ($result7.Success) {
        Write-Host "  🎲 Dice Rolled!" -ForegroundColor Green
        Write-Host "  Dice Values: $($result7.Response.roll.diceValues -join ', ')" -ForegroundColor Yellow
        Write-Host "  Points Scored: $($result7.Response.roll.totalPoints)" -ForegroundColor Yellow
        Write-Host ""
    }
}

# ===========================================
# TEST 8: Can Player Act
# ===========================================
if ($gameId -and $player1Id) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 8: Check Player Can Act" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $result8 = Test-Endpoint -Method "GET" -Endpoint "/api/game/can-act/$gameId/$player1Id" -Description "Check if Player Can Act"
    $testResults += $result8
}

# ===========================================
# SUMMARY
# ===========================================
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$successCount = ($testResults | Where-Object { $_.Success }).Count
$failCount = ($testResults | Where-Object { -not $_.Success }).Count
$totalTests = $testResults.Count

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $successCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "  ❌ $($_.Description)" -ForegroundColor Red
        Write-Host "     Endpoint: $($_.Endpoint)" -ForegroundColor Gray
        Write-Host "     Error: $($_.Error)" -ForegroundColor Gray
        Write-Host ""
    }
}

if ($successCount -eq $totalTests) {
    Write-Host "🎉 ALL TESTS PASSED! Your API is working perfectly!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check the details above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
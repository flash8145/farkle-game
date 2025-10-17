# Enhanced Farkle API Diagnostic Test
# This version captures detailed error messages

$baseUrl = "http://localhost:5186"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTIC TEST WITH ERROR DETAILS" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Function to test endpoint with detailed error capture
function Test-EndpointDetailed {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Description" -ForegroundColor White
    Write-Host "  Method: $Method $baseUrl$Endpoint" -ForegroundColor Gray
    
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
            Write-Host "  Request Body:" -ForegroundColor Gray
            Write-Host $jsonBody -ForegroundColor DarkGray
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        
        Write-Host "  ✅ SUCCESS" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor DarkGreen
        Write-Host ""
        
        return @{
            Success = $true
            Response = $response
        }
    }
    catch {
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        
        # Try to get detailed error from response
        $errorDetails = "Unknown error"
        $statusCode = "N/A"
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "  Status Code: $statusCode" -ForegroundColor Red
            
            try {
                $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                $errorBody = $streamReader.ReadToEnd()
                $streamReader.Close()
                
                Write-Host "  Error Response Body:" -ForegroundColor Red
                Write-Host $errorBody -ForegroundColor DarkRed
                $errorDetails = $errorBody
            }
            catch {
                Write-Host "  Could not read error response body" -ForegroundColor Red
            }
        }
        
        Write-Host "  Exception Message: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        
        return @{
            Success = $false
            Error = $errorDetails
            StatusCode = $statusCode
        }
    }
}

# TEST 1: Create Game
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 1: Create Game" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$createResult = Test-EndpointDetailed -Method "POST" -Endpoint "/api/game/create" -Description "Create New Game" -Body @{
    playerName = "TestPlayer1"
}

if (-not $createResult.Success) {
    Write-Host "Cannot continue tests - game creation failed" -ForegroundColor Red
    exit
}

$gameId = $createResult.Response.gameId
$gameCode = $createResult.Response.gameCode
$player1Id = $createResult.Response.playerId

Write-Host "  🎮 Game Created Successfully!" -ForegroundColor Green
Write-Host "  Game Code: $gameCode" -ForegroundColor Yellow
Write-Host "  Game ID: $gameId" -ForegroundColor Yellow
Write-Host "  Player 1 ID: $player1Id" -ForegroundColor Yellow
Write-Host ""

# TEST 2: Join Game
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 2: Join Game (THE PROBLEMATIC ONE)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$joinResult = Test-EndpointDetailed -Method "POST" -Endpoint "/api/game/join" -Description "Join Game with Second Player" -Body @{
    gameCode = $gameCode
    playerName = "TestPlayer2"
}

if ($joinResult.Success) {
    $player2Id = $joinResult.Response.playerId
    Write-Host "  🎮 Player 2 Joined Successfully!" -ForegroundColor Green
    Write-Host "  Player 2 ID: $player2Id" -ForegroundColor Yellow
    Write-Host ""
    
    # TEST 3: Get Game State After Join
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 3: Get Game State After Join" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $stateResult = Test-EndpointDetailed -Method "GET" -Endpoint "/api/game/$gameId" -Description "Get Updated Game State"
    
    # TEST 4: Roll Dice
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "TEST 4: Roll Dice (THE OTHER PROBLEMATIC ONE)" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $rollResult = Test-EndpointDetailed -Method "POST" -Endpoint "/api/game/roll" -Description "Roll Dice for Player 1" -Body @{
        gameId = $gameId
        playerId = $player1Id
        numberOfDice = 6
    }
    
    if ($rollResult.Success) {
        Write-Host "  🎲 Dice Rolled Successfully!" -ForegroundColor Green
        Write-Host "  Dice: $($rollResult.Response.roll.diceValues -join ', ')" -ForegroundColor Yellow
        Write-Host "  Points: $($rollResult.Response.roll.totalPoints)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️ Join failed - cannot proceed with roll test" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTIC COMPLETE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ Check the error response bodies above for detailed error messages" -ForegroundColor Yellow
Write-Host "   Copy the full error text and share it for debugging" -ForegroundColor Yellow
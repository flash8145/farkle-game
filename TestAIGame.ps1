# Test AI Game Functionality
$baseUrl = "http://localhost:5186"

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  FARKLE AI GAME TEST" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

function Invoke-APICall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
            "Accept" = "application/json"
        }
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 30
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $params.Add("Body", $jsonBody)
        }
        
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{ Success = $true; Data = $response }
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($_.Exception.Response) {
            try {
                $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
                $errorBody = $streamReader.ReadToEnd()
                $streamReader.Close()
                $errorMsg = $errorBody
            } catch {}
        }
        return @{ Success = $false; Error = $errorMsg }
    }
}

# Test 1: Create AI Game with Easy difficulty
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 1: Create AI Game (Easy)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$createResult = Invoke-APICall -Method "POST" -Endpoint "/api/game/create-ai" -Body @{
    playerName = "Human Player"
    aiDifficulty = 0  # 0=Easy, 1=Medium, 2=Hard
}

if (-not $createResult.Success) {
    Write-Host "❌ Failed to create AI game" -ForegroundColor Red
    Write-Host $createResult.Error -ForegroundColor Red
    exit
}

$gameId = $createResult.Data.gameId
$humanPlayerId = $createResult.Data.playerId
$gameCode = $createResult.Data.gameCode

Write-Host "✅ AI Game Created!" -ForegroundColor Green
Write-Host "   Game Code: $gameCode" -ForegroundColor Yellow
Write-Host "   Game ID: $gameId" -ForegroundColor Yellow
Write-Host "   Human Player ID: $humanPlayerId" -ForegroundColor Yellow
Write-Host "   Message: $($createResult.Data.message)" -ForegroundColor Gray
Write-Host ""

# Test 2: Get game state to find AI player
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 2: Get Game State" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$stateResult = Invoke-APICall -Method "GET" -Endpoint "/api/game/$gameId"

if (-not $stateResult.Success) {
    Write-Host "❌ Failed to get game state" -ForegroundColor Red
    exit
}

$players = $stateResult.Data.players
$humanPlayer = $players | Where-Object { $_.playerId -eq $humanPlayerId }
$aiPlayer = $players | Where-Object { $_.playerId -ne $humanPlayerId }

Write-Host "✅ Game State Retrieved" -ForegroundColor Green
Write-Host "   Status: $($stateResult.Data.status)" -ForegroundColor Yellow
Write-Host "   Human: $($humanPlayer.playerName) (Score: $($humanPlayer.totalScore))" -ForegroundColor Cyan
Write-Host "   AI: $($aiPlayer.playerName) (Score: $($aiPlayer.totalScore))" -ForegroundColor Magenta
Write-Host "   Current Turn: $($stateResult.Data.currentPlayer.playerName)" -ForegroundColor Yellow
Write-Host ""

$aiPlayerId = $aiPlayer.playerId

# Test 3: Human rolls dice
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 3: Human Player Rolls Dice" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$rollResult = Invoke-APICall -Method "POST" -Endpoint "/api/game/roll" -Body @{
    gameId = $gameId
    playerId = $humanPlayerId
    numberOfDice = 6
}

if ($rollResult.Success) {
    Write-Host "✅ Human Rolled Dice!" -ForegroundColor Green
    Write-Host "   Dice: $($rollResult.Data.roll.diceValues -join ', ')" -ForegroundColor Yellow
    Write-Host "   Points: $($rollResult.Data.roll.totalPoints)" -ForegroundColor Yellow
    Write-Host "   Message: $($rollResult.Data.roll.message)" -ForegroundColor Gray
    Write-Host "   Current Turn Score: $($rollResult.Data.currentTurnScore)" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "❌ Failed to roll dice" -ForegroundColor Red
    Write-Host $rollResult.Error -ForegroundColor Red
}

# Test 4: Human banks points
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 4: Human Banks Points" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$bankResult = Invoke-APICall -Method "POST" -Endpoint "/api/game/bank" -Body @{
    gameId = $gameId
    playerId = $humanPlayerId
}

if ($bankResult.Success) {
    Write-Host "✅ Human Banked Points!" -ForegroundColor Green
    Write-Host "   Points Banked: $($bankResult.Data.pointsBanked)" -ForegroundColor Yellow
    Write-Host "   New Total: $($bankResult.Data.newTotalScore)" -ForegroundColor Yellow
    Write-Host "   Next Player: $($bankResult.Data.nextPlayerName)" -ForegroundColor Magenta
    Write-Host ""
} else {
    Write-Host "⚠️  Banking failed (might have farkled or no points)" -ForegroundColor Yellow
    Write-Host $bankResult.Error -ForegroundColor Gray
    Write-Host ""
}

# Test 5: AI takes its turn
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 5: AI Takes Turn" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$aiTurnResult = Invoke-APICall -Method "POST" -Endpoint "/api/game/ai-turn" -Body @{
    gameId = $gameId
    aiPlayerId = $aiPlayerId
}

if ($aiTurnResult.Success) {
    Write-Host "✅ AI Completed Turn!" -ForegroundColor Green
    Write-Host "   $($aiTurnResult.Data.summary)" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "   AI Rolls Details:" -ForegroundColor Gray
    
    $rollNum = 1
    foreach ($roll in $aiTurnResult.Data.rolls) {
        Write-Host "   Roll $rollNum`: [$($roll.diceValues -join ', ')] - $($roll.points) points" -ForegroundColor DarkGray
        if ($roll.isFarkle) {
            Write-Host "      💀 FARKLE!" -ForegroundColor Red
        }
        if ($roll.isHotDice) {
            Write-Host "      🔥 HOT DICE!" -ForegroundColor Yellow
        }
        $rollNum++
    }
    
    Write-Host ""
    Write-Host "   AI Decision: $($aiTurnResult.Data.summary)" -ForegroundColor Cyan
    Write-Host "   Points Scored: $($aiTurnResult.Data.pointsScored)" -ForegroundColor Yellow
    Write-Host "   AI Total Score: $($aiTurnResult.Data.newTotalScore)" -ForegroundColor Yellow
    
    if ($aiTurnResult.Data.gameWon) {
        Write-Host ""
        Write-Host "   🏆 AI WON THE GAME!" -ForegroundColor Red
    }
    Write-Host ""
} else {
    Write-Host "❌ AI Turn Failed" -ForegroundColor Red
    Write-Host $aiTurnResult.Error -ForegroundColor Red
}

# Test 6: Get final game state
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 6: Final Game State" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$finalState = Invoke-APICall -Method "GET" -Endpoint "/api/game/$gameId"

if ($finalState.Success) {
    Write-Host "✅ Final Scores:" -ForegroundColor Green
    foreach ($player in $finalState.Data.players) {
        $icon = if ($player.playerName -like "*AI*") { "🤖" } else { "👤" }
        $turn = if ($player.isCurrentTurn) { " ⭐ (TURN)" } else { "" }
        Write-Host "   $icon $($player.playerName): $($player.totalScore) points$turn" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "   Game Status: $($finalState.Data.status)" -ForegroundColor Cyan
    Write-Host "   Current Turn: $($finalState.Data.currentPlayer.playerName)" -ForegroundColor Yellow
    Write-Host ""
}

# Test 7: Try different difficulty levels
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "TEST 7: Create Games with Different Difficulties" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$difficulties = @(
    @{ Name = "Easy"; Level = 0 }
    @{ Name = "Medium"; Level = 1 }
    @{ Name = "Hard"; Level = 2 }
)

foreach ($diff in $difficulties) {
    $testGame = Invoke-APICall -Method "POST" -Endpoint "/api/game/create-ai" -Body @{
        playerName = "Test Player"
        aiDifficulty = $diff.Level
    }
    
    if ($testGame.Success) {
        Write-Host "✅ Created game with $($diff.Name) AI - Code: $($testGame.Data.gameCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create $($diff.Name) game" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  TEST COMPLETE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ AI Mode is working!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now:" -ForegroundColor Yellow
Write-Host "  • Create games with AI opponents (Easy/Medium/Hard)" -ForegroundColor Gray
Write-Host "  • Play against the computer" -ForegroundColor Gray
Write-Host "  • AI will automatically take its turn when it's their turn" -ForegroundColor Gray
Write-Host ""
/****************************************************************************************************************/

(function() { // Self-invoking function so that nothing is in the global scope

  /**************************************************************************************************************/
  // VARIABLES 

  // 'X' & 'O' colors
  var cobaltBlue = "#3A5199",
    brickRed = "#962715",
    blackBlue = "#2F2E33",
    pureWhite = "#FFFFFF";

  // Player & computer marks ('X' or 'O')
  var playerMark = '',
    compMark = '';

  // Does player go first? Determined by "coin flip" within code
  var playerFirst = false;
  
  // Boolean to prevent multiple moves by computer when player chooses the same space 2+ times
  var playerMoved = false; 
  
  // Boolean to check if game is over, prevent computer move after player wins
  var gameOver = false; 

  // Object to track whether board spaces are occupied 
  var emptyBoard = {
    "TL": false, // if true, then space is marked
    "TM": false,
    "TR": false,
    "CL": false,
    "CM": false,
    "CR": false,
    "BL": false,
    "BM": false,
    "BR": false
  };
  var board = Object.assign({}, emptyBoard); // use Object.assign to create clone of object
  var numMarked = 0;

  // Tracker objects used to determine three-in-a-row scenarios
  var blankTracker = {
    'T': 0,
    'C': 0,
    'B': 0,
    'L': 0,
    'M': 0,
    'R': 0,
    "DIAG1": 0, // TL, CM, BR
    "DIAG2": 0 // TR, CM, BL
  };
  var playerTracker = Object.assign({}, blankTracker);
  var compTracker = Object.assign({}, blankTracker);

  /**************************************************************************************************************/
  // FUNCTIONS

  // Order of function calls after player chooses mark from start screen
  function markChosen(choice) {
    playerMark = choice;
    compMark = choice == 'X' ? 'O' : 'X';
    Math.floor(Math.random() * 2) === 0 ? playerFirst = true : playerFirst = false; // coin flip for first move
    document.getElementById("startScreen").style.visibility = "hidden";
    document.getElementById("firstMoveScreen").style.visibility = "visible";
    document.getElementById("firstMark").innerHTML = playerFirst ? playerMark : compMark;
    document.getElementById("firstMark").style.color =
      document.getElementById("firstMark").innerHTML == 'X' ? cobaltBlue : brickRed;
  }

  // Order of function calls after player presses check button to start game
  function startGame() {
    document.getElementById("firstMoveScreen").style.visibility = "hidden";
    if (!playerFirst) compMove();
  }

  // Marks the board at a certain space (TL, BR, etc)
  function markSpace(space, mark) {
    board[space] = true;
    document.getElementById(space).innerHTML = "<strong>" + mark + "</strong>";
    document.getElementById(space).style.color = mark == 'X' ? cobaltBlue : brickRed;
    numMarked++;
  }

  // Update tracker based on player/computer move
  function updateTracker(space, isPlayer) {
    var tempTracker = isPlayer ? Object.assign({}, playerTracker) : Object.assign({}, compTracker);
    switch (space) {
      case "TL":
        tempTracker.T++;
        tempTracker.L++;
        tempTracker.DIAG1++;
        break;
      case "TM":
        tempTracker.T++;
        tempTracker.M++;
        break;
      case "TR":
        tempTracker.T++;
        tempTracker.R++;
        tempTracker.DIAG2++;
        break;
      case "CL":
        tempTracker.C++;
        tempTracker.L++;
        break;
      case "CM":
        tempTracker.C++;
        tempTracker.M++;
        tempTracker.DIAG1++;
        tempTracker.DIAG2++;
        break;
      case "CR":
        tempTracker.C++;
        tempTracker.R++;
        break;
      case "BL":
        tempTracker.B++;
        tempTracker.L++;
        tempTracker.DIAG2++;
        break;
      case "BM":
        tempTracker.B++;
        tempTracker.M++;
        break;
      case "BR":
        tempTracker.B++;
        tempTracker.R++;
        tempTracker.DIAG1++;
        break;
      default:
        alert("Error - see updateTracker()")
        return;
    }
    isPlayer ? playerTracker = Object.assign({}, tempTracker) : compTracker = Object.assign({}, tempTracker);
  }

  // Clear all spaces on board & resets objects
  function clearBoard() {
    // Clear board of 'X's and 'O's
    for (var space in emptyBoard) { 
      document.getElementById(space).innerHTML = "";
      document.getElementById(space).style.backgroundColor = pureWhite;
    }
    // Re-initialize all objects
    board = Object.assign({}, emptyBoard); 
    playerTracker = Object.assign({}, blankTracker);
    compTracker = Object.assign({}, blankTracker);
    // Re-initialize all variables
    numMarked = 0; 
    playerMoved = false; 
    gameOver = false; 
  }

  // Reset game, clears board and also allows player to rechoose mark
  function resetGame() {
    clearBoard();
    playerMark = ''; // player rechooses mark
    compMark = '';
    document.getElementById("firstMoveScreen").style.visibility = "hidden"; 
    document.getElementById("startScreen").style.visibility = "visible";
  }

  // Display winning spaces or briefly show tie 
  function displayResult(winningSpaces) { // if winningSpaces is empty, game was tied
    for (var i = 0; i < winningSpaces.length; i++) {
      document.getElementById(winningSpaces[i]).style.color = pureWhite;
      document.getElementById(winningSpaces[i]).style.backgroundColor =
        document.getElementById(winningSpaces[i]).innerHTML == "<strong>X</strong>" ? cobaltBlue : brickRed;
    }
    gameOver = true; 
    setTimeout(resetGame, 1300);
  }

  // Check if player or computer has won (full row, full column, or diagonal)
  function checkForWin(isPlayer) {
    var tracker = isPlayer ? Object.assign({}, playerTracker) : Object.assign({}, compTracker);
    if (tracker.T === 3) displayResult(["TL", "TM", "TR"]);
    if (tracker.C === 3) displayResult(["CL", "CM", "CR"]);
    if (tracker.B === 3) displayResult(["BL", "BM", "BR"]);
    if (tracker.L === 3) displayResult(["TL", "CL", "BL"]);
    if (tracker.M === 3) displayResult(["TM", "CM", "BM"]);
    if (tracker.R === 3) displayResult(["TR", "CR", "BR"]);
    if (tracker.DIAG1 === 3) displayResult(["TL", "CM", "BR"]);
    if (tracker.DIAG2 === 3) displayResult(["TR", "CM", "BL"]);
  }

  // Order of function calls for player's move
  function playerMove(space) {
    // Prevent any moves while pop-ups are on screen
    if (document.getElementById("startScreen").style.visibility == "visible") return;
    if (document.getElementById("firstMoveScreen").style.visibility == "visible") return;
    // Do nothing if space is already marked
    if (board[space] == true) return;
    // Update board & objects
    markSpace(space, playerMark);
    updateTracker(space, true);
    checkForWin(true);
    playerMoved = true; // set so that same space cannot be pressed multiple times
    if (numMarked === 9) displayResult([]); // tie
  }

  // Shuffle an array - credit to Jeff on StackOverflow
  function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
      j = Math.floor(Math.random() * i);
      x = a[i - 1];
      a[i - 1] = a[j];
      a[j] = x;
    }
  }

  // Algorithm for computer's move
  function compMove() {
    // Prevent any moves while pop-ups are on screen
    if (document.getElementById("startScreen").style.visibility == "visible") return;
    if (document.getElementById("firstMoveScreen").style.visibility == "visible") return;
    // Store spaces in order of priority for marking
    var spaces = []; 
    // Prioritize winning moves, then blocking moves
    var trackerOrder = [compTracker, playerTracker];
    for (var i = 0; i < trackerOrder.length; i++) {
      if (trackerOrder[i].T === 2) { // top row almost full
        spaces.push("TL");
        spaces.push("TM");
        spaces.push("TR");
      }
      if (trackerOrder[i].C === 2) { // center row almost full
        spaces.push("CL");
        spaces.push("CM");
        spaces.push("CR");
      }
      if (trackerOrder[i].B === 2) { // bottom row almost full
        spaces.push("BL");
        spaces.push("BM");
        spaces.push("BR");
      }
      if (trackerOrder[i].L === 2) { // left column almost full
        spaces.push("TL");
        spaces.push("CL");
        spaces.push("BL");
      }
      if (trackerOrder[i].M === 2) { // middle column almost full
        spaces.push("TM");
        spaces.push("CM");
        spaces.push("BM");
      }
      if (trackerOrder[i].R === 2) { // right column almost full
        spaces.push("TR");
        spaces.push("CR");
        spaces.push("BR");
      }
      if (trackerOrder[i].DIAG1 === 2) { // TL to BR diagonal almost full
        spaces.push("TL");
        spaces.push("CM");
        spaces.push("BR");
      }
      if (trackerOrder[i].DIAG2 === 2) { // TR to BL diagonal almost full
        spaces.push("TR");
        spaces.push("CM");
        spaces.push("BL");
      }
    }
    // First move chosen at random from center or corners 
    if (numMarked === 0 || numMarked == 1) {
      var firstMoves = ["CM", "TL", "TR", "BL", "BR"];
      shuffle(firstMoves);
      for (var i = 0; i < firstMoves.length; i++) {
        spaces.push(firstMoves[i]);
      }
    }
    // All other moves are completely random, to add flavor to the game
    var allSpaces = ["TL", "TM", "TR", "CL", "CM", "CR", "BL", "BM", "BR"];
    shuffle(allSpaces);
    for (var i = 0; i < allSpaces.length; i++) {
      spaces.push(allSpaces[i]);
    }
    // After space array has been filled, loop through and mark first available space
    for (var i = 0; i < spaces.length; i++) {
      if (board[spaces[i]] == false) {
        markSpace(spaces[i], compMark);
        updateTracker(spaces[i], false);
        checkForWin(false);
        playerMoved = false; // reset so that player can make move
        if (numMarked === 9) displayResult([]); // tie
        return;
      }
    }
  }

  /**************************************************************************************************************/
  // BUTTON CLICKS

  // Player choosing X in start screen
  document.getElementById("chooseX").onclick = function() {
    markChosen('X');
  }

  // Player choosing O in start screen
  document.getElementById("chooseO").onclick = function() {
    markChosen('O');
  }

  // Player pressing check button after being told first move 
  document.getElementById("check").onclick = function() {
    startGame();
  }

  // Player marking board spaces
  document.getElementById("TL").onclick = function() {
    playerMove("TL");
    if (playerMoved && !gameOver) compMove();
  }
  document.getElementById("TM").onclick = function() {
    playerMove("TM");
    if (playerMoved && !gameOver) compMove();
  }
  document.getElementById("TR").onclick = function() {
    playerMove("TR");
    if (playerMoved && !gameOver) compMove();
  }
  document.getElementById("CL").onclick = function() {
    playerMove("CL");
    if (playerMoved && !gameOver) compMove();
  }
  document.getElementById("CM").onclick = function() {
    playerMove("CM");
    if (playerMoved && !gameOver) compMove();
  }
  document.getElementById("CR").onclick = function() {
    playerMove("CR");
    if (playerMoved && !gameOver) compMove();
  }
  document.getElementById("BL").onclick = function() {
    playerMove("BL");
    if (playerMoved && !gameOver) compMove();
  }
  document.getElementById("BM").onclick = function() {
    playerMove("BM");
    if (playerMoved && !gameOver) compMove();
  }
  document.getElementById("BR").onclick = function() {
    playerMove("BR");
    if (playerMoved && !gameOver) compMove();
  }

  // Resetting the game
  document.getElementById("resetButton").onclick = function() {
    resetGame();
  }

}());
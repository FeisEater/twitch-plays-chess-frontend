MyApp.controller("IntroController", function($scope, ApiService) {
  $scope.start = "";
  $scope.end = "";
  $scope.showStart = "";
  $scope.showEnd = "";
  $scope.moveOptions = [];
  $scope.board = new Array(8);
  for (var i = 0; i < 8; i++) {
    $scope.board[i] = new Array(8);
  }
  $scope.availableMoves = [];
  $scope.color = (Math.random() < 0.5) ? "black" : "white";
  $scope.voted = false;
  
  fetchMoves();
  setInterval(fetchMoves, 1000);
  
  function convertFormat(x, y) {
    var letters = "abcdefgh";
    var numbers = "87654321";
    return letters.charAt(x - 1) + numbers.charAt(y - 1);
  }

  function toArrayCoordinates(chessNotation) {
    var letter = chessNotation.charAt(0);
    var number = chessNotation.charAt(1);
    var letters = "abcdefgh";
    
    var x;
    for (var i = 0; i < 8; i++) {
      if (letters.charAt(i) == letter) {
        x = i;
        break;
      }
    }
    var y = 8 - number;
    return { x: x, y: y};
  }

  function initializeBoard() {
    clearBoard();
    placeFigures("black");
    placeFigures("white");
    $scope.moveNum = 1;
  }

  function clearBoard() {
    for (var x = 0; x < 8; x++) {
      for (var y = 0; y < 8; y++) {
        $scope.board[x][y] = "";
      }
    }
  }
  
  function placeFigures(color) {
    if (color != "black" && color != "white") {
      return;
    }
    
    var row = (color == "black" ? 0 : 7);
    $scope.board[0][row] = $scope.board[7][row] = (color == "black" ? "\u265c" : "\u2656");
    $scope.board[1][row] = $scope.board[6][row] = (color == "black" ? "\u265e" : "\u2658");
    $scope.board[2][row] = $scope.board[5][row] = (color == "black" ? "\u265d" : "\u2657");
    $scope.board[3][row] = (color == "black" ? "\u265b" : "\u2655");
    $scope.board[4][row] = (color == "black" ? "\u265a" : "\u2654");
    
    row = (color == "black" ? 1 : 6);
    for (var i = 0; i < 8; i++) {
      $scope.board[i][row] = (color == "black" ? "\u265f" : "\u2659");
    }
  }

  function fetchMoves() {
    ApiService.updateBoard(handleMoves);
  }
  
  function handleMoves(data) {
    if (data.moves.length >= $scope.moveNum) {
      $scope.voted = false;
      $scope.start = "";
      $scope.end = "";
      $scope.showStart = "";
      $scope.showEnd = "";
    }
    rebuildBoard(data.moves);
    var colorOfTurn = ($scope.moveNum % 2 == 0) ? "black" : "white";
    if ($scope.color == colorOfTurn) {
      $scope.availableMoves = data.availableMoves;
    } else {
      $scope.availableMoves = "";
    }
    $scope.notification = data.notification;
    $scope.votes = data.votes;
  }
  
  function rebuildBoard(moves) {
    initializeBoard();
    moves.sort(function(a,b){return a.position - b.position;});
    for (var i = 0; i < moves.length; i++) {
      makeMove(moves[i]);
    }
  }

  function castlingLogic(move, figure) {
    if (move.start == "e8" && move.end == "c8" && figure == "king") {
      $scope.board[3][0] = $scope.board[0][0];
      $scope.board[0][0] = "";
    }
    if (move.start == "e8" && move.end == "g8" && figure == "king") {
      $scope.board[5][0] = $scope.board[7][0];
      $scope.board[7][0] = "";
    }
    if (move.start == "e1" && move.end == "c1" && figure == "king") {
      $scope.board[3][7] = $scope.board[0][7];
      $scope.board[0][7] = "";
    }
    if (move.start == "e1" && move.end == "g1" && figure == "king") {
      $scope.board[3][7] = $scope.board[0][7];
      $scope.board[0][7] = "";
    }
    if (move.other == "castling" && move.start == "a8" && move.end == "d8" && figure == "rook") {
      $scope.board[2][0] = $scope.board[4][0];
      $scope.board[4][0] = "";
    }
    if (move.other == "castling" && move.start == "h8" && move.end == "f8" && figure == "rook") {
      $scope.board[6][0] = $scope.board[4][0];
      $scope.board[4][0] = "";
    }
    if (move.other == "castling" && move.start == "a1" && move.end == "d1" && figure == "rook") {
      $scope.board[2][7] = $scope.board[4][7];
      $scope.board[4][7] = "";
    }
    if (move.other == "castling" && move.start == "h1" && move.end == "f1" && figure == "rook") {
      $scope.board[6][7] = $scope.board[4][7];
      $scope.board[4][7] = "";
    }
  }
  
  function enPassantLogic(move, figure) {
    if (figure != "\u265f" && figure != "\u2659") {
      return;
    }
    var coordStart = toArrayCoordinates(move.start);
    var coordEnd = toArrayCoordinates(move.end);
    if (!$scope.board[coordEnd.x][coordEnd.y] &&
        Math.abs(coordStart.x - coordEnd.x) == 1 &&
        Math.abs(coordStart.y - coordEnd.y) == 1) {
      $scope.board[coordEnd.x][coordStart.y] = "";
    }
  }

  function promotionLogic(move) {
    var coordStart = toArrayCoordinates(move.start);
    var coordEnd = toArrayCoordinates(move.end);
    var figure = $scope.board[coordEnd.x][coordEnd.y];
    if (coordEnd.y == 7 && figure == "\u265f") {
      if (move.other == "queen")  $scope.board[coordEnd.x][coordEnd.y] = "\u265b";
      if (move.other == "knight")  $scope.board[coordEnd.x][coordEnd.y] = "\u265e";
      if (move.other == "rook")  $scope.board[coordEnd.x][coordEnd.y] = "\u265c";
      if (move.other == "bishop")  $scope.board[coordEnd.x][coordEnd.y] = "\u265d";
    }
    if (coordEnd.y == 0 && figure == "\u2659") {
      if (move.other == "queen")  $scope.board[coordEnd.x][coordEnd.y] = "\u2655";
      if (move.other == "knight")  $scope.board[coordEnd.x][coordEnd.y] = "\u2658";
      if (move.other == "rook")  $scope.board[coordEnd.x][coordEnd.y] = "\u2656";
      if (move.other == "bishop")  $scope.board[coordEnd.x][coordEnd.y] = "\u2657";
    }
  }

  function makeMove(move) {
    var coordStart = toArrayCoordinates(move.start);
    var coordEnd = toArrayCoordinates(move.end);
    var figure = $scope.board[coordStart.x][coordStart.y];
    enPassantLogic(move, figure);
    $scope.board[coordStart.x][coordStart.y] = "";
    $scope.board[coordEnd.x][coordEnd.y] = figure;
    var castler = "";
    if (figure == "\u265a" || figure == "\u2654") castler = "king";
    if (figure == "\u265c" || figure == "\u2656") castler = "rook";
    if (castler)  castlingLogic(move, castler);
    promotionLogic(move);
    $scope.moveNum++;
  }
  
  function waitForVotes(move) {
  }

  function moveNeedsAdditionalInfo(endX, endY) {
    var coordStart = toArrayCoordinates($scope.start);
    if ((coordStart.y == 1 && endY == 0 && $scope.board[coordStart.x][coordStart.y] == "\u2659") ||
        (coordStart.y == 6 && endY == 7 && $scope.board[coordStart.x][coordStart.y] == "\u265f")) {
      $scope.moveOptions.push(
        {type: "queen", title: "Promote to queen"},
        {type: "knight", title: "Promote to knight"},
        {type: "rook", title: "Promote to rook"},
        {type: "bishop", title: "Promote to bishop"}
      );
      return true;
    }
    var mayCastle = "";
    for (var i = 0; i < $scope.availableMoves.length; i++) {
      coordStart = toArrayCoordinates($scope.availableMoves[i].start);
      if ($scope.board[coordStart.x][coordStart.y] != "\u265a" &&
          $scope.board[coordStart.x][coordStart.y] != "\u2654") {
        continue;
      }
      for (var j = 0; j < $scope.availableMoves[i].end.length; j++) {
        var coordEnd = toArrayCoordinates($scope.availableMoves[i].end[j]);
        if (coordStart.x - coordEnd.x == 2) {
          mayCastle = mayCastle ? "both" : "left";
        }
        if (coordEnd.x - coordStart.x == 2) {
          mayCastle = mayCastle ? "both" : "right";
        }
      }
    }
    if (mayCastle) {
      coordStart = toArrayCoordinates($scope.start);
      if ($scope.board[coordStart.x][coordStart.y] == "\u265c" ||
          $scope.board[coordStart.x][coordStart.y] == "\u2656") {
        if (mayCastle == "left" || mayCastle == "both") {
          if (coordStart.x == 0 && endX == 3) {
            $scope.moveOptions.push(
              {type: "castling", title: "Perform castling"},
              {type: "", title: "Leave as it is"}
            );
            return true;
          }
        }
        if (mayCastle == "right" || mayCastle == "both") {
          if (coordStart.x == 7 && endX == 5) {
            $scope.moveOptions.push(
              {type: "castling", title: "Perform castling"},
              {type: "", title: "Leave as it is"}
            );
            return true;
          }
        }
      }
    }
    return false;
  }
  
  function canClickStart(x, y) {
    if ($scope.voted) {
      return false;
    }
    for (var i = 0; i < $scope.availableMoves.length; i++) {
      var coord = toArrayCoordinates($scope.availableMoves[i].start);
      if (coord.x == x && coord.y == y) {
        return true;
      }
    }
    return false;
  }
  
  function canClickEnd(x, y) {
    if ($scope.voted) {
      return false;
    }
    var startCoord = toArrayCoordinates($scope.start);
    for (var i = 0; i < $scope.availableMoves.length; i++) {
      var coord = toArrayCoordinates($scope.availableMoves[i].start);
      if (coord.x == startCoord.x && coord.y == startCoord.y) {
        for (var j = 0; j < $scope.availableMoves[i].end.length; j++) {
          var endCoord = toArrayCoordinates($scope.availableMoves[i].end[j]);
          if (endCoord.x == x && endCoord.y == y) {
            return true;
          }
        }
        return false;
      }
    }
    return false;
  }

  $scope.clickCell = function(x, y){
    if ($scope.end) {
      return;
    }
    if ($scope.start) {
      if (canClickEnd(x - 1, y - 1)) {
        if (moveNeedsAdditionalInfo(x - 1, y - 1)) {
          $scope.end = convertFormat(x, y);
        } else {
          ApiService.makeMove({
            start: $scope.start,
            end: convertFormat(x, y)
          }, waitForVotes);
          $scope.voted = true;
          $scope.end = convertFormat(x, y);
          $scope.showStart = $scope.start;
          $scope.showEnd = $scope.end;
        }
      }
    } else {
      if (canClickStart(x - 1, y - 1)) {
        $scope.start = convertFormat(x, y);
      }
    }
  }
  
  $scope.setOther = function(moveOption){
    if (!$scope.start || !$scope.end) {
      return;
    }
    ApiService.makeMove({
      start: $scope.start,
      end: $scope.end,
      other: moveOption
    }, waitForVotes);
    $scope.moveOptions = [];
    $scope.voted = true;
    $scope.showStart = $scope.start;
    $scope.showEnd = $scope.end;
  }
  
  $scope.chooseColor = function(x, y){
    var result = (x % 2 == y % 2) ? "square-white" : "square-black";
    if ($scope.showStart == convertFormat(x, y) || $scope.showEnd == convertFormat(x, y)) {
      return "square-selected";
    }
    if (!$scope.start || $scope.voted) {
      return result;
    }
    var index = -1;
    for (var i = 0; i < $scope.availableMoves.length; i++) {
      if ($scope.availableMoves[i].start == $scope.start) {
        index = i;
        break;
      }
    }
    if (index == -1) {
      return result;
    }
    for (var i = 0; i < $scope.availableMoves[index].end.length; i++) {
      var coord = toArrayCoordinates($scope.availableMoves[index].end[i]);
      if ((x - 1) == coord.x && (y - 1) == coord.y) {
        return result += "-valid";
      }
    }
    return result += "-invalid";
  }
  
  $scope.turnMessage = function(){
    var colorOfTurn = ($scope.moveNum % 2 == 0) ? "black" : "white";
    if (colorOfTurn == $scope.color) {
      return "Your turn.";
    }
    return "Opponent's turn.";
  }
  
  $scope.notateMove = function(vote){
    if (vote.other) {
      return vote.start + "-" + vote.end + ": " + vote.other;
    }
    return vote.start + "-" + vote.end;
  }
  
  $scope.showMove = function(move){
    $scope.showStart = move.start;
    $scope.showEnd = move.end;
  }
  
  $scope.showYourMove = function(){
    $scope.showStart = $scope.start;
    $scope.showEnd = $scope.end;
  }
  
  $scope.voteHighlighter = function(move){
    if (move.start == $scope.start && move.end == $scope.end) {
      return "yourVote";
    }
    return "highlight";
  }
});

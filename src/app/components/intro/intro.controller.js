MyApp.controller("IntroController", function($scope, ApiService) {
  $scope.start = "";
  $scope.board = new Array(8);
  for (var i = 0; i < 8; i++) {
    $scope.board[i] = new Array(8);
  }
  $scope.availableMoves = [];

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
    rebuildBoard(data.moves);
    $scope.availableMoves = data.availableMoves;
    /*for (var s = 0; s < data.availableMoves.length; s++) {
      $scope.availableMoves[s] = {
        start: toArrayCoordinates(data.availableMoves[s].start),
        end: []
      }
      for (var e = 0; e < data.availableMoves[s].end.length; e++) {
        $scope.availableMoves[s].end.push(toArrayCoordinates(data.availableMoves[s].end[e]));
      }
    }*/
  }
  
  function rebuildBoard(moves) {
    initializeBoard();
    moves.sort(function(a,b){return a.position - b.position;});
    for (var i = 0; i < moves.length; i++) {
      makeMove(moves[i]);
    }
  }

  function makeMove(move) {
    var coordStart = toArrayCoordinates(move.start);
    var coordEnd = toArrayCoordinates(move.end);
    var figure = $scope.board[coordStart.x][coordStart.y];
    $scope.board[coordStart.x][coordStart.y] = "";
    $scope.board[coordEnd.x][coordEnd.y] = figure;
    $scope.moveNum++;
  }

  $scope.clickCell = function(x, y){
    if ($scope.start) {
      sentMove = ApiService.makeMove({
        start: $scope.start,
        end: convertFormat(x, y)
      }, makeMove);
      $scope.start = "";
    } else {
      $scope.start = convertFormat(x, y);
    }
  }
  
  $scope.chooseColor = function(x, y){
    var result = (x % 2 == y % 2) ? "square-white" : "square-black";
    if (!$scope.start) {
      return result;
    }
    var index = -1;
    for (var i = 0; i < $scope.availableMoves.length; i++) {
      if ($scope.availableMoves[i].start == $scope.start) {
        if ($scope.start == convertFormat(x, y)) {
          return "square-selected";
        }
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
});

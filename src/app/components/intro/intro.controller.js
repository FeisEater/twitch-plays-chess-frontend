//const Api = require("../api/ApiService");

MyApp.controller("IntroController", function($scope, ApiService) {
  $scope.start = "";
  
  function convertFormat(x, y) {
    var letters = "abcdefgh";
    var numbers = "87654321";
    return letters.charAt(x - 1) + numbers.charAt(y - 1);
  }
  
  $scope.clickCell = function(x, y){
    if ($scope.start) {
      ApiService.makeMove({
        start: $scope.start,
        end: convertFormat(x, y)
      });
      $scope.start = "";
    } else {
      $scope.start = convertFormat(x, y);
    }
  }
});

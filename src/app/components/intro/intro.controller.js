MyApp.controller("IntroController", function($scope) {
  $scope.clickCell = function(x, y){
    alert("clicked " + x + " and " + y);
  }
});

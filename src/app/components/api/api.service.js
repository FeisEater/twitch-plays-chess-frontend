MyApp.service("ApiService", function($http) {

  this.syncMethod = function() {
    return 0;
  }

  this.getThings = function() {
    return $http.get("/thing")
      .then(function (response) {
        return response.data;
      })
      .catch(function (err) {
        console.error("Error ApiService getThings ", err);
        return {};
      })
  }
  
  this.makeMove = function(move, hookEvent) {
    return $http.post("/move", move)
      .success(function (data, status, headers, config) {
        hookEvent(data);
      })
      .error(function (data, status, headers, config) {
        console.error("Error ApiService makeMove ", data);
      })
  }
  
  this.updateBoard = function(hookEvent) {
    return $http.get("/move")
      .success(function (data, status, headers, config) {
        hookEvent(data);
      })
      .error(function (data, status, headers, config) {
        console.error("Error ApiService updateBoard ", data);
      })
  }

})

var app = angular.module("littleSketcher",["ngRoute","ngResource","ngAnimate","toggleInput"]);

app.controller("rootCtrl",function($scope,$rootScope) {
});


app.controller("drawingCreateCtrl",
  function($scope,$rootScope,DrawingRecord,$routeParams,errors,$location) {

  $scope.state = {
    undone: [],
    synced: true,
    loading: false
  };
  var state = $scope.state;
  var idNeedsUpdate = false;

  var drawing = $scope.drawing = new DrawingRecord();
  if($routeParams.id == null) {
    drawing.commands = [];
    idNeedsUpdate = true;
    watchName();
  } else {
    drawing.id = $routeParams.id;
    drawing.$get().then(function() {
      state.loading = false;
      watchName();
    });
    state.loading = true;
  }

  $scope.newStroke = function(command) {
    state.synced = false
    state.undone = [];
    drawing.commands.push(_.defaults({
      type: "path"
    },command))
    needsSync();
  };

  $scope.undo = function() {
    if(drawing.commands < 1) return;
    state.synced = false
    state.undone.push(drawing.commands.pop());
    needsSync();
  };

  $scope.redo = function() {
    if(state.undone.length < 1) return;
    state.synced = false
    drawing.commands.push(state.undone.pop());
    needsSync();
  };


  $scope.save = sync;

  // we don't want to save every time a character
  // is changed on the name, so use debounce to save
  // only after name stops changing
  var inputSync = _.debounce(needsSync,1000);

  function sync() {
    drawing.$save()
    .then(function() {
      state.synced = true;
      if(idNeedsUpdate) {
        $location.search("id",drawing.id);
        idNeedsUpdate = false;
      }
    })
    .catch(function(error) {
      state.synced = true;
      console.error(error);
      errors("There was a problem saving your drawing!");
    });
  };

  function needsSync() {
    state.synced = false;
    sync();
  }

  function watchName() {
    $scope.$watch("drawing.name",function(newName,oldName) {
      if(newName === oldName) return; // watch was being initialized
      inputSync();
    });
  }

});

app.controller("drawingsCtrl",function($scope,DrawingRecord,errors) {

  $scope.drawings = DrawingRecord.query();
  $scope.deleteDrawing = function(drawing) {
    drawing.$delete()
      .then(function() {
        $scope.$emit("notify:completed","Drawing deleted");
        _.spliceOut($scope.drawings,drawing)
      })
      .catch(function() {
        errors("Drawing could not be deleted");
      });
  };
});







app.factory("dramaticAlerter",function($window) {
  return function(val) {
    $window.alert(val + "!");
  };
});












app.value("_",_);

app.controller("drawingListItem",function($scope,errors,_) {

  $scope.updateDrawing = _.debounce(function(name,old) {
    if(name === old) return;
    $scope.drawing.$save()
      .then(function() {
        $scope.$emit("notify","Drawing updated");
      })
      .catch(function() {
        errors("Drawing could not be updated");
      });
      
  },1000);

  $scope.$watch("drawing.name",$scope.updateDrawing);
});


app.directive("notifications",function($rootScope,$timeout) {
  return {
    replace: true,
    template: [
      "<div class='alert-box notification-content' ng-show='notification.visible'>{{ notification.message }}</div>"
    ].join(""),
    link: function(scope,el,attrs) {
      scope.notification = {message: false, visible: false};
      $rootScope.$on("notify",function(event,message) {
        scope.notification.message = message;
        scope.notification.visible = true;
        $timeout(function() {
          scope.notification.visible = false;
        },1500);
      });
    }
  }
});


app.factory("DrawingRecord",function($resource) {
  var Drawing = $resource("/api/drawings/:id",{id: '@id'});
  Drawing.prototype.isNew = function() {
    return !!this.id;
  };
  return Drawing;
});

app.factory("errors",function() {
  return function(msg) {
    alert(msg)
  };
})

_.mixin({
  spliceOut: function(arr,obj) {
    var index = _.indexOf(arr,obj);
    arr.splice(index,1);
  }
})




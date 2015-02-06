
describe("littleSketcher", function() {
  // here we tell angular the inject() and module() helpers
  // will refer to our `littleSketcher` module
  beforeEach(module('littleSketcher'));
  
  
  describe("dramaticAlerter",function() {
    var alertSpy = jasmine.createSpy('alert');
    beforeEach(module('littleSketcher',function($provide) {
      $provide.value("$window",{
        alert: alertSpy,
      });
    }));
    
    it("alerts user dramatically",inject(function(dramaticAlerter) {
      dramaticAlerter("something");
      expect(alertSpy).toHaveBeenCalledWith("something!");
    }));
  });
  
  
  
  
  

  describe("notifications",function() {
    var $compile;
    var $rootScope;

    beforeEach(inject(function(_$rootScope_,_$compile_) {
      $compile = _$compile_;
      $rootScope = _$rootScope_;
    }));

    it("sets the message as visible on notify",function(notifications) {
      var el = $compile("<div><div notifications></div></div>")($rootScope);
      // fire our data-binding to get into initial state
      $rootScope.$apply();
      expect(el.find(".notification-content.ng-hide").length).toBe(1,"should start hidden");
      
      $rootScope.$broadcast("notify","something");
      $rootScope.$apply();
      
      expect(el.find(".notification-content.ng-hide").length).toBe(0,"should be visible");
    });

  });

  // unit testing a controller
  describe("drawingListItem controller",function() {
    var controller;
    var $scope;


    beforeEach(inject(function($rootScope,$controller,
      DrawingRecord,$injector) {

      $scope = $rootScope.$new();
      $scope.drawing = new DrawingRecord;

      controller = $controller('drawingListItem', {
        $scope: $scope,
        // we've passed through a fake version of this controller's
        // dependency: underscore, to make debounce fire immediately
        // rather than having to wait 1 second, slow and more complex
        _: {
          debounce: function(fn) { return fn }
        }
      });

      $scope.$apply();

    }));

    it('saves drawing after the name has been changed', inject(function($q) {
      // check to see if the drawing has been saved
      spyOn($scope.drawing,"$save").andReturn($q.when(true));

      $scope.$apply(function() {
        $scope.drawing.name = "foo";
      }); 

      expect($scope.drawing.$save).toHaveBeenCalled();
    }));

  });

});

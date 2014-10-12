describe('ngJsTree', function() {

    var $log,$compile,$rootScope,scope,element, ignoreModel, callbackCalled;

    beforeEach(module('ngJsTree'));

    beforeEach(inject(function(_$compile_, _$rootScope_,_$log_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $log = _$log_;

        scope = $rootScope.$new();

        scope.data = [
            { id : 'ajson1', parent : '#', text : 'Simple root node' },
            { id : 'ajson2', parent : '#', text : 'Root node 2' },
            { id : 'ajson3', parent : 'ajson2', text : 'Child 1' },
            { id : 'ajson4', parent : 'ajson2', text : 'Child 2' }
        ];

        scope.treeConfig = {
            core : {
                check_callback : true,
                worker : false,
                error : function(error) {
                    $log.error('treeCtrl: error from js tree - ' + angular.toJson(error));
                }
            }
        };

        ignoreModel = false;
        callbackCalled = false;

        scope.applyModelChanges = function() {
            return !ignoreModel;
        };

        scope.createNodeCB = function() {
            callbackCalled = true;
        };

        element = angular.element('<div js-tree="treeConfig" ng-model="data" should-apply="applyModelChanges()" tree-events="create_node:createNodeCB" tree="treeInstance"></div>');
        $compile(element)(scope);
        $rootScope.$digest();
    }));

    it('tree data should have the same number of the original array', function() {
        var isolated = element.isolateScope();
        expect(isolated.treeData.length).toBe(element.scope().data.length);
    });

    it('the tree instance should be defined', function() {
        expect(scope.treeInstance).toBeDefined()
    });

    it('add node test', function() {
        scope.data.push({ id : 'ajson5', parent : 'ajson2', text : 'New Child' });
        $rootScope.$digest();
        var node = scope.treeInstance.jstree(true).get_node('ajson5');
        expect(node).toBeDefined();
        expect(node.id).toEqual('ajson5');
    });

    it('test should apply is called', function() {
        spyOn(scope, 'applyModelChanges');
        scope.data.push({ id : 'ajson5', parent : 'ajson2', text : 'New Child' });
        $rootScope.$digest();
        expect(scope.applyModelChanges).toHaveBeenCalled();
    });

    it('test should apply is called and ignoring model changes', function() {
        ignoreModel = true;
        scope.data.push({ id : 'ajson5', parent : 'ajson2', text : 'New Child' });
        $rootScope.$digest();
        var node = scope.treeInstance.jstree(true).get_node('ajson5');
        expect(node).toBeFalsy();
    });

    it('test events are being called', function() {
        spyOn(scope, 'createNodeCB');
        runs(function() {
            scope.data.push({ id : 'ajson5', parent : 'ajson2', text : 'New Child' });
            $rootScope.$digest();
        }, "an asynchronous method");

        waitsFor(function() {
            return callbackCalled === true;
        }, "callback to be called", 1000);
    });

} );
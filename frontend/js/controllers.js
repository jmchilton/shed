var app = angular.module('MyApp');

app.controller('HomeCtrl', function($scope) {
});

app.controller('LoginCtrl', function($scope, $location, $auth, toastr) {
    $scope.login = function() {
        $auth.login($scope.user).then(function() {
            toastr.success('You have successfully signed in');
            $location.path('/');
        })
        .catch(function(response) {
            toastr.error(response.data.message, response.status);
        });
    };
    $scope.authenticate = function(provider) {
        $auth.authenticate(provider).then(function() {
            toastr.success('You have successfully signed in with ' + provider);
            $location.path('/');
        })
        .catch(function(response) {
            toastr.error(response.data.message);
        });
    };
});

app.controller('LogoutCtrl', function($location, $auth, toastr) {
    if (!$auth.isAuthenticated()) { return; }

    $auth.logout().then(function() {
        toastr.info('You have been logged out');
        $location.path('/');
    });
});

app.controller('CreateCtrl', function($scope, $location, $auth, toastr, Toolshed) {
    $scope.repo_types = [
        {value: 'tool', label: 'Tool'},
        {value: 'package', label: 'Packge (Repository Dependency)'},
        {value: 'datatype', label: 'Datatype'},
        {value: 'viz', label: 'Visualization'},
        {value: 'gie', label: 'Galaxy Interactive Environment'},
    ];
    $scope.clearInstallable = {
        name: null,
        repository_type: 'tool',
        remote_repository_url: null,
        homepage_url: null,
        description: null,
        synopsis: null,
        //tags: [],
    };

    // Clone the empty installable
    $scope.installable = JSON.parse(JSON.stringify($scope.clearInstallable));
    $scope.canSubmit = true;

    $scope.submit = function(){
        $scope.canSubmit = false;

        Toolshed.createInstallable($scope.installable).then(function(response) {
            var created_object = response.data;
            var redirect_location = '/installable/' + created_object.id;
            console.log(redirect_location);
            $location.path(redirect_location);
            toastr.success("Created repository", "Success!");
            $scope.canSubmit = true;
        })
        .catch(function(response) {
            toastr.error(response.data.message, response.status);
            $scope.canSubmit = true;
        });
    }

});


app.controller('CreateSuiteCtrl', function($scope, $location, $auth, toastr, Toolshed) {
    $scope.clearSuite = {
        name: null,
        repository_type: 'suite',
        description: null,
        synopsis: null,
        repositories: [],
    };

    // Clone the empty installable
    $scope.suite = JSON.parse(JSON.stringify($scope.clearSuite));

    $scope.querySearch = function(searchText) {
        if(searchText.length > 3){
            console.log(searchText);
            Toolshed.searchInstallables(searchText).then(function(response){
                console.log(response.data);
            }).catch(function(response) {
                toastr.error(response.data.message, response.status);
            });

            return [
                {name: 'bob', version: '1.0.0'}
            ]
        }
    }

    $scope.submit = function(){
        Toolshed.createSuite($scope.suite).then(function(response) {
            var redirect_location = '/installables/' + created_object.id;
            console.log(redirect_location);
            toastr.success("Created Suite", "Success!");
        })
        .catch(function(response) {
            toastr.error(response.data.message, response.status);
        });
    }

});



app.controller('InstallableListController', function($scope, $location, $auth, Toolshed, toastr){
    $scope.installable_type = $location.path().split('/')[2];
    $scope.page = 0;
    $scope.pageCount = 1;

    $scope.cachedPages = {};

    $scope.fetchData = function(type, page){
        if(page in $scope.cachedPages){
            return;
        }
        Toolshed.getInstallables(type, page).query().$promise.then(function(response) {
            $scope.cachedPages[$scope.page] = response.results;
            $scope.numResults = response.count;
            $scope.pageCount = Math.ceil(response.count / 20);
        })
    }

    // http://stackoverflow.com/questions/11873570/angularjs-for-loop-with-numbers-ranges
    $scope.range = function(min, max, step){
        min = min || 0;
        max = max || 0;
        if(max < min){
            max = min;
        }
        step = step || 1;
        var input = [];
        for (var i = min; i <= max; i += step) input.push(i);
        return input;
    };

    $scope.$watch(
        "page",
        function(new_value) {
            $scope.fetchData($scope.installable_type, new_value);
        }
    );

    // Don't know if this is needed. It doesn't seem to be but ... ? Don't want people to see just an empty page.
    //$scope.fetchData($scope.installable_type, $scope.page);
});

app.controller('InstallableDetailController', function($scope, $location, $auth, Toolshed, toastr, $stateParams, $mdDialog, Upload){
    $scope.page = 1;


    $scope.saveForm = function(){
        Toolshed.updateInstallable($scope.installable).then(function(response) {
            toastr.success(response.data.message, "Success!");
        })
        .catch(function(response) {
            toastr.error(response.data.message, response.status);
        });
    }

    $scope.installable = Toolshed.getInstallable($stateParams.installableId).query();

    $scope.installable.$promise.then(function(installable){
        $scope.canEdit = installable.can_edit;

        if(installable.revision_set.length > 0){
            $scope.selectedRevision = installable.revision_set[installable.revision_set.length - 1].id
        }
    });


    $scope.newRevision = function(ev){
        $mdDialog.show({
            controller: DialogController,
            templateUrl: '/partials/dialog1.tmpl.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
        .then(
            function(answer) {
                Upload.upload({
                    url: '/api/revision',
                    fields: {
                        'sig': answer.sig,
                        'pub': answer.pub,
                        'installable': $scope.installable,
                        'commit': answer.message,
                    },
                    file: answer.file,
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    toastr.success(data, "Success");
                    $scope.freshen();
                }).error(function (data, status, headers, config) {
                    toastr.error(data, status);
                })
            },
            function() {
            }
        );
    };

    $scope.$watch(
        "selectedRevision",
        function(new_value) {
            if($scope.installable !== undefined && $scope.installable.revision_set !== undefined){
                for(var rev_idx in $scope.installable.revision_set){
                    if($scope.installable.revision_set[rev_idx].id == new_value){
                        $scope.selectedRevisionData = $scope.installable.revision_set[rev_idx];
                        $scope.revisionDownloadUrl = '/uploads/' + $scope.installable.name + '-' + $scope.selectedRevisionData.version + '.tar.gz';
                        break
                    }
                }
            }
        }
    );
});

app.controller('RevisionDetailController', function($scope, $location, $auth, Toolshed, toastr, $stateParams, $mdDialog, Upload){
    console.log('rdc')
});

function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}


app.controller('NavbarCtrl', function($scope, $auth, $mdSidenav) {
    $scope.isAuthenticated = function() {
        return $auth.isAuthenticated();
    };

    if($auth.getPayload() !== undefined){
        $scope.username = $auth.getPayload().username;
    }

    $scope.toggleSidenav = function(menuId) {
        $mdSidenav(menuId).toggle();
    };

});

app.controller('UserListCtrl', function($scope, Toolshed) {
    $scope.users = Toolshed.getUsers().query();
})

app.controller('UserDetailCtrl', function($scope, Toolshed, $stateParams) {
    $scope.user = Toolshed.getUser($stateParams.userId).query();
})

app.controller('GroupListCtrl', function($scope, Toolshed, toastr) {
    Toolshed.getGroups(0).query().$promise.then(function(response) {
        $scope.groups = response.results;
        $scope.numResults = response.count;
        $scope.pageCount = Math.ceil(response.count / 20);
    })
    $scope.groups = Toolshed.getGroups().query();
})

app.controller('GroupDetailCtrl', function($scope, Toolshed, $stateParams, toastr) {
    $scope.group = Toolshed.getGroup($stateParams.groupId).query();
})

app.controller('GroupCreateCtrl', function($scope, Toolshed, $stateParams, toastr, $location) {
    $scope.group = {
        display_name: null,
        description: null,
        website: null,
        gpg_pubkey_id: null,
    }

    $scope.submit = function(){
        console.log("Submitting group")
        console.log($scope.group);
        Toolshed.createGroup($scope.group).then(function(response) {
            var redirect_location = '/group/' + response.data.id;
            console.log(redirect_location);
            $location.path(redirect_location);
            toastr.success("Created Group " + response.data.display_name, "Success!");
        })
        .catch(function(response) {
            toastr.error(response.data.message, response.status);
        });
    }


})

app.controller('ProfileCtrl', function($scope, $auth, toastr, Toolshed) {
    console.log($auth.getPayload());
    if($auth.getPayload() !== undefined){
        $scope.userId = $auth.getPayload().user_id;
    }

    Toolshed.getUser($scope.userId).then(function(response) {
        $scope.user = response.data;
    })
    .catch(function(response) {
        toastr.error(response.data.message, response.status);
    });
});

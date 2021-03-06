var app = angular.module('MyApp');

app.factory('Toolshed', function($http, $rootScope, $resource) {
    return {
        User: function(userId, page_idx){
            return $resource(
                $rootScope._backendUrl + '/users/:userId',
                {
                    userId: '@userId',
                    // This is automatically inserted as a query parameters
                    // because it isn't specified in the template.
                    page: '@pageIndex',
                    search: '@query',
                },
                {
                    query: {
                        method: 'GET',
                    },
                    get: {
                        method: 'GET',
                        params: {
                            userId: userId
                        }
                    }
                }
            )
        },
        Group: function(groupId){
            return $resource(
                $rootScope._backendUrl + '/groups/:groupId',
                {
                    groupId: '@groupId',
                    // This is automatically inserted as a query parameters
                    // because it isn't specified in the template.
                    page: '@page',
                },
                {
                    query: {
                        method: 'GET',
                    },
                    get: {
                        method: 'GET',
                        params: {
                            groupId: groupId
                        }
                    },
                    update: {
                        method: 'PUT',
                        params: {
                            groupId: groupId
                        }
                    },
                    save: {
                        method: 'POST',
                    }
                }
            )
        },
        Tag: function(tagId, page_idx){
            return $resource(
                $rootScope._backendUrl + '/tags/:tagId',
                {
                    tagId: '@tagId',
                    // This is automatically inserted as a query parameter when
                    // present, because it isn't specified in the template.
                    page: '@page',
                },
                {
                    query: {
                        method: 'GET',
                    },
                    get: {
                        method: 'GET',
                        params: {
                            tagId: tagId
                        }
                    },
                    update: {
                        method: 'PUT',
                        params: {
                            tagId: tagId
                        }
                    },
                    save: {
                        method: 'POST',
                    }
                }
            )
        },
        Installable: function(installableId, page, repositoryType){
            return $resource(
                $rootScope._backendUrl + '/installables/:installableId',
                {
                    installableId: '@installableId',
                    // This is automatically inserted as a query parameter when
                    // present, because it isn't specified in the template.
                    page: '@page',
                    repositoryType: '@repositoryType',
                    search: '@search',
                },
                {
                    query: {
                        method: 'GET',
                        params: {
                            page: page,
                            repositoryType: repositoryType
                        }
                    },
                    save: {
                        method: 'POST',
                    },
                    update:{
                        method: 'PUT',
                        params: {
                            installableId: installableId
                        }
                    },
                    /*
                    get: {
                        method: 'GET',
                        params: {
                            installableId: installableId
                        }
                    },
                    */
                }
            )
        },
    }
});

'use strict';

var api = new Vue({
    http: {
        root: 'http://localhost:8080/api',
    }
});

var apiResources = {
    users: 'users',
    //login: 'users/:userEmail',
    favorites: 'users/:userId/musics',
    musics: 'musics',
    musicDetails: 'musics/:musicId'
}

var User = new function(){
    this.id = null;
    this.username = null;
    this.email = null;
    this.isLogged = false;
    return this;
}

User.login = function(email){
    var _this = this;
    return new Promise(function(resolve, reject){
        if (!email) reject('Enter an email address');
        api.$http.get(apiResources.users).then(function success(response){
            /**/
            var userByEmail = response.body.find(function(user){
                return user.email === email;
            });
            if (!userByEmail){
                reject('No user matching provided email');
                return;
            }
            _this.isLogged = true;
            Object.keys(userByEmail).forEach(function(field){
                _this[field] = userByEmail[field];
            })
            resolve(_this);

        }, function error(response){
            reject('Request error: '+response.statusText)
        });
    });
}

User.logout = function(){
    var _this = this;
    if (!_this.isLogged) return false;
    this.id = null;
    this.username = null;
    this.email = null;
    this.isLogged = false;
}

// 1. Define route components.
// These can be imported from other files
var HomeComponent = {
    template: '#tpl-tracklist',
    data: function(){ return {tracks: null} },
    created: function(){
        // fetch the data when the view is created and the data is
        // already being observed
        this.fetchData()
    },
    methods: {
        fetchData: function(){
            var _this = this;
            api.$http.get(apiResources.musics).then(function success(response){
                _this.tracks = response.body;
            }, function error(response){
                //TODO: handle error
            });
        }
    }
}

var FavoritesComponent = {
    template: '#tpl-tracklist',
    data: function(){ return {tracks: null} },
    created: function(){
        // fetch the data when the view is created and the data is
        // already being observed
        this.fetchData()
    },
    methods: {
        fetchData: function(){
            var _this = this;
            api.$http.get(apiResources.favorites.replace(":userId", _this.$route.params.userId)).then(function success(response){
                _this.tracks = response.body;
            }, function error(response){
                //TODO: handle error
            });
        }
    }
}

var TrackDetailsComponent = {
    template: '#tpl-track-details',
    data: function(){ return {track: null} },
    created: function(){
        // fetch the data when the view is created and the data is
        // already being observed
        this.fetchData()
    },
    methods: {
        fetchData: function(){
            var _this = this;
            api.$http.get(apiResources.musicDetails.replace(":musicId", _this.$route.params.musicId)).then(function success(response){
                _this.track = response.body[0];
            }, function error(response){
                //TODO: handle error
            });
        }
    }
}


// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// Vue.extend(), or just a component options object.
// We'll talk about nested routes later.
var routes = [
    { path: '/', component: HomeComponent },
    { path: '/users/:userId/musics', component: FavoritesComponent, name: 'favorites' },
    { path: '/musics/:musicId', component: TrackDetailsComponent, name: 'music' }
]

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
var router = new VueRouter({
    linkActiveClass: 'active',
    routes: routes
})

// 4. Create and mount the root instance.
// Make sure to inject the router with the router option to make the
// whole app router-aware.
var app = new Vue({
    router:router,
    data: {
        User: User
    }
}).$mount('#app')

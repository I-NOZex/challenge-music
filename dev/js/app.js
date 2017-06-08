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
    this.gravatar = null;
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
            var emailHash = MD5(userByEmail.email);
            _this.gravatar = "https://www.gravatar.com/avatar/" + emailHash;
            resolve(_this);

        }, function error(response){
            reject('Request error: '+response.statusText)
        });
    });
}

User.logout = function(){
    if (User.isLogged !== true) return false;
    User.id = null;
    User.username = null;
    User.email = null;
    User.gravatar = null
    User.isLogged = false;
}

User.getFavourites = function(){
    var _this = this;
    return new Promise(function(resolve, reject){
        if (User.isLogged !== true) reject("Please login before");
        api.$http.get(apiResources.favorites.replace(":userId", _this.id)).then(function success(response){
            resolve(response.body);
        }, function error(response){
            reject('Request error: '+response.statusText)
        });
    });
}

User.isFavorite = function(musicId){
    var _this = this;
    return new Promise(function(resolve, reject){
        if (_this.isLogged !== true){
            reject("Please login before");
            return;
        }
        if ((''+_this.musicId).length < 1){
            reject("Invalid music ID");
            return;
        }

        api.$http.get(apiResources.favorites.replace(":userId", _this.id)).then(function success(response){
            if(!response.body){
                reject("No favorites");
                return;
            }
            var isFav = response.body.find(function(music){
                return music.id === musicId;
            });
            resolve(!!isFav); //cast to boolean
        }, function error(response){
            reject('Request error: '+response.statusText)
        });
    });
}

User.addFavourite = function(musicId){
    var _this = this;
    if (User.isLogged !== true) return "Please login before";
    if ((''+User.musicId).length < 1) return "Invalid music ID";
    api.$http.post(apiResources.favorites.replace(":userId", _this.id), {"musicid": musicId}).then(function success(response){
        return response.body;
    });
}

User.removeFavourite = function(musicId){
    var _this = this;
    if (User.isLogged !== true) return "Please login before";
    if ((''+User.musicId).length < 1) return "Invalid music ID";
    api.$http.delete(apiResources.favorites.replace(":userId", _this.id)+'/'+ musicId).then(function success(response){
        return response.body;
    });
}

Vue.component('login-input',{
    template:'#tpl-login-input',
    data: function(){ return { email: ''}  },
    methods:{
        login: function(email){
            /*var re = /\S+@\S+\.\S+/;
            if(!re.test(email)) return false;*/
            this.$parent.User.login(email);
        }
    },
})

Vue.component('login-link',{
    template:'#tpl-login-link',
    methods:{
        switchToInput:function(){
            this.$parent.switchToInput();
        }
    },
})
// 1. Define route components.
// These can be imported from other files
var HomeComponent = {
    template: '#tpl-tracklist',
    data: function(){ return {tracks: null, favorites: null, fvs: []} },
    created: function(){
        // fetch the data when the view is created and the data is
        // already being observed
                this.fetchFavs(true)

        this.fetchData()
    },
    methods: {
        fetchData: function(){
            var _this = this;
            api.$http.get(apiResources.musics).then(function success(tracks){
                console.log('tracks loaded');
                _this.tracks = tracks.body;
            });
        },
        fetchFavs: function(isCreation){
            var _this = this;
            api.$http.get(apiResources.favorites.replace(":userId", User.id)).then(function success(favs){
                                console.log('favs loaded');
                if(!favs.body) return;

                _this.favorites = favs.body;
                if(isCreation){
                    _this.fvs = [];
                    _this.favorites.forEach(function(f){
                        _this.fvs.push(f.id)
                    })
                }
            });
        },
        addToFavs: function(musicId){
            console.log(this.$parent.User.addFavourite(musicId))
            this.fvs.push(musicId)
            this.fetchFavs()
            //this.fetchData()
        },
        removeFromFavs: function(musicId){
            console.log(this.$parent.User.removeFavourite(musicId))
            this.fvs.splice(this.fvs.indexOf(musicId), 1)
            this.fetchFavs()
        },
        isFavorite: function(musicId){
            var _this = this;
            if(!_this.favorites) return _this.fetchFavs(true);

            var isFav = _this.favorites.find(function(fav){
                if(fav.id == musicId) return true;
            });

                return isFav;

        }
    },
    computed: {
        isUserLogged: function(){
            return this.$parent.User.isLogged;
        }
    }
}

var FavoritesComponent = {
    template: '#tpl-tracklist',
    data: function(){ return {tracks: null, fvs:[]} },
    created: function(){
        // fetch the data when the view is created and the data is
        // already being observed
        this.fetchData(true)
    },
    methods: {
        fetchData: function(isCreation){
            var _this = this;
            _this.$parent.User.getFavourites().then(function success(response){
                if(!response) return;
                _this.tracks = response;
                if(isCreation){
                    _this.fvs = [];
                    _this.tracks.forEach(function(f){
                        _this.fvs.push(f.id)
                    })
                }
            }, function error(response){
                //TODO: handle error
            });
        },
        addToFavs: function(musicId){
            console.log(this.$parent.User.addFavourite(musicId))
            this.fvs.push(musicId)
            this.fetchData()
            //this.fetchData()
        },
        removeFromFavs: function(musicId){
            console.log(this.$parent.User.removeFavourite(musicId))
            this.fvs.splice(this.fvs.indexOf(musicId), 1)
            this.fetchData()
        },
        isFavorite: function(musicId){
            return true;
        }
    },
    computed: {
        isUserLogged: function(){
            return this.$parent.User.isLogged;
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
        User: User,
    	current:"login-link",
        //switchToInput: function(){console.log('bla')} //this.switchToInput
    },
    methods:{
    	switchToLink:function(){
        	this.current = 'login-link';
        },
        switchToInput:function switchToInput(){
        	this.current = 'login-input'
        }
    },
    components:['login-link','login-input'],
}).$mount('#app')

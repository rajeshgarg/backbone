define([
    "tibbr"
    , "models/user"
]
    , function (Tibbr, User) {
        return    Tibbr.Users = Tibbr.Collection.extend({
            className:"users",
//            initialize:function (userId) {
//                this.scopeId = userId || (Tibbr.currentUser || {}).id
//            },
            model:User
        });

    });
#include "Friends.h"

#include <algorithm>
#include <iostream>

namespace graphql::friends {
    Query::Query(friendsLoader &&getFriend, friendsLoader &&getFriends) : _getFriend(getFriend), _getFriends(getFriends) {}
    service::FieldResult<std::shared_ptr<object::Friend>> Query::getFriend(service::FieldParams &&params, std::optional<response::StringType> &&cnameArg) const {

    }
    service::FieldResult<std::optional<std::vector<std::shared_ptr<object::Friend>>>> Query::getFriends(service::FieldParams &&params) const {

    }
    Friend::Friend(response::StringType &&cname, response::StringType &&isFriend) : _cname(cname), _isFriend((isFriend)) {}
    service::FieldResult<std::optional<response::StringType>> Friend::getCname(service::FieldParams &&params) const {
        return _cname;
    }
    service::FieldResult<std::optional<response::BooleanType>> Friend::getIsFriend(service::FieldParams &&params) const {
        return _isFriend == "y";
    };
}
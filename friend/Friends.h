// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// WARNING! Do not edit this file manually, your changes will be overwritten.

#pragma once

#ifndef FRIENDS_H
#define FRIENDS_H

#include "FriendsSchema.h"

#include <atomic>
#include <stack>

namespace graphql
{
    namespace friends
    {

        class Query;
        class Friend;

        class Query
            : public object::Query
        {
        public:
            using friendsLoader = std::function<std::vector<std::shared_ptr<Friend>>()>;
            explicit Query(friendsLoader &&, friendsLoader &&);
            service::FieldResult<std::shared_ptr<object::Friend>> getFriend(service::FieldParams &&params, std::optional<response::StringType> &&cnameArg) const final;
            service::FieldResult<std::optional<std::vector<std::shared_ptr<object::Friend>>>> getFriends(service::FieldParams &&params) const final;
        private: 
            friendsLoader _getFriend, _getFriends;
            std::shared_ptr<object::Friend> _friend;
            std::vector<std::shared_ptr<object::Friend>> _friends;
        };

        class Friend
            : public object::Friend
        {
        public:
            explicit Friend(response::StringType &&, response::StringType &&);
            service::FieldResult<std::optional<response::StringType>> getCname(service::FieldParams &&params) const final;
            service::FieldResult<std::optional<response::BooleanType>> getIsFriend(service::FieldParams &&params) const final;
        private: 
            response::StringType _cname;
            std::string _isFriend;
        };

    } // namespace friends
} // namespace graphql

#endif // FRIENDS_H

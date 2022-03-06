#pragma once

#ifndef HELLOMOCK_H
#define HELLOMOCK_H

#include "HelloSchema.h"

#include <atomic>
#include <stack>

namespace graphql::hello
{
    class Query : public object::Query
    {
        public:
            explicit Query(response::StringType &&greet);
            service::FieldResult<std::optional<response::StringType>> getHello(service::FieldParams &&) const final;

        private:
            response::StringType _greet;
    };
}

#endif // HELLOMOCK_H

#include "HelloMock.h"

#include <algorithm>
#include <iostream>

namespace graphql::hello
{
    Query::Query(response::StringType &&greet) : _greet(std::move(greet)){}

    service::FieldResult<std::optional<response::StringType>> Query::getHello(service::FieldParams&& params) const
    {
        if(_greet != ""){
            return _greet;
        }
        return nullptr;
    }

} // namespace graphql::hello


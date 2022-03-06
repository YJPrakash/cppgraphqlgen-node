#include "GreetMock.h"

#include <algorithm>
#include <iostream>

namespace graphql::greet
{
    Hello::Hello(response::StringType &&greet) : _greet(std::move(greet)) {}

    service::FieldResult<std::optional<response::StringType>> Hello::getGreet(service::FieldParams &&params) const
    {
        if (_greet != "")
        {
            return _greet;
        }
        return nullptr;
    }
    Query::Query(std::string &&greet, helloLoader &&getHello) : _greet(greet),_getHello(std::move(getHello)) {}
    service::FieldResult<std::optional<response::StringType>> Query::getGreetmsg(service::FieldParams &&params) const
    {
        if (_greet != "")
        {
            return _greet;
        }
        return nullptr;
    }

    service::FieldResult<std::shared_ptr<object::Hello>> Query::getHello(service::FieldParams &&) const
    {
        
        _hello = _getHello();
        _getHello == nullptr;
        for (const auto &hello : _hello)
        {
            if (hello)
            {
                return hello;
            }
        }

        return nullptr;
    }

} // namespace graphql::hello

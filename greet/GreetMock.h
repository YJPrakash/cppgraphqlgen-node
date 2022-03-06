#pragma once

#ifndef GREETMOCK_H
#define GREETMOCK_H

#include "GreetSchema.h"

#include <atomic>
#include <stack>

namespace graphql::greet
{
    class Hello;

    class Query : public object::Query
    {
    public:
        // using helloLoader = std::function<std::vector<greet::Hello>();
        // explicit Query(helloLoader &&getHello);
        using helloLoader = std::function<std::vector<std::shared_ptr<Hello>>()>;
        explicit Query(std::string &&greet, helloLoader &&getHello);
        service::FieldResult<std::optional<response::StringType>> getGreetmsg(service::FieldParams &&params) const final;
        service::FieldResult<std::shared_ptr<object::Hello>> getHello(service::FieldParams &&) const final;
    private:
        response::StringType _greet;
        mutable helloLoader _getHello;
        mutable std::vector<std::shared_ptr<Hello>> _hello;

    };
    class Hello: public object::Hello
    {
    public:
        service::FieldResult<std::optional<response::StringType>> getGreet(service::FieldParams &&params) const final;
        explicit Hello(response::StringType &&greet);

    private:
        response::StringType _greet;
    };
}

#endif // HELLOMOCK_H

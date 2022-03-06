// #include <nan.h>
#include <v8.h>
#include <napi.h>
#include "HelloMock.h"

#include "graphqlservice/JSONResponse.h"
#include <cstdio>
#include <iostream>
#include <iterator>
#include <stdexcept>

#include <memory>
#include <map>
#include <thread>
#include <queue>

using namespace graphql;

static std::shared_ptr<hello::Operations> serviceSingleton;

void startService(const Napi::CallbackInfo &info)
{
    // Napi::Env env = info.Env();
    auto query = std::make_shared<hello::Query>(response::StringType("Hello World!"));
    serviceSingleton = std::make_shared<hello::Operations>(query);
    std::cerr << "Created the service..." << std::endl;
}

struct SubscriptionPayloadQueue : std::enable_shared_from_this<SubscriptionPayloadQueue>
{
    ~SubscriptionPayloadQueue()
    {
        Unsubscribe();
    }

    void Unsubscribe()
    {
        std::optional<service::SubscriptionKey> deferUnsubscribe;
        std::unique_lock<std::mutex> lock(mutex);

        if (!registered)
        {
            return;
        }

        registered = false;
        deferUnsubscribe = std::make_optional(key);
        key = {};

        lock.unlock();
        condition.notify_one();

        if (deferUnsubscribe && serviceSingleton)
        {
            serviceSingleton->unsubscribe(*deferUnsubscribe);
        }
    }

    std::mutex mutex;
    std::condition_variable condition;
    std::queue<std::future<response::Value>> payloads;
    service::SubscriptionKey key{};
    bool registered = false;
};

static std::map<int32_t, std::shared_ptr<SubscriptionPayloadQueue>> subscriptionMap;

void stopService(const Napi::CallbackInfo& info)
{
    if (serviceSingleton)
    {
        for (const auto &entry : subscriptionMap)
        {
            entry.second->Unsubscribe();
        }

        subscriptionMap.clear();
        serviceSingleton.reset();
    }
    std::cerr<<"service stopped..." <<std::endl;
}

constexpr uint32_t c_resolverIndex = 1;

// class FetchWorker : public Napi::AsyncWorker
// {
//     // public: 
//         // FetchWorker(Napi::Function &callback, const v8::Local<v8::Promise::Resolver> &resolver)
//         // FetchWorker(std::string &&query, std::string &&operationName, const std::string &variables, const v8::Local<v8::Promise::Resolver> &resolver)
//         // FetchWorker(std::string &&query, std::string &&operationName, std::string &variables, const Napi::Promise::Deferred &resolver, Napi::Env &env)
//         // FetchWorker(std::string &&query, std::string &&operationName, std::string &&variables, Napi::CallbackInfo &&info, Napi::Promise::Deferred &resolver)
//         // : Napi::AsyncWorker(nullptr, "graphql:fetchQuery")
//         //   _operationName(std::move(operationName))
//         //   _variables(std::move(variables)),
//         //   _info(std::move(info))
//     public:
//         FetchWorker(Napi::CallbackInfo &info, Napi::Promise::Deferred &resolver)
//             : Napi::AsyncWorker(nullptr, "graphql:fetchQuery"),
//                 _info(info)
//         {
//             try
//             {
//                 // _env = info.Env();
//                 _env(std::move(info.Env()));
//                 std::string query = info[0].As<Napi::String>();
//                 std::string operationName = info[1].As<Napi::String>();
//                 std::string variables = info[2].As<Napi::String>();
//                 std::cerr << "query: " << query << std::endl;

//                 _ast = peg::parseString(query);
//                 _variables = (variables.empty() ? response::Value(response::Type::Map) : response::parseJSON(variables));

//                 if (_variables.type() != response::Type::Map)
//                 {
//                     throw std::runtime_error("Invalid variables object");
//                 }
//             }
//             catch (const std::exception &ex)
//             {
//                 std::ostringstream oss;

//                 oss << "Caught exception preparing the query: " << ex.what();

//                 SetError(oss.str().c_str());
//             }

//         }

//         void Execute() override
//         {
//             // if (napi_is_error() != nullptr)
//             // {
//             //     // We caught an exception in the constructor, return the error message or a well formed
//             //     // collection of GraphQL errors.
//             //     return;
//             // }

//             try
//             {
//                 if (!serviceSingleton)
//                 {
//                     throw std::runtime_error("The service is not started!");
//                 }

//                 _response = response::toJSON(serviceSingleton->resolve(nullptr, _ast, _operationName, std::move(_variables)).get());
//             }
//             catch (service::schema_exception &scx)
//             {
//                 response::Value document(response::Type::Map);

//                 document.emplace_back(std::string{service::strData}, response::Value());
//                 document.emplace_back(std::string{service::strErrors}, scx.getErrors());

//                 _response = response::toJSON(std::move(document));
//             }
//             catch (const std::exception &ex)
//             {
//                 std::ostringstream oss;

//                 oss << "Caught exception executing the query: " << ex.what();

//                 SetError(oss.str().c_str());
//             }
//         }

//         // Executed when the async work is complete
//         // this function will be run inside the main event loop
//         // so it is safe to use V8 again
//         void OnOK() 
//         {
//             // Napi::HandleScope *scope;
//             // auto resolver = c_resolverIndex.As<v8::Promise::Resolver>();
//             Napi::Promise::Deferred resolver = Napi::Promise::Deferred::New(_env);
//             // auto resolver = c_resolverIndex.As<v8::Promise::Resolver>();

//             // resolver->Resolve(Nan::GetCurrentContext(), Napi::String::New(env, _response.c_str()).ToLocalChecked());
//             Napi::Value response = Napi::String::New(_env, _response.c_str());
//             resolver.Resolve(response);
//         }

//         void OnError(Napi::Error e)
//         {
//             // Napi::HandleScope *scope;
//             // auto resolver = c_resolverIndex.As<v8::Promise::Resolver>();
//             Napi::Promise::Deferred resolver = Napi::Promise::Deferred::New(_env);

//             // resolver->Reject(Nan::GetCurrentContext(), e.Message());
//             Napi::Value response = Napi::String::New(_env, e.Message());

//             resolver.Reject(response);
//         }

//     FetchWorker::FetchWorker(Napi::CallbackInfo &, Napi::Promise::Deferred &);

//     private:
//         peg::ast _ast;
//         std::string _operationName;
//         response::Value _variables;
//         std::string _response;
//         const Napi::CallbackInfo& _info;
//         const Napi::Env& _env;
// };


Napi::Value fetchQuery(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    
    std::string query = info[0].As<Napi::String>();
    std::string operationName = info[1].As<Napi::String>();
    std::string variables = info[2].As<Napi::String>();

    // std::cerr << "query: " << query << std::endl;


    // return Napi::String::New(env, query);

    // new FetchWorker(std::move(query), std::move(operationName), variables, info, resolver);
    // Napi::Promise::Deferred resolver = Napi::Promise::Deferred::New(env);
    // FetchWorker FetchWorker(info, resolver);
    // return resolver.Promise();

    std::string _response;
    try
    {
        peg::ast _ast = peg::parseString(query);

        if (!serviceSingleton)
        {
            throw std::runtime_error("The service is not started!");
        }

        _response = response::toJSON(serviceSingleton->resolve(nullptr, _ast, "", response::Value(response::Type::Map)).get());
    }
    catch (const std::exception &ex)
    {
        std::cerr << "Caught exception preparing the query: " << ex.what() << std::endl;
    }
    catch (service::schema_exception &scx)
    {
        response::Value document(response::Type::Map);

        document.emplace_back(std::string{service::strData}, response::Value());
        document.emplace_back(std::string{service::strErrors}, scx.getErrors());

        _response = response::toJSON(std::move(document));
    }
    catch (const std::exception &ex)
    {
        // std::ostringstream oss;

        std::cerr << "Caught exception executing the query: " << ex.what() <<  std::endl;

        // SetErrorMessage(oss.str().c_str());
    }
    return Napi::String::New(env, _response);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set("startService", Napi::Function::New(env, startService));
    exports.Set("stopService", Napi::Function::New(env, stopService));
    exports.Set("fetchQuery", Napi::Function::New(env, fetchQuery));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init);
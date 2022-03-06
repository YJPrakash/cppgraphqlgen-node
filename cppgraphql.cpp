#include <napi.h>
#include "./hello/HelloMock.h"

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

std::stringstream errbuf;
bool isHardFailure;
std::string APP_DIR;
std::string HTM_DIR;
bool fstatus;

static std::shared_ptr<hello::Operations> serviceSingleton;

void startService(const Napi::CallbackInfo &info)
{
    // Napi::Env env = info.Env();

    auto query = std::make_shared<hello::Query>(response::StringType("Hello World!"));
    serviceSingleton = std::make_shared<hello::Operations>(query);
    std::cerr << "service started..." << std::endl;
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


Napi::Value fetchQuery(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();
    
    std::string query = info[0].As<Napi::String>();
    std::string operationName = info[1].As<Napi::String>();
    std::string variables = info[2].As<Napi::String>();

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
    catch (service::schema_exception &scx)
    {
        response::Value document(response::Type::Map);

        document.emplace_back(std::string{service::strData}, response::Value());
        document.emplace_back(std::string{service::strErrors}, scx.getErrors());

        _response = response::toJSON(std::move(document));
    }
    catch (const std::exception &ex)
    {
        std::cerr << "Caught exception preparing the query: " << ex.what() << std::endl;
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
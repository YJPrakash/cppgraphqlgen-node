{
  "targets": [
    {
      "target_name": "greet",
      "sources": [
        "greet.cpp",
        "GreetMock.cpp",
        "GreetSchema.cpp",
      ],
      "include_dirs": [
        "<!(node -p \"require('node-addon-api').include\")",
        "/usr/include",
        "/usr/local/include",
        "/usr/include/node",
        "/usr/include/node-addon-api",
      ],
      "cflags_cc": [
        "-std=c++17",
        "-fcoroutines",
        "-fexceptions",
        "-frtti"
      ],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "libraries": [
        "-lgraphqlservice",
        "-lgraphqlresponse",
        "-lgraphqljson",
        "-lgraphqlintrospection",
        "-lgraphqlpeg",
        "-lpthread",
        "-ldl"
      ],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"]
    }
  ]
}

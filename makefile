CFLAGS := -Os -O3 -fPIC -Ofast -std=gnu++11
CSTAND := -std=gnu++17

# CFLAGS := -Os -O3 -std=gnu++17

CC = gcc-10
CXX = g++-10

LDFLAGS := \
	-pthread \
	-rdynamic

DEFS := \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS'	\
	'-D__STDC_FORMAT_MACROS' \
	'-DNAPI_DISABLE_CPP_EXCEPTIONS' \
	'-DBUILDING_NODE_EXTENSION'

# Flags passed to all source files.
GYP_CFLAGS := \
	-fpermissive \
	-frtti \
	-fexceptions \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-fno-omit-frame-pointer

# Flags passed to only C files.
CFLAGS_C :=

# Flags passed to only  C++ files.
CFLAGS_CC := \
	-std=gnu++1y \
	-fexceptions

INC_NAPI := -I./node_modules/node-addon-api
INC_NODE := -I/usr/include/node
INC_NAN := -I/usr/include/nan

INC_GRPSRVCE := -I./include
# INC := -I./separate
# INC := -I./separate -I../cppgraphqlgen/include -I../cppgraphqlgen/PEGTL/include

# INC_NAPI = -I/usr/lib/node_modules/node-addon-api
# INC_NODE := -I/usr/include/node

CGI_LIB = -lcgicc

# LIBS := /home/jeya/cpp-graphql-projects/cppgraphqlgen/src
LIBS := /usr/local/lib
GRPHQL := -L${LIBS}/libgraphqlclient.a -L${LIBS}/libgraphqljson.a -L${LIBS}/libgraphqlintrospection.a -L${LIBS}/libgraphqlservice.a -L${LIBS}/libgraphqlresponse.a -L${LIBS}/libgraphqlpeg.a
GRPHQL_FPIC := -L./libgraphqlclient.a -L./libgraphqljson.a -L./libgraphqlintrospection.a -L./libgraphqlservice.a -L./libgraphqlresponse.a -L./libgraphqlpeg.a -L./libseparateschema.a -L./libseparategraphql.a
GRPHQL_OBJ := ./src/GraphQLService.o ./src/Schema.o ./src/Validation.o ./src/Base64.o ./src/GraphQLResponse.o ./src/SyntaxTree.o ./src/JSONResponse.o ./src/Introspection.o ./src/IntrospectionSchema.o ./src/GraphQLClient.o
LD_GRPHQL := -lgraphqlclient -lgraphqljson -lgraphqlintrospection -lgraphqlservice -lgraphqlresponse -lgraphqlpeg
NOTH_A = nothing.a
GRPHQL_A := libgraphqlclient.a libgraphqljson.a libgraphqlintrospection.a libgraphqlservice.a libgraphqlresponse.a libgraphqlpeg.a
GRPHQL_HELLO := libhellographql.a libhelloschema.a
GRPHQL_GREET := libgreetgraphql.a libgreetschema.a

# OBJ = nothing.o ./hello/hello.o ./hello/HelloSchema.o ./hello/HelloMock.o ./hello/hellosample.o ./greet/greet.o ./greet/GreetSchema.o ./greet/GreetMock.o  ./greet/greetsample.o cppgraphql.o
# ENODE = ${NOTH_A} ./hello/hello.node ./hello/hellosample ./greet/greet.node ./greet/greetsample cppgraphql.node

OBJ = nothing.o ${GRPHQL_OBJ} ./hello/hello.o ./hello/HelloSchema.o ./hello/HelloMock.o cppgraphql.o
ENODE = ${NOTH_A} ./hello/hello.node cppgraphql.node


HELLO := ./hello
GREET := ./greet

target: ${OBJ} ${ENODE}

clean:
	rm -rf *.o *.node *.a
	rm -rf src/*.o
	rm -rf ${HELLO}/*.o ${HELLO}/*.node
	rm -rf ${GREET}/*.o ${GREET}/*.node

./hello/hello.o: ./hello/hello.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} '-DNODE_GYP_MODULE_NAME=hello' ${DEFS} ${GYP_CFLAGS} ${INC_NAPI} ${INC_NODE} -c $< -o $@

./greet/greet.o: ./greet/greet.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} '-DNODE_GYP_MODULE_NAME=greet' ${DEFS} ${GYP_CFLAGS} ${INC_NAPI} ${INC_NODE} -c $< -o $@

cppgraphql.o: cppgraphql.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} '-DNODE_GYP_MODULE_NAME=cppgraphql' ${DEFS} ${GYP_CFLAGS} ${INC_NAPI} ${INC_NODE} -c $< -o $@

# ./hello/hello.node: ./src/GraphQLService.o ./hello/HelloSchema.o ./hello/HelloMock.o ./hello/hello.o
# 	${CXX} ${CFLAGS} -shared -pthread -Wl,-soname=hello.node -Wl,--start-group ./src/GraphQLService.o ./hello/HelloSchema.o ./hello/HelloMock.o ./hello/hello.o ${GRPHQL_FPIC} ${NOTH_A} -Wl,--end-group -o $@

./hello/hello.node: ./hello/hello.o ${GRPHQL_HELLO} ${GRPHQL_A}
	${CXX} ${CFLAGS} -shared -Wl,-soname=hello.node -Wl,--start-group ./hello/hello.o ${GRPHQL_HELLO} ${GRPHQL_A} -lpthread ${NOTH_A} -Wl,--end-group -o $@

./greet/greet.node: ./greet/greet.o ${GRPHQL_GREET} ${GRPHQL_A}
	${CXX} ${CFLAGS} -shared -Wl,-soname=greet.node -Wl,--start-group ./greet/greet.o ${GRPHQL_GREET} ${GRPHQL_A} -lpthread ${NOTH_A} -Wl,--end-group -o $@

cppgraphql.node: ./cppgraphql.o ${GRPHQL_GREET} ${GRPHQL_A}
	${CXX} ${CFLAGS} -shared -Wl,-soname=cppgraphql.node -Wl,--start-group cppgraphql.o ${GRPHQL_HELLO} ${GRPHQL_A} -lpthread ${NOTH_A} -Wl,--end-group -o $@

./hello/hellosample.o: ./hello/hellosample.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

# ./hello/hellosample.node:
# 	${CXX} -std=gnu++17 -shared -pthread -Wl,-soname=hellosample -Wl,--start-group ./hello/HelloSchema.o ./hello/HelloMock.o ./hello/hellosample.o -lpthread ${LD_GRPHQL} -Wl,--end-group -o $@
./greet/greetsample.o: ./greet/greetsample.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

./friend/friendsample.o: ./friend/friendsample.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

./hello/hellosample.node: ./hello/hellosample.o ${GRPHQL_HELLO}
	${CXX} ${CFLAGS} ./hello/hellosample.o -o $@ ${GRPHQL_HELLO} ${LD_GRPHQL} -lpthread 


./hello/HelloSchema.o: ./hello/HelloSchema.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

./hello/HelloMock.o: ./hello/HelloMock.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

libhellographql.a: ./hello/HelloMock.o
	ar qc libhellographql.a  ./hello/HelloMock.o
	ranlib libhellographql.a

libhelloschema.a: ./hello/HelloSchema.o
	ar qc libhelloschema.a  ./hello/HelloSchema.o
	ranlib libhelloschema.a

./greet/greetsample.node: ./greet/greetsample.o ${GRPHQL_GREET}
	${CXX} ${CFLAGS} ./greet/greetsample.o -o $@ ${GRPHQL_GREET} ${LD_GRPHQL} -lpthread 

./greet/GreetSchema.o: ./greet/GreetSchema.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

./greet/GreetMock.o: ./greet/GreetMock.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

libgreetgraphql.a: ./greet/GreetMock.o
	ar qc libgreetgraphql.a  ./greet/GreetMock.o
	ranlib libgreetgraphql.a

libgreetschema.a: ./greet/GreetSchema.o
	ar qc libgreetschema.a  ./greet/GreetSchema.o
	ranlib libgreetschema.a

./src/GraphQLService.o: ./src/GraphQLService.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

./src/Schema.o: ./src/Schema.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@
	
./src/Validation.o: ./src/Validation.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

libgraphqlservice.a:
	ar qc libgraphqlservice.a ./src/GraphQLService.o ./src/Schema.o ./src/Validation.o
	ranlib libgraphqlservice.a

./src/Base64.o: ./src/Base64.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

./src/GraphQLResponse.o: ./src/GraphQLResponse.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

libgraphqlresponse.a: 
	ar qc libgraphqlresponse.a  ./src/Base64.o ./src/GraphQLResponse.o
	ranlib libgraphqlresponse.a

./src/SyntaxTree.o: ./src/SyntaxTree.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

libgraphqlpeg.a: 
	ar qc libgraphqlpeg.a ./src/SyntaxTree.o
	ranlib libgraphqlpeg.a

./src/JSONResponse.o: ./src/JSONResponse.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

libgraphqljson.a: 
	ar qc libgraphqljson.a  ./src/JSONResponse.o
	ranlib libgraphqljson.a

./src/Introspection.o: ./src/Introspection.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

./src/IntrospectionSchema.o: ./src/IntrospectionSchema.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

libgraphqlintrospection.a: 
	ar qc libgraphqlintrospection.a ./src/Introspection.o ./src/IntrospectionSchema.o
	ranlib libgraphqlintrospection.a

./src/GraphQLClient.o: ./src/GraphQLClient.cpp
	${CXX} ${CFLAGS} ${CSTAND} ${INC_GRPSRVCE} -c $< -o $@

libgraphqlclient.a:
	ar qc libgraphqlclient.a  ./src/GraphQLClient.o
	ranlib libgraphqlclient.a

nothing.a: nothing.o
	ar crs nothing.a $<

nothing.o: nothing.c
	${CC} ${LDFLAGS} ${INC_NODE} ${DEFS} -c $< -o $@ 

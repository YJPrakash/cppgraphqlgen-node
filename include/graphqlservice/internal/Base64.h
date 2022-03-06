// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

#pragma once

#ifndef BASE64_H
#define BASE64_H

// clang-format off
#ifdef GRAPHQL_DLLEXPORTS
	#ifdef IMPL_GRAPHQLRESPONSE_DLL
		#define GRAPHQLRESPONSE_EXPORT __declspec(dllexport)
	#else // !IMPL_GRAPHQLRESPONSE_DLL
		#define GRAPHQLRESPONSE_EXPORT __declspec(dllimport)
	#endif // !IMPL_GRAPHQLRESPONSE_DLL
#else // !GRAPHQL_DLLEXPORTS
	#define GRAPHQLRESPONSE_EXPORT
#endif // !GRAPHQL_DLLEXPORTS
// clang-format on

#include <cstdint>
#include <string>
#include <string_view>
#include <vector>

namespace graphql::internal {

// Binary data and opaque strings like IDs are encoded in Base64.
class Base64
{
public:
	// Map a single Base64-encoded character to its 6-bit integer value.
	static constexpr std::uint8_t fromBase64(char ch) noexcept
	{
		return (ch >= 'A' && ch <= 'Z'
				? ch - 'A'
				: (ch >= 'a' && ch <= 'z'
						? ch - 'a' + 26
						: (ch >= '0' && ch <= '9' ? ch - '0' + 52
												  : (ch == '+' ? 62 : (ch == '/' ? 63 : 0xFF)))));
	}

	// Convert a Base64-encoded string to a vector of bytes.
	GRAPHQLRESPONSE_EXPORT static std::vector<std::uint8_t> fromBase64(std::string_view encoded);

	// Map a single 6-bit integer value to its Base64-encoded character.
	static constexpr char toBase64(std::uint8_t i) noexcept
	{
		return (i < 26
				? static_cast<char>(i + static_cast<std::uint8_t>('A'))
				: (i < 52 ? static_cast<char>(i - 26 + static_cast<std::uint8_t>('a'))
						  : (i < 62 ? static_cast<char>(i - 52 + static_cast<std::uint8_t>('0'))
									: (i == 62 ? '+' : (i == 63 ? '/' : padding)))));
	}

	// Convert a set of bytes to Base64.
	GRAPHQLRESPONSE_EXPORT static std::string toBase64(const std::vector<std::uint8_t>& bytes);

private:
	static constexpr char padding = '=';

	// Throw a std::logic_error if the character is out of range.
	static std::uint8_t verifyFromBase64(char ch);

	// Throw a std::logic_error if the integer is out of range.
	static char verifyToBase64(std::uint8_t i);
};

} // namespace graphql::internal

#endif // BASE64_H

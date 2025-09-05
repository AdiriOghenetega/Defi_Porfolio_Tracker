"use client";

import React, { useState } from "react";
import { Token } from "@/types";
import { formatCurrency, formatBalance } from "@/utils/helpers";
import { LoadingSkeleton } from "./ui/LoadingSkeleton";

interface TokenListProps {
  tokens: Token[];
  loading: boolean;
}

export const TokenList: React.FC<TokenListProps> = ({ tokens, loading }) => {
  const [sortBy, setSortBy] = useState<"value" | "balance" | "name">("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (field: "value" | "balance" | "name") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "value":
        compareValue = (a as Token).value - (b as Token).value;
        break;
      case "balance":
        compareValue = parseFloat(a.balance) - parseFloat(b.balance);
        break;
      case "name":
        compareValue = a.name.localeCompare(b.name);
        break;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
        <LoadingSkeleton className="w-24 h-6 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <LoadingSkeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <LoadingSkeleton className="w-20 h-4 mb-2" />
                <LoadingSkeleton className="w-16 h-3" />
              </div>
              <div className="text-right">
                <LoadingSkeleton className="w-16 h-4 mb-2" />
                <LoadingSkeleton className="w-12 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Token Holdings
        </h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No tokens found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Token Holdings
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {tokens.length} tokens
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Sort by:
        </span>
        <div className="flex space-x-2">
          {[
            { key: "value", label: "Value" },
            { key: "balance", label: "Balance" },
            { key: "name", label: "Name" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleSort(key as any)}
              className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                sortBy === key
                  ? "bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {label}
              {sortBy === key && (
                <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Token List */}
      <div className="space-y-4">
        {sortedTokens.map((token) => (
          <div
            key={token.address}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {token.symbol.charAt(0)}
                </span>
              </div>

              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {token.symbol}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {token.name}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(token.value)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {formatBalance(token.balance, token.decimals)} {token.symbol}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                ${token.price.toFixed(token.price < 1 ? 4 : 2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

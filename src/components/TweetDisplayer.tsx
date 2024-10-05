// src/components/TweetDisplayer.tsx

"use client";

import React, { useState } from 'react'; // Removed 'useEffect' from imports
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  BarChart2, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Smile,
  Frown,
  Meh
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

export interface Tweet {
  Profile_Picture: string;
  Name: string;
  User: string;
  Tweet: string;
  Likes: number;
  Replies: number;
  Retweets: number;
  Views: number;
  DateTime: string;
  Display_Time: string;
  Sentiment?: string; // Optional sentiment field
}

type SortOption = 'Latest' | 'Replies' | 'Retweets' | 'Likes' | 'Views';

interface TweetDisplayerProps {
  initialTweets: Tweet[];
}

export default function TweetDisplayer({ initialTweets }: TweetDisplayerProps) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets);
  const [sortOption, setSortOption] = useState<SortOption>('Latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const tweetsPerPage = 5;

  const totalPages = Math.ceil(tweets.length / tweetsPerPage);

  // Sorting function
  const sortTweets = (option: SortOption) => {
    const sortedTweets = [...tweets]; // Changed 'let' to 'const'
    switch (option) {
      case 'Latest':
        sortedTweets.sort((a, b) => new Date(b.DateTime).getTime() - new Date(a.DateTime).getTime());
        break;
      case 'Replies':
        sortedTweets.sort((a, b) => b.Replies - a.Replies);
        break;
      case 'Retweets':
        sortedTweets.sort((a, b) => b.Retweets - a.Retweets);
        break;
      case 'Likes':
        sortedTweets.sort((a, b) => b.Likes - a.Likes);
        break;
      case 'Views':
        sortedTweets.sort((a, b) => b.Views - a.Views);
        break;
      default:
        break;
    }
    setTweets(sortedTweets);
    setCurrentPage(1); // Reset to first page after sorting
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    sortTweets(option);
  };

  // Get tweets for the current page
  const indexOfLastTweet = currentPage * tweetsPerPage;
  const indexOfFirstTweet = indexOfLastTweet - tweetsPerPage;
  const currentTweets = tweets.slice(indexOfFirstTweet, indexOfLastTweet);

  // Function to handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Enhanced Pagination Renderer
  const renderPagination = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPageNumbersToShow = 5; // Maximum number of page buttons to show
    let startPage = Math.max(currentPage - 2, 1);
    const endPage = Math.min(startPage + maxPageNumbersToShow - 1, totalPages); // Changed 'let' to 'const'

    if (endPage - startPage < maxPageNumbersToShow - 1) {
      startPage = Math.max(endPage - maxPageNumbersToShow + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis if needed
    if (startPage > 1) {
      pageNumbers.unshift('...');
    }
    if (endPage < totalPages) {
      pageNumbers.push('...');
    }

    return (
      <div className="flex items-center justify-center mt-4 space-x-1">
        {/* First Page Button */}
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 rounded"
          aria-label="First Page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 rounded"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((number, index) => {
          if (number === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-700">
                ...
              </span>
            );
          } else {
            return (
              <button
                key={number}
                onClick={() => handlePageChange(number as number)}
                className={`px-3 py-1 rounded ${
                  currentPage === number
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                {number}
              </button>
            );
          }
        })}

        {/* Next Page Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 rounded"
          aria-label="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page Button */}
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-gray-700 hover:bg-gray-200 disabled:text-gray-400 rounded"
          aria-label="Last Page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with Sorting Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Tweet Feed</h1>
        {/* Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Sort by: {sortOption} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleSortChange('Latest')}>
              Latest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('Replies')}>
              <MessageCircle className="mr-2 h-4 w-4" /> Replies
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('Retweets')}>
              <Repeat2 className="mr-2 h-4 w-4" /> Retweets
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('Likes')}>
              <Heart className="mr-2 h-4 w-4" /> Likes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange('Views')}>
              <BarChart2 className="mr-2 h-4 w-4" /> Views
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Display Current Page Tweets */}
      {currentTweets.map((tweet, index) => (
        <Card key={index} className="border-b border-gray-200 last:border-b-0">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-4">
              <Avatar>
                <AvatarImage src={tweet.Profile_Picture} alt={tweet.Name} />
                <AvatarFallback>
                  {tweet.Name && tweet.Name.length > 0 ? tweet.Name.charAt(0) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">{tweet.Name}</p>
                  <p className="text-sm text-gray-500">@{tweet.User}</p>
                  <span className="text-sm text-gray-500">·</span>
                  <p className="text-sm text-gray-500">{tweet.Display_Time}</p>
                </div>
                <p className="mt-1 text-sm text-gray-900">{tweet.Tweet}</p>
                {/* Sentiment */}
                {tweet.Sentiment && (
                  <div className="mt-1 flex items-center text-sm">
                    {tweet.Sentiment === 'Positive' && <Smile className="h-4 w-4 mr-1 text-green-500" />}
                    {tweet.Sentiment === 'Negative' && <Frown className="h-4 w-4 mr-1 text-red-500" />}
                    {tweet.Sentiment === 'Neutral' && <Meh className="h-4 w-4 mr-1 text-gray-500" />}
                    <p>Sentiment: {tweet.Sentiment}</p>
                  </div>
                )}
                <div className="mt-2 flex items-center space-x-6">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {tweet.Replies}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500">
                    <Repeat2 className="h-4 w-4 mr-1" />
                    {tweet.Retweets}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                    <Heart className="h-4 w-4 mr-1" />
                    {tweet.Likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500">
                    <BarChart2 className="h-4 w-4 mr-1" />
                    {tweet.Views}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Enhanced Pagination */}
      {totalPages > 1 && renderPagination()}
    </div>
  );
}

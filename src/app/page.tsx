// src/app/page.tsx

import TweetDisplayer from '@/components/TweetDisplayer';
import Insights from '@/components/Insights';
import clientPromise from '@/lib/mongodb';
import { format, formatDistanceToNow } from 'date-fns';
import Sentiment from 'sentiment';

interface Batch {
  batchNumber: number;
  label: string;
}

interface Tweet {
  profile_image?: string;
  name?: string;
  username?: string;
  tweet_content?: string;
  likes?: number;
  replies?: number;
  retweets?: number;
  views?: number;
  datetime_attr?: string;
  batchNumber?: number; // Added to associate tweet with its batch
}

async function getTotalTweets(): Promise<number> {
  try {
    const client = await clientPromise;
    const db = client.db('tweet_db');
    const collection = db.collection('tweets');

    // Get the total number of tweets
    const totalTweets = await collection.countDocuments();
    return totalTweets;
  } catch (error) {
    console.error('Error fetching total tweets:', error);
    return 0;
  }
}

async function getBatches(): Promise<Batch[]> {
  const BATCH_SIZE = 100;
  const totalTweets = await getTotalTweets();
  const totalBatches = Math.ceil(totalTweets / BATCH_SIZE);

  // Generate batch information
  const batches: Batch[] = [];

  for (let i = 1; i <= totalBatches; i++) {
    const skipValue = (i - 1) * BATCH_SIZE;

    try {
      const client = await clientPromise;
      const db = client.db('tweet_db');
      const collection = db.collection('tweets');

      // Fetch tweets in the current batch sorted by datetime_attr descending
      const tweetsInBatch = await collection
        .find()
        .sort({ datetime_attr: -1 })
        .skip(skipValue)
        .limit(BATCH_SIZE)
        .project({ datetime_attr: 1 })
        .toArray();

      if (tweetsInBatch.length > 0) {
        const firstDate = new Date(tweetsInBatch[0].datetime_attr);
        const lastDate = new Date(tweetsInBatch[tweetsInBatch.length - 1].datetime_attr);

        const label = `Batch ${i}: ${format(firstDate, 'yyyy-MM-dd HH:mm')} - ${format(
          lastDate,
          'yyyy-MM-dd HH:mm'
        )}`;

        batches.push({
          batchNumber: i,
          label,
        });
      }
    } catch (error) {
      console.error(`Error fetching batch ${i}:`, error);
      // Optionally, you can decide to continue or break based on the error
    }
  }

  return batches;
}

async function getTweets(batchNumbers: number[]): Promise<any[]> {
  const BATCH_SIZE = 100;
  const skipValues = batchNumbers.map((batchNumber) => (batchNumber - 1) * BATCH_SIZE);

  try {
    const client = await clientPromise;
    const db = client.db('tweet_db');
    const collection = db.collection('tweets');

    let tweets: Tweet[] = [];

    for (const [index, skipValue] of skipValues.entries()) {
      const batchTweets = await collection
        .find()
        .sort({ datetime_attr: -1 })
        .skip(skipValue)
        .limit(BATCH_SIZE)
        .toArray();

      // Add batch number to each tweet
      batchTweets.forEach((tweet) => {
        tweet.batchNumber = batchNumbers[index];
      });

      tweets = tweets.concat(batchTweets);
    }

    // Process tweets as before
    const sentiment = new Sentiment();

    const mappedTweets = tweets.map((tweet) => {
      const tweetContent = tweet.tweet_content || '';
      const sentimentResult = sentiment.analyze(tweetContent);
      let sentimentLabel = 'Neutral';
      if (sentimentResult.score > 0) {
        sentimentLabel = 'Positive';
      } else if (sentimentResult.score < 0) {
        sentimentLabel = 'Negative';
      }

      return {
        batchNumber: tweet.batchNumber || 1, // Default to 1 if undefined
        Profile_Picture: tweet.profile_image || '/default-profile.png',
        Name: tweet.name || 'Unknown',
        User: tweet.username || '@unknown',
        Tweet: tweetContent,
        Likes: tweet.likes || 0,
        Replies: tweet.replies || 0,
        Retweets: tweet.retweets || 0,
        Views: tweet.views || 0,
        DateTime: tweet.datetime_attr || new Date().toISOString(),
        Display_Time: formatDistanceToNow(new Date(tweet.datetime_attr || Date.now()), {
          addSuffix: true,
        }),
        Sentiment: sentimentLabel,
      };
    });

    return mappedTweets;
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return [];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const batches = await getBatches();

  // Get the selected batch numbers from query params or default to the first batch
  const selectedBatchNumbers = searchParams.batches
    ? searchParams.batches.split(',').map((num) => parseInt(num, 10)).filter((num) => !isNaN(num))
    : [1];

  const tweets = await getTweets(selectedBatchNumbers);

  return (
    <main className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 p-4">
        <Insights
          tweets={tweets}
          batches={batches}
          selectedBatchNumbers={selectedBatchNumbers}
        />
      </div>
      {/* Main content */}
      <div className="w-3/4 p-4">
        <TweetDisplayer initialTweets={tweets} />
      </div>
    </main>
  );
}


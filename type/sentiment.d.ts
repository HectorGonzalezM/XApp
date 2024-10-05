// types/sentiment.d.ts

declare module 'sentiment' {
  interface AnalysisResult {
    score: number;
    comparative: number;
    calculation: { [word: string]: number }[];
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  }

  interface Options {
    extras?: { [key: string]: number };
    language?: string;
  }

  class Sentiment {
    constructor();
    analyze(
      phrase: string,
      options?: Options,
      callback?: (err: Error | null, result: AnalysisResult) => void
    ): AnalysisResult;
  }

  export default Sentiment;
}

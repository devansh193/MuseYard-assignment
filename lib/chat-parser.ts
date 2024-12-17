// const timestampRegex =
//   /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}(?::\d{2})? (?:AM|PM))\]/;
const messageRegex = /^\[(.*?)\] (.*?): (.*)$/;
const urlRegex = /(https?:\/\/[^\s]+)/g;
const quoteRegex = /"([^"]*)"/g;
const readingListRegex = /\b(?:Book|Books?|article|paper):\s*(.*)/i;

interface ParsedMessage {
  timestamp: string;
  sender: string;
  content: string;
  category?:
    | "Links/URLs"
    | "Quotes/Insights"
    | "Reading Lists"
    | "Personal Notes";
  data?: string | string[];
}

interface Categories {
  "Links/URLs": ParsedMessage[];
  "Quotes/Insights": ParsedMessage[];
  "Reading Lists": ParsedMessage[];
  "Personal Notes": ParsedMessage[];
}

function parseMessage(line: string): ParsedMessage | null {
  const match = line.match(messageRegex);
  if (!match) return null;

  const [, timestamp, sender, content] = match;
  return { timestamp, sender, content };
}

function categorizeMessage(message: ParsedMessage): ParsedMessage {
  const { content } = message;

  const urls = content.match(urlRegex) || [];
  const quotes = content.match(quoteRegex) || [];
  const readingList = content.match(readingListRegex);

  if (urls.length > 0) {
    return { ...message, category: "Links/URLs", data: urls };
  } else if (quotes.length > 0) {
    return {
      ...message,
      category: "Quotes/Insights",
      data: quotes.map((q) => q.replace(/^"|"$/g, "")),
    };
  } else if (readingList) {
    return {
      ...message,
      category: "Reading Lists",
      data: readingList[1].trim(),
    };
  } else {
    return { ...message, category: "Personal Notes" };
  }
}

export function parseChat(content: string): Categories {
  const categories: Categories = {
    "Links/URLs": [],
    "Quotes/Insights": [],
    "Reading Lists": [],
    "Personal Notes": [],
  };

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const parsedMessages: ParsedMessage[] = lines
    .map(parseMessage)
    .filter((msg): msg is ParsedMessage => msg !== null)
    .map(categorizeMessage);

  parsedMessages.forEach((message) => {
    if (message.category) {
      categories[message.category].push(message);
    }
  });

  return categories;
}

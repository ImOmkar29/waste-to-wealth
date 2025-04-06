import nlp from "compromise";

// Define categories with keywords and priorities
const categories = [
  {
    keywords: ["plastic", "bottle", "bag", "organizer"],
    category: "Accessories",
    priority: 1, // Higher priority for specific keywords
  },
  {
    keywords: ["wood", "wooden", "furniture", "table", "shelf", "chair", "bookshelf"], // Added "wooden" and "bookshelf"
    category: "Furniture",
    priority: 3, // Increased priority to 3
  },
  {
    keywords: ["newspaper", "art", "paper", "book", "painting", "sculpture"],
    category: "Art",
    priority: 2, // Reduced priority to 2
  },
  {
    keywords: ["metal", "home", "decor", "lamp", "vase"],
    category: "Home Decor",
    priority: 4,
  },
  {
    keywords: ["electronic", "waste", "gadget", "device", "computer"],
    category: "Electronics",
    priority: 5,
  },
];

// Classify product based on description
export const classifyProduct = (description) => {
  // Step 1: Normalize the description and extract words
  const words = nlp(description.toLowerCase()).terms().out("array");

  // Step 2: Initialize the best match
  let bestMatch = { category: "Other", priority: 0 }; // Default category

  // Step 3: Iterate through categories and find the best match
  for (const { keywords, category, priority } of categories) {
    // Count how many keywords match the description
    const matchCount = keywords.filter((keyword) =>
      words.some((word) => word === keyword) // Exact matching
    ).length;

    // If there's a match and the priority is higher, update the best match
    if (matchCount > 0 && priority > bestMatch.priority) {
      bestMatch = { category, priority };
    }
  }

  // Step 4: Return the best matching category
  return bestMatch.category;
};
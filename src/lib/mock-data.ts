export type User = {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  avatarUrl: string;
};

export type ItemType = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
  itemCount: number;
};

export type Collection = {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  itemCount: number;
};

export type Item = {
  id: string;
  title: string;
  contentType: "text" | "file";
  content?: string;
  fileUrl?: string;
  fileName?: string;
  url?: string;
  description?: string;
  language?: string;
  isFavorite: boolean;
  isPinned: boolean;
  typeId: string;
  collectionId: string;
  tags: string[];
  aiSummary?: string;
  aiSuggestedTags?: string[];
  updatedAt: string;
};

export const currentUser: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  isPro: true,
  avatarUrl: "/avatars/john-doe.jpg",
};

export const itemTypes: ItemType[] = [
  { id: "type-snippet", name: "Snippets", icon: "code", color: "blue", isSystem: true, itemCount: 24 },
  { id: "type-prompt", name: "Prompts", icon: "sparkles", color: "purple", isSystem: true, itemCount: 18 },
  { id: "type-command", name: "Commands", icon: "terminal", color: "orange", isSystem: true, itemCount: 15 },
  { id: "type-note", name: "Notes", icon: "file-text", color: "yellow", isSystem: true, itemCount: 12 },
  { id: "type-file", name: "Files", icon: "file", color: "gray", isSystem: true, itemCount: 5 },
  { id: "type-image", name: "Images", icon: "image", color: "pink", isSystem: true, itemCount: 3 },
  { id: "type-url", name: "Links", icon: "link", color: "cyan", isSystem: true, itemCount: 8 },
];

export const collections: Collection[] = [
  {
    id: "coll-react-patterns",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    isFavorite: true,
    itemCount: 12,
  },
  {
    id: "coll-context-files",
    name: "Context Files",
    description: "AI context files for projects",
    isFavorite: true,
    itemCount: 5,
  },
  {
    id: "coll-git-commands",
    name: "Git Commands",
    description: "Frequently used git commands",
    isFavorite: true,
    itemCount: 15,
  },
  {
    id: "coll-python-snippets",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    isFavorite: false,
    itemCount: 8,
  },
  {
    id: "coll-interview-prep",
    name: "Interview Prep",
    description: "Technical interview preparation",
    isFavorite: false,
    itemCount: 24,
  },
  {
    id: "coll-ai-prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    isFavorite: false,
    itemCount: 18,
  },
];

export const items: Item[] = [
  {
    id: "item-1",
    title: "useAuth Hook",
    contentType: "text",
    description: "Custom authentication hook for React applications",
    content: `import { useContext } from 'react'
import { AuthContext } from './AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}`,
    language: "typescript",
    typeId: "type-snippet",
    collectionId: "coll-react-patterns",
    tags: ["react", "auth", "hooks"],
    isFavorite: true,
    isPinned: true,
    updatedAt: "2026-01-15T09:00:00.000Z",
  },
  {
    id: "item-2",
    title: "API Error Handling Pattern",
    contentType: "text",
    description: "Fetch wrapper with exponential backoff retry logic",
    content: `async function fetchWithRetry(url, retries = 3) {
  try {
    return await fetch(url)
  } catch (err) {
    if (retries === 0) throw err
    await new Promise((r) => setTimeout(r, 2 ** (3 - retries) * 1000))
    return fetchWithRetry(url, retries - 1)
  }
}`,
    language: "typescript",
    typeId: "type-snippet",
    collectionId: "coll-react-patterns",
    tags: ["api", "error-handling", "fetch"],
    isFavorite: false,
    isPinned: true,
    updatedAt: "2026-01-12T09:00:00.000Z",
  },
  {
    id: "item-3",
    title: "react.dev docs",
    contentType: "text",
    url: "https://react.dev/",
    typeId: "type-url",
    collectionId: "coll-react-patterns",
    tags: ["react", "docs"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-29T10:00:00.000Z",
  },
  {
    id: "item-4",
    title: "Python list comprehension cheatsheet",
    contentType: "text",
    content: `squares = [x * x for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
pairs = [(x, y) for x in range(3) for y in range(3)]`,
    language: "python",
    typeId: "type-snippet",
    collectionId: "coll-python-snippets",
    tags: ["python", "list"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-28T10:00:00.000Z",
  },
  {
    id: "item-5",
    title: "Virtual environment setup notes",
    contentType: "text",
    description: "Use python -m venv .venv then source .venv/bin/activate. Add .venv to .gitignore.",
    typeId: "type-note",
    collectionId: "coll-python-snippets",
    tags: ["python", "venv"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-27T10:00:00.000Z",
  },
  {
    id: "item-6",
    title: "Project context file",
    contentType: "file",
    fileUrl: "/files/project-context.md",
    fileName: "project-context.md",
    typeId: "type-file",
    collectionId: "coll-context-files",
    tags: ["context", "ai"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-26T10:00:00.000Z",
  },
  {
    id: "item-7",
    title: "AI context guidelines",
    contentType: "text",
    description: "Keep context files short and specific. Reference them from CLAUDE.md or AGENTS.md.",
    typeId: "type-note",
    collectionId: "coll-context-files",
    tags: ["context", "ai"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-25T10:00:00.000Z",
  },
  {
    id: "item-8",
    title: "Binary search algorithm",
    contentType: "text",
    content: `function binarySearch(arr, target) {
  let lo = 0, hi = arr.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] === target) return mid
    if (arr[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return -1
}`,
    language: "javascript",
    typeId: "type-snippet",
    collectionId: "coll-interview-prep",
    tags: ["algorithms", "interview"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-24T10:00:00.000Z",
  },
  {
    id: "item-9",
    title: "System design notes",
    contentType: "text",
    description: "Load balancing, caching layers, and database sharding strategies for scale interviews.",
    typeId: "type-note",
    collectionId: "coll-interview-prep",
    tags: ["system-design", "interview"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-23T10:00:00.000Z",
  },
  {
    id: "item-10",
    title: "Big-O cheat sheet",
    contentType: "text",
    url: "https://www.bigocheatsheet.com/",
    typeId: "type-url",
    collectionId: "coll-interview-prep",
    tags: ["interview", "reference"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-22T10:00:00.000Z",
  },
  {
    id: "item-11",
    title: "Undo last commit",
    contentType: "text",
    content: "git reset --soft HEAD~1",
    typeId: "type-command",
    collectionId: "coll-git-commands",
    tags: ["git"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-21T10:00:00.000Z",
  },
  {
    id: "item-12",
    title: "Git aliases setup",
    contentType: "text",
    description: "Add [alias] section to ~/.gitconfig for shortcuts like co, br, and st.",
    typeId: "type-note",
    collectionId: "coll-git-commands",
    tags: ["git", "productivity"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-20T10:00:00.000Z",
  },
  {
    id: "item-13",
    title: "Explain this code",
    contentType: "text",
    content: "Explain what this code does, step by step, as if teaching a junior developer.",
    typeId: "type-prompt",
    collectionId: "coll-ai-prompts",
    tags: ["ai", "prompt"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-19T10:00:00.000Z",
  },
  {
    id: "item-14",
    title: "Refactor for readability",
    contentType: "text",
    content: "Refactor this function for readability and maintainability without changing its behavior.",
    typeId: "type-prompt",
    collectionId: "coll-ai-prompts",
    tags: ["ai", "refactor"],
    isFavorite: false,
    isPinned: false,
    updatedAt: "2026-07-18T10:00:00.000Z",
  },
];

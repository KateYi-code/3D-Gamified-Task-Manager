export interface TaskStory {
    time: number; // seconds
    formatted: string; // formatted as mm:ss
    createdAt: string; // ISO timestamp
}

// Internal cache
const inMemoryStories: TaskStory[] = [];

// Load from localStorage (client only)
function loadFromLocalStorage(): TaskStory[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem('task-stories');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveToLocalStorage(stories: TaskStory[]) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('task-stories', JSON.stringify(stories));
    }
}

export function addStory(time: number, formatted: string) {
    const newStory: TaskStory = {
        time,
        formatted,
        createdAt: new Date().toISOString(),
    };

    // Update memory
    inMemoryStories.push(newStory);

    // Update localStorage
    const current = loadFromLocalStorage();
    current.push(newStory);
    saveToLocalStorage(current);
}

export function getStories(): TaskStory[] {
    if (typeof window !== 'undefined') {
        // Try localStorage first
        return loadFromLocalStorage();
    }
    // Fallback to in-memory cache (SSR)
    return inMemoryStories;
}

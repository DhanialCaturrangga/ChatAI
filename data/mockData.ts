// Mock data for Chat AI application

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

export interface Conversation {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    avatar: string;
    messages: Message[];
}

export const conversations: Conversation[] = [
    {
        id: '1',
        title: 'Travel Planning',
        lastMessage: 'I can help you plan your trip to Japan! 🇯🇵',
        timestamp: new Date('2026-01-30T14:30:00'),
        avatar: '🌏',
        messages: [
            {
                id: '1-1',
                text: 'Hi! I want to plan a trip to Japan.',
                isUser: true,
                timestamp: new Date('2026-01-30T14:25:00'),
            },
            {
                id: '1-2',
                text: 'I can help you plan your trip to Japan! 🇯🇵 When are you planning to visit and how long will your trip be?',
                isUser: false,
                timestamp: new Date('2026-01-30T14:25:30'),
            },
            {
                id: '1-3',
                text: 'I\'m thinking of visiting in April for about 2 weeks.',
                isUser: true,
                timestamp: new Date('2026-01-30T14:26:00'),
            },
            {
                id: '1-4',
                text: 'April is a wonderful time to visit Japan! 🌸 You\'ll catch the cherry blossom season (hanami). Here are some recommended destinations:\n\n1. **Tokyo** (3-4 days) - Modern city life, temples, shopping\n2. **Kyoto** (3-4 days) - Traditional temples, geishas, bamboo forests\n3. **Osaka** (2 days) - Food paradise, Osaka Castle\n4. **Hiroshima** (1 day) - Peace Memorial\n5. **Nara** (1 day) - Friendly deer, ancient temples\n\nWould you like more details about any of these places?',
                isUser: false,
                timestamp: new Date('2026-01-30T14:27:00'),
            },
        ],
    },
    {
        id: '2',
        title: 'Coding Help',
        lastMessage: 'Here\'s how you can implement that function...',
        timestamp: new Date('2026-01-30T12:15:00'),
        avatar: '💻',
        messages: [
            {
                id: '2-1',
                text: 'How do I create a custom hook in React?',
                isUser: true,
                timestamp: new Date('2026-01-30T12:10:00'),
            },
            {
                id: '2-2',
                text: 'Great question! A custom hook in React is a JavaScript function that starts with "use" and can call other hooks. Here\'s a simple example:\n\n```javascript\nimport { useState, useEffect } from \'react\';\n\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n  \n  useEffect(() => {\n    const handleResize = () => setWidth(window.innerWidth);\n    window.addEventListener(\'resize\', handleResize);\n    return () => window.removeEventListener(\'resize\', handleResize);\n  }, []);\n  \n  return width;\n}\n```\n\nThis hook tracks the window width and updates when resized!',
                isUser: false,
                timestamp: new Date('2026-01-30T12:11:00'),
            },
        ],
    },
    {
        id: '3',
        title: 'Recipe Ideas',
        lastMessage: 'Try this delicious pasta recipe! 🍝',
        timestamp: new Date('2026-01-29T18:45:00'),
        avatar: '🍳',
        messages: [
            {
                id: '3-1',
                text: 'What can I cook with pasta, tomatoes, and garlic?',
                isUser: true,
                timestamp: new Date('2026-01-29T18:40:00'),
            },
            {
                id: '3-2',
                text: 'You can make a classic **Aglio e Olio** with a tomato twist! 🍝\n\n**Ingredients:**\n- 400g spaghetti\n- 4 cloves garlic, sliced\n- 200g cherry tomatoes\n- 1/4 cup olive oil\n- Red pepper flakes\n- Fresh basil\n- Parmesan cheese\n\n**Instructions:**\n1. Cook pasta al dente\n2. Sauté garlic in olive oil until golden\n3. Add halved tomatoes, cook 3-4 minutes\n4. Toss with pasta and add pepper flakes\n5. Top with basil and parmesan\n\nReady in 20 minutes! 👨‍🍳',
                isUser: false,
                timestamp: new Date('2026-01-29T18:41:00'),
            },
        ],
    },
    {
        id: '4',
        title: 'Fitness Advice',
        lastMessage: 'Here\'s a beginner workout plan for you! 💪',
        timestamp: new Date('2026-01-29T09:20:00'),
        avatar: '🏋️',
        messages: [
            {
                id: '4-1',
                text: 'I want to start working out. Where do I begin?',
                isUser: true,
                timestamp: new Date('2026-01-29T09:15:00'),
            },
            {
                id: '4-2',
                text: 'That\'s awesome! Starting a fitness journey is a great decision! 💪\n\nHere\'s a beginner-friendly plan:\n\n**Week 1-2: Foundation**\n- 20 min walks daily\n- Basic stretching\n- 2x bodyweight exercises\n\n**Exercises to start:**\n- Squats: 3x10\n- Push-ups (modified): 3x8\n- Planks: 3x20 sec\n- Lunges: 3x8 each leg\n\n**Tips:**\n✅ Stay hydrated\n✅ Rest between workout days\n✅ Sleep 7-8 hours\n✅ Track your progress\n\nWant me to create a detailed weekly schedule?',
                isUser: false,
                timestamp: new Date('2026-01-29T09:17:00'),
            },
        ],
    },
    {
        id: '5',
        title: 'Language Learning',
        lastMessage: 'Bonjour! Let\'s practice French today! 🇫🇷',
        timestamp: new Date('2026-01-28T15:30:00'),
        avatar: '📚',
        messages: [
            {
                id: '5-1',
                text: 'Can you help me learn basic French phrases?',
                isUser: true,
                timestamp: new Date('2026-01-28T15:25:00'),
            },
            {
                id: '5-2',
                text: 'Bonjour! Of course! 🇫🇷\n\n**Essential phrases:**\n\n🗣️ **Greetings:**\n- Bonjour - Hello/Good day\n- Bonsoir - Good evening\n- Au revoir - Goodbye\n- Salut - Hi (informal)\n\n👤 **Introductions:**\n- Je m\'appelle... - My name is...\n- Comment vous appelez-vous? - What\'s your name?\n- Enchanté(e) - Nice to meet you\n\n🙏 **Politeness:**\n- S\'il vous plaît - Please\n- Merci (beaucoup) - Thank you (very much)\n- De rien - You\'re welcome\n- Excusez-moi - Excuse me\n\nWant to practice pronunciation? 🎯',
                isUser: false,
                timestamp: new Date('2026-01-28T15:27:00'),
            },
        ],
    },
];

export const userProfile = {
    name: 'Daniel Caturrangga',
    email: 'daniel.caturrangga@gmail.com',
    avatar: '👤',
    joinDate: 'January 2026',
    totalChats: 42,
    favoriteTopics: ['Travel', 'Coding', 'Language Learning'],
};

export const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const formatMessageTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

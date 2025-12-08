
import { Event } from '@/context/EventContext';

export interface DatePlan {
    title: string;
    location: string;
    cost: string;
    tags: string[];
    description: string;
}

// Helper to get random item from array
const sample = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to shuffle array
const shuffle = <T>(arr: T[]): T[] => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

// Expanded Mock Data
interface DateIdea extends DatePlan {
    budgetTier: 'Low' | 'Mid' | 'High';
    vibe: 'Comfort' | 'Adventure' | 'Romantic' | 'Chill';
    energyLevel: 'Low' | 'High'; // Low = Chill, High = Energetic
    environment: 'Indoor' | 'Outdoor';
}

const DATE_IDEAS: DateIdea[] = [
    // LOW / FREE (< $30)
    {
        title: "Picnic in the Park 🧺",
        location: "Local City Park",
        cost: "$15.00",
        tags: ["Relaxing", "Nature", "Comfort"],
        description: "Simple pleasures are the best. Homemade sandwiches and fresh air.",
        budgetTier: 'Low',
        vibe: 'Comfort',
        energyLevel: 'Low',
        environment: 'Outdoor'
    },
    {
        title: "Street Art Hunt 🎨",
        location: "Downtown Alleys",
        cost: "Free",
        tags: ["Active", "Urban", "Creative"],
        description: "Explore the city's hidden murals. Great for photos and walking.",
        budgetTier: 'Low',
        vibe: 'Adventure',
        energyLevel: 'High',
        environment: 'Outdoor'
    },
    {
        title: "Stargazing Night 🌌",
        location: "Observatory Hill",
        cost: "Free",
        tags: ["Romantic", "Nature", "Chill"],
        description: "Bring a blanket and a thermos of hot cocoa. Watch the stars together.",
        budgetTier: 'Low',
        vibe: 'Romantic',
        energyLevel: 'Low',
        environment: 'Outdoor'
    },
    {
        title: "Home Movie Marathon 🎬",
        location: "Living Room",
        cost: "$10.00",
        tags: ["Cozy", "Indoor", "Chill"],
        description: "Popcorn, snacks, and your favorite trilogy. Pajamas mandatory.",
        budgetTier: 'Low',
        vibe: 'Comfort',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Sunset Beach Walk 🌅",
        location: "West Coast Beach",
        cost: "Free",
        tags: ["Romantic", "Nature", "Active"],
        description: "Walk barefoot in the sand as the sun goes down. Classic and perfect.",
        budgetTier: 'Low',
        vibe: 'Romantic',
        energyLevel: 'Low',
        environment: 'Outdoor'
    },
    {
        title: "Local Museum Day 🏛️",
        location: "City Museum",
        cost: "$25.00",
        tags: ["Culture", "Indoor", "Learning"],
        description: "Get cultured and discuss art or history. Often free for locals!",
        budgetTier: 'Low',
        vibe: 'Chill',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Farmer's Market Run 🥕",
        location: "Town Square",
        cost: "$20.00",
        tags: ["Foodie", "Morning", "Active"],
        description: "Support local. Buy fresh ingredients and cook a meal together later.",
        budgetTier: 'Low',
        vibe: 'Comfort',
        energyLevel: 'High',
        environment: 'Outdoor'
    },
    {
        title: "Coffee Shop Board Games ☕",
        location: "The Daily Grind",
        cost: "$18.00",
        tags: ["Playful", "Indoor", "Chill"],
        description: "Sip lattes and get competitive with Scrabble or Catan.",
        budgetTier: 'Low',
        vibe: 'Comfort',
        energyLevel: 'Low',
        environment: 'Indoor'
    },

    // MID RANGE ($30 - $100)
    {
        title: "Italian Dinner 🍝",
        location: "Tony's Trattoria",
        cost: "$70.00",
        tags: ["Classic", "Romantic", "Food"],
        description: "Candlelight, pasta, and wine. You can't go wrong with the classics.",
        budgetTier: 'Mid',
        vibe: 'Romantic',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Ax Throwing / Arcade 🕹️",
        location: "The Rec Room",
        cost: "$60.00",
        tags: ["Fun", "Active", "Playful"],
        description: "Unleash your inner child. Competitive fun is great for bonding.",
        budgetTier: 'Mid',
        vibe: 'Adventure',
        energyLevel: 'High',
        environment: 'Indoor'
    },
    {
        title: "Pottery Class 🏺",
        location: "Clay Studio",
        cost: "$90.00",
        tags: ["Creative", "Learning", "Fun"],
        description: "Get your hands dirty! Create a mug or bowl to keep forever.",
        budgetTier: 'Mid',
        vibe: 'Adventure',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Live Jazz Club 🎷",
        location: "Blue Note Basement",
        cost: "$80.00",
        tags: ["Music", "Nightlife", "Classy"],
        description: "Smooth tunes and craft cocktails in an intimate setting.",
        budgetTier: 'Mid',
        vibe: 'Romantic',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Botanical Garden 🌺",
        location: "City Gardens",
        cost: "$40.00",
        tags: ["Nature", "Beautiful", "Chill"],
        description: "Wander through exotic plants and flowers. Very instagrammable.",
        budgetTier: 'Mid',
        vibe: 'Chill',
        energyLevel: 'Low',
        environment: 'Outdoor'
    },
    {
        title: "Comedy Club 🎤",
        location: "Laugh Factory",
        cost: "$50.00",
        tags: ["Fun", "Nightlife", "Entertainment"],
        description: "Laughter is the best aphrodisiac. Catch a local set.",
        budgetTier: 'Mid',
        vibe: 'Adventure',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Bowling & Burgers 🎳",
        location: "Strike Zone",
        cost: "$55.00",
        tags: ["Retro", "Active", "Fun"],
        description: "Classic date night. Rent the ugly shoes and aim for a strike.",
        budgetTier: 'Mid',
        vibe: 'Comfort',
        energyLevel: 'High',
        environment: 'Indoor'
    },
    {
        title: "Wine Tasting 🍷",
        location: "Local Vineyard",
        cost: "$85.00",
        tags: ["Classy", "Daytime", "Foodie"],
        description: "Sample a flight of local wines and learn about the process.",
        budgetTier: 'Mid',
        vibe: 'Chill',
        energyLevel: 'Low',
        environment: 'Indoor' // Often indoors or covered
    },

    // HIGH / SPLURGE (> $100)
    {
        title: "Michelin Tasting Menu 🌟",
        location: "Top Rated Fusion Spot",
        cost: "$250.00",
        tags: ["Fancy", "Foodie", "Experience"],
        description: "A culinary journey for the senses. Dress up and indulge.",
        budgetTier: 'High',
        vibe: 'Romantic',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Luxury Spa Day 🧖‍♂️",
        location: "Resort Spa",
        cost: "$300.00",
        tags: ["Pampering", "Chill", "Luxury"],
        description: "Ultimate relaxation. Massage, sauna, and zero worries.",
        budgetTier: 'High',
        vibe: 'Comfort',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Helicopter Tour 🚁",
        location: "Helipad",
        cost: "$400.00",
        tags: ["Exciting", "View", "Once-in-a-lifetime"],
        description: "See the city from above. An unforgettable adrenaline rush.",
        budgetTier: 'High',
        vibe: 'Adventure',
        energyLevel: 'High',
        environment: 'Outdoor'
    },
    {
        title: "Weekend Getaway 🏨",
        location: "Boutique Hotel",
        cost: "$500.00",
        tags: ["Travel", "Romantic", "Escape"],
        description: "Pack a bag and escape reality for 48 hours.",
        budgetTier: 'High',
        vibe: 'Romantic',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Private Boat Rental ⛵",
        location: "Marina",
        cost: "$350.00",
        tags: ["Water", "Luxury", "Private"],
        description: "Cruise the harbor on your own private vessel. Sunset recommended.",
        budgetTier: 'High',
        vibe: 'Adventure',
        energyLevel: 'Low',
        environment: 'Outdoor'
    },
    {
        title: "Orchestra / Ballet 🎻",
        location: "Grand Theater",
        cost: "$200.00",
        tags: ["Culture", "Fancy", "Nightout"],
        description: "Get dressed to the nines for a night of high culture.",
        budgetTier: 'High',
        vibe: 'Romantic',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
    {
        title: "Omakase Experience 🍣",
        location: "Sushi Bar",
        cost: "$180.00",
        tags: ["Foodie", "Intimate", "Experience"],
        description: "Let the chef decide. Fresh fish flown in daily from Japan.",
        budgetTier: 'High',
        vibe: 'Adventure',
        energyLevel: 'Low',
        environment: 'Indoor'
    },
];

export interface PlannerContext {
    energy?: 'Chill' | 'Energetic';
    weather?: 'Sunny' | 'Rainy';
    pastEvents?: Event[];
}

export const generateDatePlan = async (budget: number, myMood: number, partnerMood: number): Promise<DatePlan> => {
    // Legacy single plan function
    const plans = await generateMonthlyPlan(budget, 1, (myMood + partnerMood) / 2);
    return plans[0];
};

export const generateMonthlyPlan = async (
    totalBudget: number,
    count: number,
    compositeMood: number,
    context: PlannerContext = {}
): Promise<DatePlan[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI thinking

    const avgBudgetPerDate = totalBudget / count;

    // 1. Determine Budget Tier
    let targetTier: 'Low' | 'Mid' | 'High' = 'Mid';
    if (avgBudgetPerDate < 40) targetTier = 'Low';
    if (avgBudgetPerDate > 120) targetTier = 'High';

    // 2. Score & Filter
    // We score every idea. High score = higher chance of being picked.
    // Filtering removes invalid options (e.g. Picnic in Rain).

    let candidates = DATE_IDEAS.map(idea => {
        let score = 0;

        // --- Hard Filters / Penalties ---

        // Weather
        if (context.weather === 'Rainy' && idea.environment === 'Outdoor') {
            return { ...idea, score: -100 }; // Exclude
        }
        if (context.weather === 'Sunny' && idea.environment === 'Outdoor') {
            score += 2; // Boost outdoor when sunny
        }

        // Energy
        if (context.energy === 'Chill' && idea.energyLevel === 'High') score -= 5;
        if (context.energy === 'Energetic' && idea.energyLevel === 'Low') score -= 5;
        if (context.energy === 'Chill' && idea.energyLevel === 'Low') score += 3;
        if (context.energy === 'Energetic' && idea.energyLevel === 'High') score += 3;

        // Budget Tier (Soft filter to allow mixing)
        if (idea.budgetTier === targetTier) score += 10;
        else if (Math.abs(getTierVal(idea.budgetTier) - getTierVal(targetTier)) === 1) score += 2; // Adjacent tier okay
        else score -= 10; // Too far off

        // --- Learning Layer (Past Events) ---
        if (context.pastEvents) {
            context.pastEvents.forEach(event => {
                if (event.status === 'completed' && event.rating !== undefined) {
                    // Try to match event title to idea title (ignoring "Date X:" prefix)
                    // Or match tags?
                    // Simple approach: Check if this idea shares tags with the rated event
                    // We need to look up the original tags for the past event. 
                    // Reverse lookup by title substring:
                    const originalIdea = DATE_IDEAS.find(i => event.title.includes(i.title.split(' ')[0])); // Fuzzy match start

                    if (originalIdea) {
                        // Intersection of tags
                        const commonTags = idea.tags.filter(t => originalIdea.tags.includes(t));
                        if (commonTags.length > 0) {
                            if (event.rating > 0.7) score += (2 * commonTags.length); // Boost similar
                            if (event.rating < 0.4) score -= (2 * commonTags.length); // Penalize similar
                        }
                    }
                }
            });
        }

        return { ...idea, score };
    });

    // Remove excluded
    candidates = candidates.filter(c => c.score > -50);

    // Sort by score desc, then shuffle top results to maintain variety
    // We'll take the top 2x count, then shuffle and take top count
    candidates.sort((a, b) => b.score - a.score);

    // Fallback if we filtered too much
    if (candidates.length < count) {
        // Relax filters? Or just duplicates? 
        // For now, duplicates allowed if desperate, or fill with generic
    }

    const topPool = candidates.slice(0, Math.max(count, 10)); // Top 10 best matches
    const selected = shuffle(topPool).slice(0, count);

    return selected.map((plan, index) => {
        return {
            ...plan,
            title: `Date ${index + 1}: ${plan.title.split(":")[0].trim()}`
        };
    });
};

const getTierVal = (t: string) => {
    if (t === 'Low') return 1;
    if (t === 'Mid') return 2;
    return 3;
}

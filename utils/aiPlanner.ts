
import { Event } from '@/context/EventContext';
import { RestaurantData } from './types';
import { searchRestaurantsByEmotion } from './restaurantAPI';

export type MoodType = 'Energized' | 'Relaxed' | 'Romantic' | 'Adventurous' | 'Playful' | 'Cozy';
export type InterestType = 'Food' | 'Nature' | 'Art' | 'Active' | 'Music' | 'Nightlife';

export interface DatePlan {
    title: string;
    location: string;
    cost: string;
    tags: string[];
    description: string;
    category: InterestType;
    // レストラン情報（Foodカテゴリの場合）
    restaurantOptions?: RestaurantData[];
    selectedRestaurant?: RestaurantData;
    emotionValue?: number;
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
    moods: MoodType[];
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
        category: 'Nature',
        budgetTier: 'Low',
        moods: ['Relaxed', 'Cozy', 'Romantic'],
        environment: 'Outdoor'
    },
    {
        title: "Street Art Hunt 🎨",
        location: "Downtown Alleys",
        cost: "Free",
        tags: ["Active", "Urban", "Creative"],
        description: "Explore the city's hidden murals. Great for photos and walking.",
        category: 'Art',
        budgetTier: 'Low',
        moods: ['Adventurous', 'Energized'],
        environment: 'Outdoor'
    },
    {
        title: "Stargazing Night 🌌",
        location: "Observatory Hill",
        cost: "Free",
        tags: ["Romantic", "Nature", "Chill"],
        description: "Bring a blanket and a thermos of hot cocoa. Watch the stars together.",
        category: 'Nature',
        budgetTier: 'Low',
        moods: ['Romantic', 'Cozy', 'Relaxed'],
        environment: 'Outdoor'
    },
    {
        title: "Home Movie Marathon 🎬",
        location: "Living Room",
        cost: "$10.00",
        tags: ["Cozy", "Indoor", "Chill"],
        description: "Popcorn, snacks, and your favorite trilogy. Pajamas mandatory.",
        category: 'Art', // Loosely art/entertainment
        budgetTier: 'Low',
        moods: ['Cozy', 'Relaxed'],
        environment: 'Indoor'
    },
    {
        title: "Sunset Beach Walk 🌅",
        location: "West Coast Beach",
        cost: "Free",
        tags: ["Romantic", "Nature", "Active"],
        description: "Walk barefoot in the sand as the sun goes down. Classic and perfect.",
        category: 'Nature',
        budgetTier: 'Low',
        moods: ['Romantic', 'Relaxed'],
        environment: 'Outdoor'
    },
    {
        title: "Local Museum Day 🏛️",
        location: "City Museum",
        cost: "$25.00",
        tags: ["Culture", "Indoor", "Learning"],
        description: "Get cultured and discuss art or history. Often free for locals!",
        category: 'Art',
        budgetTier: 'Low',
        moods: ['Relaxed', 'Cozy'],
        environment: 'Indoor'
    },
    {
        title: "Farmer's Market Run 🥕",
        location: "Town Square",
        cost: "$20.00",
        tags: ["Foodie", "Morning", "Active"],
        description: "Support local. Buy fresh ingredients and cook a meal together later.",
        category: 'Food',
        budgetTier: 'Low',
        moods: ['Energized', 'Cozy'],
        environment: 'Outdoor'
    },
    {
        title: "Coffee Shop Board Games ☕",
        location: "The Daily Grind",
        cost: "$18.00",
        tags: ["Playful", "Indoor", "Chill"],
        description: "Sip lattes and get competitive with Scrabble or Catan.",
        category: 'Food',
        budgetTier: 'Low',
        moods: ['Playful', 'Cozy', 'Relaxed'],
        environment: 'Indoor'
    },

    // MID RANGE ($30 - $100)
    {
        title: "Italian Dinner 🍝",
        location: "Tony's Trattoria",
        cost: "$70.00",
        tags: ["Classic", "Romantic", "Food"],
        description: "Candlelight, pasta, and wine. You can't go wrong with the classics.",
        category: 'Food',
        budgetTier: 'Mid',
        moods: ['Romantic', 'Cozy'],
        environment: 'Indoor'
    },
    {
        title: "Ax Throwing / Arcade 🕹️",
        location: "The Rec Room",
        cost: "$60.00",
        tags: ["Fun", "Active", "Playful"],
        description: "Unleash your inner child. Competitive fun is great for bonding.",
        category: 'Active',
        budgetTier: 'Mid',
        moods: ['Playful', 'Energized', 'Adventurous'],
        environment: 'Indoor'
    },
    {
        title: "Pottery Class 🏺",
        location: "Clay Studio",
        cost: "$90.00",
        tags: ["Creative", "Learning", "Fun"],
        description: "Get your hands dirty! Create a mug or bowl to keep forever.",
        category: 'Art',
        budgetTier: 'Mid',
        moods: ['Playful', 'Adventurous'],
        environment: 'Indoor'
    },
    {
        title: "Live Jazz Club 🎷",
        location: "Blue Note Basement",
        cost: "$80.00",
        tags: ["Music", "Nightlife", "Classy"],
        description: "Smooth tunes and craft cocktails in an intimate setting.",
        category: 'Music',
        budgetTier: 'Mid',
        moods: ['Romantic', 'Relaxed', 'Nightlife'],
        environment: 'Indoor'
    },
    {
        title: "Botanical Garden 🌺",
        location: "City Gardens",
        cost: "$40.00",
        tags: ["Nature", "Beautiful", "Chill"],
        description: "Wander through exotic plants and flowers. Very instagrammable.",
        category: 'Nature',
        budgetTier: 'Mid',
        moods: ['Relaxed', 'Romantic'],
        environment: 'Outdoor'
    },
    {
        title: "Comedy Club 🎤",
        location: "Laugh Factory",
        cost: "$50.00",
        tags: ["Fun", "Nightlife", "Entertainment"],
        description: "Laughter is the best aphrodisiac. Catch a local set.",
        category: 'Nightlife',
        budgetTier: 'Mid',
        moods: ['Playful', 'Energized'],
        environment: 'Indoor'
    },
    {
        title: "Bowling & Burgers 🎳",
        location: "Strike Zone",
        cost: "$55.00",
        tags: ["Retro", "Active", "Fun"],
        description: "Classic date night. Rent the ugly shoes and aim for a strike.",
        category: 'Active',
        budgetTier: 'Mid',
        moods: ['Playful', 'Energized'],
        environment: 'Indoor'
    },
    {
        title: "Wine Tasting 🍷",
        location: "Local Vineyard",
        cost: "$85.00",
        tags: ["Classy", "Daytime", "Foodie"],
        description: "Sample a flight of local wines and learn about the process.",
        category: 'Food',
        budgetTier: 'Mid',
        moods: ['Relaxed', 'Cozy'],
        environment: 'Indoor' // Often indoors or covered
    },

    // HIGH / SPLURGE (> $100)
    {
        title: "Michelin Tasting Menu 🌟",
        location: "Top Rated Fusion Spot",
        cost: "$250.00",
        tags: ["Fancy", "Foodie", "Experience"],
        description: "A culinary journey for the senses. Dress up and indulge.",
        category: 'Food',
        budgetTier: 'High',
        moods: ['Romantic', 'Adventurous'],
        environment: 'Indoor'
    },
    {
        title: "Luxury Spa Day 🧖‍♂️",
        location: "Resort Spa",
        cost: "$300.00",
        tags: ["Pampering", "Chill", "Luxury"],
        description: "Ultimate relaxation. Massage, sauna, and zero worries.",
        category: 'Nature', // Or Health/Wellness if we had it
        budgetTier: 'High',
        moods: ['Relaxed', 'Cozy'],
        environment: 'Indoor'
    },
    {
        title: "Helicopter Tour 🚁",
        location: "Helipad",
        cost: "$400.00",
        tags: ["Exciting", "View", "Once-in-a-lifetime"],
        description: "See the city from above. An unforgettable adrenaline rush.",
        category: 'Active',
        budgetTier: 'High',
        moods: ['Adventurous', 'Energized'],
        environment: 'Outdoor'
    },
    {
        title: "Weekend Getaway 🏨",
        location: "Boutique Hotel",
        cost: "$500.00",
        tags: ["Travel", "Romantic", "Escape"],
        description: "Pack a bag and escape reality for 48 hours.",
        category: 'Nature', // Loose fit
        budgetTier: 'High',
        moods: ['Romantic', 'Relaxed'],
        environment: 'Indoor'
    },
    {
        title: "Private Boat Rental ⛵",
        location: "Marina",
        cost: "$350.00",
        tags: ["Water", "Luxury", "Private"],
        description: "Cruise the harbor on your own private vessel. Sunset recommended.",
        category: 'Active',
        budgetTier: 'High',
        moods: ['Adventurous', 'Romantic', 'Relaxed'],
        environment: 'Outdoor'
    },
    {
        title: "Orchestra / Ballet 🎻",
        location: "Grand Theater",
        cost: "$200.00",
        tags: ["Culture", "Fancy", "Nightout"],
        description: "Get dressed to the nines for a night of high culture.",
        category: 'Art',
        budgetTier: 'High',
        moods: ['Romantic', 'Cozy'],
        environment: 'Indoor'
    },
    {
        title: "Omakase Experience 🍣",
        location: "Sushi Bar",
        cost: "$180.00",
        tags: ["Foodie", "Intimate", "Experience"],
        description: "Let the chef decide. Fresh fish flown in daily from Japan.",
        category: 'Food',
        budgetTier: 'High',
        moods: ['Adventurous', 'Romantic'],
        environment: 'Indoor'
    },
];

export interface PlannerContext {
    mood?: MoodType;
    interests?: InterestType[];
    city?: string;
    environment?: 'Indoor' | 'Outdoor' | 'Any';
    pastEvents?: Event[];
}

export const generateMonthlyPlan = async (
    totalBudget: number,
    count: number,
    _compositeMood: number, // Legacy param, ignored
    context: PlannerContext = {}
): Promise<DatePlan[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI thinking

    const avgBudgetPerDate = totalBudget / count;

    // 1. Determine Budget Tier
    let targetTier: 'Low' | 'Mid' | 'High' = 'Mid';
    if (avgBudgetPerDate < 40) targetTier = 'Low';
    if (avgBudgetPerDate > 120) targetTier = 'High';

    console.log("Generating plan with context:", context);

    // 2. Score & Filter
    let candidates = DATE_IDEAS.map(idea => {
        let score = 0;

        // --- Hard Filters / Penalties ---

        // Environment (Indoor/Outdoor)
        if (context.environment && context.environment !== 'Any') {
            if (context.environment !== idea.environment) {
                return { ...idea, score: -100 }; // Exclude
            }
        }

        // --- Matching Logic (Scoring) ---

        // Mood Match
        if (context.mood && idea.moods.includes(context.mood)) {
            score += 15;
            // Bonus if it's the first mood in the list (primary vibe)
            if (idea.moods[0] === context.mood) score += 5;
        }

        // Interests Match
        if (context.interests && context.interests.length > 0) {
            if (context.interests.includes(idea.category)) {
                score += 10;
            }
        }

        // Budget Tier (Soft filter)
        if (idea.budgetTier === targetTier) score += 10;
        else if (Math.abs(getTierVal(idea.budgetTier) - getTierVal(targetTier)) === 1) score += 2;
        else score -= 10;

        // --- Learning Layer (Past Events) ---
        if (context.pastEvents) {
            context.pastEvents.forEach(event => {
                if (event.status === 'completed' && event.rating !== undefined) {
                    const originalIdea = DATE_IDEAS.find(i => event.title.includes(i.title.split(' ')[0]));
                    if (originalIdea) {
                        const commonTags = idea.tags.filter(t => originalIdea.tags.includes(t));
                        if (commonTags.length > 0) {
                            if (event.rating > 0.7) score += (2 * commonTags.length);
                            if (event.rating < 0.4) score -= (2 * commonTags.length);
                        }
                    }
                }
            });
        }

        return { ...idea, score };
    });

    // Remove excluded
    candidates = candidates.filter(c => c.score > -50);

    // Sort by score desc
    candidates.sort((a, b) => b.score - a.score);

    // Fallback if we filtered too much
    if (candidates.length < count) {
        console.warn("Not enough matches found, adding randoms");
    }

    const topPool = candidates.slice(0, Math.max(count, 12)); // larger pool
    const selected = shuffle(topPool).slice(0, count);

    // プラン生成後、Foodカテゴリのプランに対してレストラン検索
    const plansWithRestaurants = await Promise.all(
        selected.map(async (plan, index) => {
            const planTitle = `Date ${index + 1}: ${plan.title.split(":")[0].trim()}`;
            
            // Foodカテゴリの場合のみレストラン検索
            if (plan.category === 'Food') {
                // cityが設定されていない場合はデフォルト値を使用
                const searchCity = context.city || 'San Francisco';
                
                try {
                    // プランの予算から感情評価値を逆算
                    const planBudget = parseFloat(plan.cost.replace(/[^0-9.]/g, '')) || avgBudgetPerDate;
                    const emotionValue = budgetToEmotion(planBudget, avgBudgetPerDate);
                    
                    console.log('Searching restaurants for:', {
                        category: plan.category,
                        city: searchCity,
                        budget: planBudget,
                        emotionValue
                    });
                    
                    // レストラン検索
                    const restaurants = await searchRestaurantsByEmotion(
                        emotionValue,
                        planBudget,
                        searchCity,
                        'Food',
                        context.pastEvents,
                        context.mood
                    );
                    
                    console.log('Found restaurants:', restaurants.length);
                    
                    return {
                        ...plan,
                        title: planTitle,
                        restaurantOptions: restaurants.length > 0 ? restaurants : undefined,
                        emotionValue
                    };
                } catch (error) {
                    console.error('Error searching restaurants:', error);
                    // エラーが発生してもプランは返す（レストラン情報なし）
                    return {
                        ...plan,
                        title: planTitle
                    };
                }
            }
            
            return {
                ...plan,
                title: planTitle
            };
        })
    );

    return plansWithRestaurants;
};

/**
 * 予算から感情評価値を逆算
 */
function budgetToEmotion(planBudget: number, avgBudget: number): number {
    if (avgBudget === 0) return 0.5; // デフォルト
    
    const ratio = planBudget / avgBudget;
    
    if (ratio < 0.7) return 0.2;   // Casual
    if (ratio < 1.3) return 0.5;   // Spot On
    if (ratio < 2.0) return 0.8;   // A Treat
    return 0.95;                   // Premium Treat
}

const getTierVal = (t: string) => {
    if (t === 'Low') return 1;
    if (t === 'Mid') return 2;
    return 3;
}

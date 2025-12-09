import { Event } from '@/context/EventContext';
import { InterestType } from './aiPlanner';
import { RestaurantData, EmotionPattern, GooglePlacesSearchParams } from './types';

// Google Places API Key (環境変数から取得、またはモックモード)
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
const USE_MOCK_DATA = !GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === '';

/**
 * 感情評価値（0-1）を価格帯に変換
 * 
 * 0-0.25: Casual ☕️ → $ (低価格帯)
 * 0.25-0.75: Spot On ✨ → $$ (中価格帯)
 * 0.75-1.0: A Treat 🥂 → $$$ (高価格帯)
 */
export function emotionToPriceLevel(emotionValue: number): 1 | 2 | 3 | 4 {
  if (emotionValue < 0.25) return 1;      // $ - Casual
  if (emotionValue < 0.75) return 2;      // $$ - Spot On
  if (emotionValue < 0.95) return 3;      // $$$ - A Treat
  return 4;                               // $$$$ - Premium Treat
}

/**
 * 感情評価値から予算範囲を計算
 */
export function emotionToBudgetRange(
  emotionValue: number, 
  baseBudget: number
): { min: number; max: number } {
  const priceLevel = emotionToPriceLevel(emotionValue);
  
  const multipliers = {
    1: { min: 0.5, max: 1.2 },   // Casual: 予算の50%-120%
    2: { min: 0.8, max: 1.5 },   // Spot On: 予算の80%-150%
    3: { min: 1.2, max: 2.0 },    // A Treat: 予算の120%-200%
    4: { min: 1.5, max: 3.0 }     // Premium: 予算の150%-300%
  };
  
  const mult = multipliers[priceLevel];
  return {
    min: baseBudget * mult.min,
    max: baseBudget * mult.max
  };
}

/**
 * 感情評価値から感情カテゴリを取得
 */
export function getEmotionCategory(emotionValue: number): 'comfort' | 'spot_on' | 'treat' {
  if (emotionValue < 0.25) return 'comfort';
  if (emotionValue < 0.75) return 'spot_on';
  return 'treat';
}

/**
 * 過去のデートイベントから成功パターンを分析
 */
export function analyzeEmotionPatterns(events: Event[]): EmotionPattern | null {
  if (!events || events.length === 0) return null;
  
  const successful = events.filter(e => 
    e.status === 'completed' && 
    e.rating !== undefined && 
    e.rating > 0.7 && 
    e.matchResult === 'Spot On ✨'
  );
  
  if (successful.length === 0) return null;
  
  const successfulPrices = successful
    .map(e => parseFloat(e.price) || 0)
    .filter(p => p > 0);
  
  if (successfulPrices.length === 0) return null;
  
  const avgSuccessfulPrice = successfulPrices.reduce((a, b) => a + b, 0) / successfulPrices.length;
  
  const priceDistribution = {
    low: successful.filter(e => parseFloat(e.price || '0') < 40).length,
    mid: successful.filter(e => {
      const price = parseFloat(e.price || '0');
      return price >= 40 && price < 100;
    }).length,
    high: successful.filter(e => parseFloat(e.price || '0') >= 100).length
  };
  
  return {
    avgSuccessfulPrice,
    priceDistribution,
    successRate: successful.length / events.length,
    preferredPriceRange: {
      min: Math.min(...successfulPrices),
      max: Math.max(...successfulPrices)
    }
  };
}

/**
 * カテゴリからGoogle Places APIのクエリを取得
 */
function getCategoryQuery(category: InterestType): string {
  const categoryMap: Record<InterestType, string> = {
    'Food': 'restaurant',
    'Nature': 'park',
    'Art': 'art_gallery',
    'Active': 'gym',
    'Music': 'night_club',
    'Nightlife': 'bar'
  };
  return categoryMap[category] || 'restaurant';
}

/**
 * Google Places APIでレストランを検索（モックデータ対応）
 */
async function searchGooglePlaces(params: GooglePlacesSearchParams): Promise<RestaurantData[]> {
  if (USE_MOCK_DATA) {
    // モックデータを返す（開発用）
    return generateMockRestaurants(params);
  }
  
  try {
    // Google Places API Text Search
    const query = params.query || 'restaurant';
    const location = params.location || 'San Francisco';
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' in ' + location)}&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('Google Places API error:', data.status);
      return generateMockRestaurants(params);
    }
    
    if (data.results && data.results.length > 0) {
      return data.results
        .slice(0, params.maxResults || 20)
        .map((place: any) => transformGooglePlaceToRestaurant(place));
    }
    
    return generateMockRestaurants(params);
  } catch (error) {
    console.error('Error searching restaurants:', error);
    return generateMockRestaurants(params);
  }
}

/**
 * Google Places APIのレスポンスをRestaurantDataに変換
 */
function transformGooglePlaceToRestaurant(place: any): RestaurantData {
  const priceLevel = place.price_level || 2; // デフォルトは$$
  const estimatedCost = estimateCostFromPriceLevel(priceLevel);
  
  return {
    placeId: place.place_id,
    name: place.name,
    address: place.formatted_address || place.vicinity || '',
    formattedAddress: place.formatted_address || place.vicinity || '',
    priceLevel: Math.min(4, Math.max(1, priceLevel)) as 1 | 2 | 3 | 4,
    estimatedCost,
    rating: place.rating || 0,
    userRatingsTotal: place.user_ratings_total || 0,
    types: place.types || [],
    cuisine: extractCuisineType(place.types || []),
    location: {
      lat: place.geometry?.location?.lat || 0,
      lng: place.geometry?.location?.lng || 0
    },
    openingHours: place.opening_hours ? {
      openNow: place.opening_hours.open_now || false,
      weekdayText: place.opening_hours.weekday_text
    } : undefined,
    photos: place.photos?.map((p: any) => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
    ),
    photoReference: place.photos?.[0]?.photo_reference
  };
}

/**
 * 価格帯から推定コストを計算（2人分）
 */
function estimateCostFromPriceLevel(priceLevel: number): number {
  const costMap: Record<number, number> = {
    1: 30,   // $ - Casual
    2: 70,   // $$ - Spot On
    3: 150,  // $$$ - A Treat
    4: 300   // $$$$ - Premium
  };
  return costMap[priceLevel] || 70;
}

/**
 * タイプから料理ジャンルを抽出
 */
function extractCuisineType(types: string[]): string | undefined {
  const cuisineTypes = types.filter(t => 
    t.includes('restaurant') && !t.includes('restaurant')
  );
  
  if (cuisineTypes.length > 0) {
    return cuisineTypes[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // 一般的な料理タイプを検索
  const commonCuisines = ['italian', 'japanese', 'chinese', 'mexican', 'french', 'thai', 'indian'];
  for (const cuisine of commonCuisines) {
    if (types.some(t => t.includes(cuisine))) {
      return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
    }
  }
  
  return undefined;
}

/**
 * モックレストランデータを生成（開発用）
 */
function generateMockRestaurants(params: GooglePlacesSearchParams): RestaurantData[] {
  const priceLevel = params.priceLevel || 2;
  const baseCost = estimateCostFromPriceLevel(priceLevel);
  
  const mockRestaurants: RestaurantData[] = [
    {
      placeId: 'mock_1',
      name: 'Bella Vista Italian Restaurant',
      address: '123 Main St, ' + params.location,
      formattedAddress: '123 Main St, ' + params.location,
      priceLevel: priceLevel as 1 | 2 | 3 | 4,
      estimatedCost: baseCost,
      rating: 4.5,
      userRatingsTotal: 234,
      types: ['restaurant', 'italian_restaurant', 'food'],
      cuisine: 'Italian',
      location: { lat: 37.7749, lng: -122.4194 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'mock_2',
      name: 'Sakura Sushi Bar',
      address: '456 Market St, ' + params.location,
      formattedAddress: '456 Market St, ' + params.location,
      priceLevel: priceLevel as 1 | 2 | 3 | 4,
      estimatedCost: baseCost + 10,
      rating: 4.7,
      userRatingsTotal: 189,
      types: ['restaurant', 'japanese_restaurant', 'sushi_restaurant'],
      cuisine: 'Japanese',
      location: { lat: 37.7849, lng: -122.4094 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'mock_3',
      name: 'The Garden Bistro',
      address: '789 Oak Ave, ' + params.location,
      formattedAddress: '789 Oak Ave, ' + params.location,
      priceLevel: priceLevel as 1 | 2 | 3 | 4,
      estimatedCost: baseCost - 5,
      rating: 4.3,
      userRatingsTotal: 156,
      types: ['restaurant', 'vegetarian_restaurant'],
      cuisine: 'Vegetarian',
      location: { lat: 37.7649, lng: -122.4294 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'mock_4',
      name: 'La Petite Maison',
      address: '321 Pine St, ' + params.location,
      formattedAddress: '321 Pine St, ' + params.location,
      priceLevel: priceLevel as 1 | 2 | 3 | 4,
      estimatedCost: baseCost + 15,
      rating: 4.6,
      userRatingsTotal: 298,
      types: ['restaurant', 'french_restaurant'],
      cuisine: 'French',
      location: { lat: 37.7549, lng: -122.4394 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'mock_5',
      name: 'Spice Route Indian Cuisine',
      address: '654 Elm St, ' + params.location,
      formattedAddress: '654 Elm St, ' + params.location,
      priceLevel: priceLevel as 1 | 2 | 3 | 4,
      estimatedCost: baseCost - 10,
      rating: 4.4,
      userRatingsTotal: 167,
      types: ['restaurant', 'indian_restaurant'],
      cuisine: 'Indian',
      location: { lat: 37.7449, lng: -122.4494 },
      openingHours: { openNow: true }
    }
  ];
  
  return mockRestaurants.slice(0, params.maxResults || 5);
}

/**
 * 感情評価に基づいてレストランを検索・推薦
 */
export async function searchRestaurantsByEmotion(
  emotionValue: number,
  baseBudget: number,
  city: string,
  category: InterestType,
  pastEvents?: Event[],
  mood?: string
): Promise<RestaurantData[]> {
  
  // 1. 感情評価から価格帯と予算範囲を計算
  const priceLevel = emotionToPriceLevel(emotionValue);
  const budgetRange = emotionToBudgetRange(emotionValue, baseBudget);
  
  // 2. 過去のパターンを分析
  const pattern = pastEvents && pastEvents.length > 0
    ? analyzeEmotionPatterns(pastEvents)
    : null;
  
  // 3. Google Places APIでレストランを検索
  const restaurants = await searchGooglePlaces({
    query: category === 'Food' ? 'restaurant' : getCategoryQuery(category),
    location: city,
    priceLevel,
    minRating: 4.0,
    maxResults: 20
  });
  
  // 4. 各レストランにスコアを付与
  const scoredRestaurants = restaurants.map(restaurant => {
    let score = 0;
    
    // 基本スコア（評価）
    score += restaurant.rating * 10;
    
    // 価格帯マッチング
    if (restaurant.priceLevel === priceLevel) {
      score += 20;
    } else if (Math.abs(restaurant.priceLevel - priceLevel) === 1) {
      score += 10;
    } else {
      score -= 10;
    }
    
    // 予算範囲内かチェック
    if (restaurant.estimatedCost >= budgetRange.min && 
        restaurant.estimatedCost <= budgetRange.max) {
      score += 15;
    } else if (restaurant.estimatedCost > budgetRange.max) {
      score -= 20; // 予算超過は大幅減点
    }
    
    // 過去の成功パターンとマッチ
    if (pattern) {
      const price = restaurant.estimatedCost;
      if (price >= pattern.preferredPriceRange.min && 
          price <= pattern.preferredPriceRange.max) {
        score += 25; // 過去の成功パターンと一致
      }
    }
    
    // レビュー数（信頼性）
    if (restaurant.userRatingsTotal > 100) {
      score += 5;
    }
    
    // 感情タグのマッチング
    const emotionCategory = getEmotionCategory(emotionValue);
    restaurant.emotionTag = emotionCategory;
    restaurant.emotionScore = emotionValue;
    
    return { ...restaurant, score };
  });
  
  // 5. スコア順にソート
  scoredRestaurants.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // 6. 上位10件を返す
  return scoredRestaurants.slice(0, 10);
}

/**
 * 価格帯のシンボルを取得
 */
export function getPriceLevelSymbol(priceLevel: 1 | 2 | 3 | 4): string {
  return '$'.repeat(priceLevel);
}


import { Event } from '@/context/EventContext';
import { InterestType } from './aiPlanner';
import { PlaceData, RestaurantData, EmotionPattern, GooglePlacesSearchParams } from './types';

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
 * カテゴリからGoogle Places APIの検索タイプとクエリを取得
 */
function getCategorySearchInfo(category: InterestType): { type: string; query: string; types: string[] } {
  const categoryMap: Record<InterestType, { type: string; query: string; types: string[] }> = {
    'Food': { 
      type: 'restaurant', 
      query: 'restaurant',
      types: ['restaurant', 'cafe', 'bakery', 'meal_takeaway']
    },
    'Nature': { 
      type: 'park', 
      query: 'park',
      types: ['park', 'zoo', 'aquarium', 'botanical_garden', 'campground']
    },
    'Art': { 
      type: 'art_gallery', 
      query: 'art gallery museum',
      types: ['art_gallery', 'museum', 'library', 'book_store']
    },
    'Active': { 
      type: 'gym', 
      query: 'gym sports activity',
      types: ['gym', 'sports_complex', 'bowling_alley', 'amusement_park', 'stadium']
    },
    'Music': { 
      type: 'night_club', 
      query: 'music venue concert',
      types: ['night_club', 'bar', 'music_venue', 'concert_hall']
    },
    'Nightlife': { 
      type: 'bar', 
      query: 'bar nightclub',
      types: ['bar', 'night_club', 'restaurant', 'casino']
    }
  };
  return categoryMap[category] || { type: 'restaurant', query: 'restaurant', types: ['restaurant'] };
}

/**
 * Google Places APIで場所を検索（モックデータ対応）
 */
async function searchGooglePlaces(params: GooglePlacesSearchParams): Promise<PlaceData[]> {
  if (USE_MOCK_DATA) {
    // モックデータを返す（開発用）
    return generateMockPlaces(params);
  }
  
  try {
    // カテゴリに応じた検索情報を取得
    const category = params.category as InterestType;
    const searchInfo = category ? getCategorySearchInfo(category) : { type: 'restaurant', query: 'restaurant', types: ['restaurant'] };
    
    const query = params.query || searchInfo.query;
    const location = params.location || 'San Francisco';
    const type = params.type || searchInfo.type;
    
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' in ' + location)}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.warn('Google Places API error:', data.status);
      return generateMockPlaces(params);
    }
    
    if (data.results && data.results.length > 0) {
      return data.results
        .slice(0, params.maxResults || 20)
        .map((place: any) => transformGooglePlaceToPlace(place, category));
    }
    
    return generateMockPlaces(params);
  } catch (error) {
    console.error('Error searching places:', error);
    return generateMockPlaces(params);
  }
}

/**
 * Google Places APIのレスポンスをPlaceDataに変換
 */
function transformGooglePlaceToPlace(place: any, category?: string): PlaceData {
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
    category: category,
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
 * モック場所データを生成（開発用）
 */
function generateMockPlaces(params: GooglePlacesSearchParams): PlaceData[] {
  const category = params.category as InterestType;
  const searchInfo = category ? getCategorySearchInfo(category) : { type: 'restaurant', query: 'restaurant', types: ['restaurant'] };
  const priceLevel = params.priceLevel || 2;
  const baseCost = estimateCostFromPriceLevel(priceLevel);
  
  // カテゴリに応じたモックデータを生成
  if (category === 'Nature') {
    return generateMockNaturePlaces(params, baseCost);
  } else if (category === 'Art') {
    return generateMockArtPlaces(params, baseCost);
  } else if (category === 'Active') {
    return generateMockActivePlaces(params, baseCost);
  } else if (category === 'Music' || category === 'Nightlife') {
    return generateMockMusicPlaces(params, baseCost);
  } else {
    // Food (default)
    return generateMockRestaurants(params, baseCost);
  }
}

/**
 * モックレストランデータを生成（開発用）
 */
function generateMockRestaurants(params: GooglePlacesSearchParams, baseCost: number): PlaceData[] {
  const priceLevel = params.priceLevel || 2;
  
  const mockRestaurants: PlaceData[] = [
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
      category: 'Food',
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
      category: 'Food',
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
      category: 'Food',
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
      category: 'Food',
      location: { lat: 37.7449, lng: -122.4494 },
      openingHours: { openNow: true }
    }
  ];
  
  return mockRestaurants.slice(0, params.maxResults || 5);
}

/**
 * モックNature場所データを生成
 */
function generateMockNaturePlaces(params: GooglePlacesSearchParams, baseCost: number): PlaceData[] {
  return [
    {
      placeId: 'nature_1',
      name: 'Golden Gate Park',
      address: 'Golden Gate Park, ' + params.location,
      formattedAddress: 'Golden Gate Park, ' + params.location,
      priceLevel: 1,
      estimatedCost: 0,
      rating: 4.8,
      userRatingsTotal: 15234,
      types: ['park', 'tourist_attraction'],
      category: 'Nature',
      location: { lat: 37.7694, lng: -122.4862 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'nature_2',
      name: 'Botanical Gardens',
      address: '1000 John F Kennedy Dr, ' + params.location,
      formattedAddress: '1000 John F Kennedy Dr, ' + params.location,
      priceLevel: 1,
      estimatedCost: 15,
      rating: 4.6,
      userRatingsTotal: 8234,
      types: ['botanical_garden', 'park'],
      category: 'Nature',
      location: { lat: 37.7674, lng: -122.4708 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'nature_3',
      name: 'Ocean Beach',
      address: 'Ocean Beach, ' + params.location,
      formattedAddress: 'Ocean Beach, ' + params.location,
      priceLevel: 1,
      estimatedCost: 0,
      rating: 4.7,
      userRatingsTotal: 11234,
      types: ['beach', 'park'],
      category: 'Nature',
      location: { lat: 37.7594, lng: -122.5108 },
      openingHours: { openNow: true }
    }
  ].slice(0, params.maxResults || 3);
}

/**
 * モックArt場所データを生成
 */
function generateMockArtPlaces(params: GooglePlacesSearchParams, baseCost: number): PlaceData[] {
  return [
    {
      placeId: 'art_1',
      name: 'SF Museum of Modern Art',
      address: '151 3rd St, ' + params.location,
      formattedAddress: '151 3rd St, ' + params.location,
      priceLevel: 2,
      estimatedCost: 25,
      rating: 4.5,
      userRatingsTotal: 15234,
      types: ['museum', 'art_gallery'],
      category: 'Art',
      location: { lat: 37.7857, lng: -122.4011 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'art_2',
      name: 'Asian Art Museum',
      address: '200 Larkin St, ' + params.location,
      formattedAddress: '200 Larkin St, ' + params.location,
      priceLevel: 2,
      estimatedCost: 20,
      rating: 4.6,
      userRatingsTotal: 9234,
      types: ['museum'],
      category: 'Art',
      location: { lat: 37.7804, lng: -122.4168 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'art_3',
      name: 'Contemporary Art Gallery',
      address: '77 Geary St, ' + params.location,
      formattedAddress: '77 Geary St, ' + params.location,
      priceLevel: 1,
      estimatedCost: 0,
      rating: 4.4,
      userRatingsTotal: 5234,
      types: ['art_gallery'],
      category: 'Art',
      location: { lat: 37.7874, lng: -122.4058 },
      openingHours: { openNow: true }
    }
  ].slice(0, params.maxResults || 3);
}

/**
 * モックActive場所データを生成
 */
function generateMockActivePlaces(params: GooglePlacesSearchParams, baseCost: number): PlaceData[] {
  return [
    {
      placeId: 'active_1',
      name: 'Rock Climbing Gym',
      address: '1234 Mission St, ' + params.location,
      formattedAddress: '1234 Mission St, ' + params.location,
      priceLevel: 2,
      estimatedCost: 40,
      rating: 4.7,
      userRatingsTotal: 3234,
      types: ['gym', 'sports_complex'],
      category: 'Active',
      location: { lat: 37.7749, lng: -122.4194 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'active_2',
      name: 'Bowling Alley',
      address: '2345 Market St, ' + params.location,
      formattedAddress: '2345 Market St, ' + params.location,
      priceLevel: 2,
      estimatedCost: 35,
      rating: 4.3,
      userRatingsTotal: 2234,
      types: ['bowling_alley', 'entertainment'],
      category: 'Active',
      location: { lat: 37.7849, lng: -122.4094 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'active_3',
      name: 'Yoga Studio',
      address: '3456 Valencia St, ' + params.location,
      formattedAddress: '3456 Valencia St, ' + params.location,
      priceLevel: 2,
      estimatedCost: 30,
      rating: 4.6,
      userRatingsTotal: 4234,
      types: ['gym', 'health'],
      category: 'Active',
      location: { lat: 37.7549, lng: -122.4218 },
      openingHours: { openNow: true }
    }
  ].slice(0, params.maxResults || 3);
}

/**
 * モックMusic/Nightlife場所データを生成
 */
function generateMockMusicPlaces(params: GooglePlacesSearchParams, baseCost: number): PlaceData[] {
  return [
    {
      placeId: 'music_1',
      name: 'Jazz Club',
      address: '456 Fillmore St, ' + params.location,
      formattedAddress: '456 Fillmore St, ' + params.location,
      priceLevel: 2,
      estimatedCost: 50,
      rating: 4.6,
      userRatingsTotal: 5234,
      types: ['night_club', 'bar', 'music_venue'],
      category: params.category,
      location: { lat: 37.7749, lng: -122.4294 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'music_2',
      name: 'Live Music Venue',
      address: '567 Castro St, ' + params.location,
      formattedAddress: '567 Castro St, ' + params.location,
      priceLevel: 2,
      estimatedCost: 45,
      rating: 4.5,
      userRatingsTotal: 4234,
      types: ['music_venue', 'bar'],
      category: params.category,
      location: { lat: 37.7649, lng: -122.4348 },
      openingHours: { openNow: true }
    },
    {
      placeId: 'music_3',
      name: 'Cocktail Bar',
      address: '678 Polk St, ' + params.location,
      formattedAddress: '678 Polk St, ' + params.location,
      priceLevel: 3,
      estimatedCost: 60,
      rating: 4.7,
      userRatingsTotal: 6234,
      types: ['bar', 'night_club'],
      category: params.category,
      location: { lat: 37.7849, lng: -122.4194 },
      openingHours: { openNow: true }
    }
  ].slice(0, params.maxResults || 3);
}

/**
 * 感情評価に基づいて場所を検索・推薦（全カテゴリ対応）
 */
export async function searchPlacesByEmotion(
  emotionValue: number,
  baseBudget: number,
  city: string,
  category: InterestType,
  pastEvents?: Event[],
  mood?: string
): Promise<PlaceData[]> {
  
  // 1. 感情評価から価格帯と予算範囲を計算
  const priceLevel = emotionToPriceLevel(emotionValue);
  const budgetRange = emotionToBudgetRange(emotionValue, baseBudget);
  
  // 2. 過去のパターンを分析（Foodカテゴリの場合のみ）
  const pattern = (category === 'Food' && pastEvents && pastEvents.length > 0)
    ? analyzeEmotionPatterns(pastEvents)
    : null;
  
  // 3. カテゴリに応じた検索情報を取得
  const searchInfo = getCategorySearchInfo(category);
  
  // 4. Google Places APIで場所を検索
  const places = await searchGooglePlaces({
    query: searchInfo.query,
    location: city,
    priceLevel,
    minRating: 4.0,
    maxResults: 20,
    type: searchInfo.type,
    category: category
  });
  
  // 5. 各場所にスコアを付与
  const scoredPlaces = places.map(place => {
    let score = 0;
    
    // 基本スコア（評価）
    score += place.rating * 10;
    
    // 価格帯マッチング（Foodカテゴリの場合のみ重要）
    if (category === 'Food') {
      if (place.priceLevel === priceLevel) {
        score += 20;
      } else if (Math.abs(place.priceLevel - priceLevel) === 1) {
        score += 10;
      } else {
        score -= 10;
      }
    }
    
    // 予算範囲内かチェック
    if (place.estimatedCost >= budgetRange.min && 
        place.estimatedCost <= budgetRange.max) {
      score += 15;
    } else if (place.estimatedCost > budgetRange.max) {
      score -= 20; // 予算超過は大幅減点
    }
    
    // 過去の成功パターンとマッチ（Foodカテゴリの場合のみ）
    if (pattern && category === 'Food') {
      const price = place.estimatedCost;
      if (price >= pattern.preferredPriceRange.min && 
          price <= pattern.preferredPriceRange.max) {
        score += 25; // 過去の成功パターンと一致
      }
    }
    
    // レビュー数（信頼性）
    if (place.userRatingsTotal > 100) {
      score += 5;
    }
    
    // 感情タグのマッチング
    const emotionCategory = getEmotionCategory(emotionValue);
    place.emotionTag = emotionCategory;
    place.emotionScore = emotionValue;
    place.category = category;
    
    return { ...place, score };
  });
  
  // 6. スコア順にソート
  scoredPlaces.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  // 7. 上位10件を返す
  return scoredPlaces.slice(0, 10);
}

/**
 * 後方互換性のため、searchRestaurantsByEmotionをエクスポート
 */
export const searchRestaurantsByEmotion = searchPlacesByEmotion;

/**
 * 価格帯のシンボルを取得
 */
export function getPriceLevelSymbol(priceLevel: 1 | 2 | 3 | 4): string {
  return '$'.repeat(priceLevel);
}



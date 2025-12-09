// Places API Types (for restaurants and other venues)

export interface PlaceData {
    // 基本情報
    placeId: string;
    name: string;
    address: string;
    formattedAddress: string;

    // 価格情報
    priceLevel: 1 | 2 | 3 | 4;
    estimatedCost: number;
    costRange?: { min: number; max: number };

    // 評価情報
    rating: number;
    userRatingsTotal: number;

    // 感情タグ
    emotionTag?: "comfort" | "spot_on" | "treat";
    emotionScore?: number;

    // カテゴリ・タグ
    types: string[];
    cuisine?: string;
    category?: string; // 'Food', 'Nature', 'Art', etc.

    // 場所情報
    location: {
        lat: number;
        lng: number;
    };

    // 営業情報
    openingHours?: {
        openNow: boolean;
        weekdayText?: string[];
    };

    // メディア
    photos?: string[];
    photoReference?: string;

    // その他
    website?: string;
    phoneNumber?: string;

    // スコアリング用
    score?: number;
}

export interface EmotionPattern {
    avgSuccessfulPrice: number;
    priceDistribution: { low: number; mid: number; high: number };
    successRate: number;
    preferredPriceRange: { min: number; max: number };
}

export interface GooglePlacesSearchParams {
    query: string;
    location: string;
    priceLevel?: 1 | 2 | 3 | 4;
    minRating?: number;
    maxResults?: number;
    type?: string;
    category?: string; // InterestType
}

// Backward compatibility
export type RestaurantData = PlaceData;

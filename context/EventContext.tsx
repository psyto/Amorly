import React, { createContext, ReactNode, useContext, useState } from 'react';

export type EventStatus = 'scheduled' | 'pending_review' | 'completed';

export interface Event {
    id: string;
    title: string;
    price: string;
    date: string; // e.g., "2024-12-10" or "Today"
    status: EventStatus;
    rating?: number; // 0-1
    matchResult?: string; // The text from the dashboard (e.g. "You're in sync! 💖")
}

interface EventContextType {
    events: Event[];
    addEvent: (title: string, price: string, date: string, status?: EventStatus) => void;
    markAsDone: (id: string) => void;
    startReview: (id: string) => void;
    rateEvent: (id: string, rating: number, matchResult: string) => void;
    saveDraftRating: (id: string, rating: number, matchResult: string) => void;
    getPendingReviewEvent: () => Event | undefined;
    getNextScheduledEvent: () => Event | undefined;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
    const [events, setEvents] = useState<Event[]>([]); // Start fresh

    const addEvent = (title: string, price: string, date: string, status: EventStatus = 'scheduled') => {
        const newEvent: Event = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            title,
            price,
            date,
            status,
            rating: 0,
            matchResult: 'pending'
        };
        setEvents(prev => [...prev, newEvent]);
    };

    const markAsDone = (id: string) => {
        setEvents(prev => prev.map(e =>
            e.id === id ? { ...e, status: 'pending_review' } : e
        ));
    };

    const startReview = (id: string) => {
        setEvents(prev => prev.map(e =>
            e.id === id ? { ...e, status: 'pending_review' } : e
        ));
    };

    const rateEvent = (id: string, rating: number, matchResult: string) => {
        setEvents(prev => prev.map(e =>
            e.id === id ? { ...e, status: 'completed', rating, matchResult } : e
        ));
    };

    const saveDraftRating = (id: string, rating: number, matchResult: string) => {
        setEvents(prev => prev.map(e =>
            e.id === id ? { ...e, rating, matchResult } : e
        ));
    };

    // Find the LATEST status changes first (so user sees their most recent action)
    const getPendingReviewEvent = () => [...events].reverse().find(e => e.status === 'pending_review');
    const getNextScheduledEvent = () => events.find(e => e.status === 'scheduled');

    return (
        <EventContext.Provider value={{
            events,
            addEvent,
            markAsDone,
            startReview,
            rateEvent,
            saveDraftRating,
            getPendingReviewEvent,
            getNextScheduledEvent
        }}>
            {children}
        </EventContext.Provider>
    );
}

export function useEvent() {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error('useEvent must be used within an EventProvider');
    }
    return context;
}

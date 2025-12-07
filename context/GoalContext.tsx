import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Goal {
    id: string;
    title: string;
    amount: string;
    description: string;
    isCompleted: boolean;
}

interface GoalContextType {
    goals: Goal[];
    addGoal: (title: string, amount: string, description: string) => void;
    toggleGoal: (id: string) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
    const [goals, setGoals] = useState<Goal[]>([
        {
            id: '1',
            title: 'No-Spend Weekend',
            amount: '0',
            description: "Let's enjoy a movie night at home!",
            isCompleted: false,
        },
        {
            id: '2',
            title: 'Anniversary Dinner',
            amount: '50',
            description: 'Saving $50/week for that nice place.',
            isCompleted: true,
        },
        {
            id: '3',
            title: 'Coffee Date',
            amount: '15',
            description: 'Budget: $15. Just a quick catchup.',
            isCompleted: false,
        },
    ]);

    const addGoal = (title: string, amount: string, description: string) => {
        const newGoal: Goal = {
            id: Date.now().toString(),
            title: title || 'New Goal',
            amount: amount || '0',
            description: description || 'Together',
            isCompleted: false,
        };
        setGoals((prev) => [newGoal, ...prev]);
    };

    const toggleGoal = (id: string) => {
        setGoals(prev => prev.map(g => {
            if (g.id === id) return { ...g, isCompleted: !g.isCompleted };
            return { ...g, isCompleted: false }; // Uncheck all others
        }));
    }

    return (
        <GoalContext.Provider value={{ goals, addGoal, toggleGoal }}>
            {children}
        </GoalContext.Provider>
    );
}

export function useGoals() {
    const context = useContext(GoalContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalProvider');
    }
    return context;
}

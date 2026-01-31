"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Account {
    id: string;
    user_id: string;
    name: string;
    type: string;
    status: 'Active' | 'Passed' | 'Blown' | 'Failed';
    start_amount: number;
    currency: string;
    is_default: boolean;
    created_at: string;
}

interface AccountContextType {
    accounts: Account[];
    selectedAccount: Account | null; // null means "Overall"
    isLoading: boolean;
    selectAccount: (accountId: string | null) => void;
    addAccount: (account: Omit<Account, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
    updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const fetchAccounts = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setAccounts([]);
                return;
            }

            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            const mappedAccounts: Account[] = (data || []).map(acc => ({
                ...acc,
                start_amount: Number(acc.start_amount)
            }));

            setAccounts(mappedAccounts);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchAccounts();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                fetchAccounts();
            } else if (event === 'SIGNED_OUT') {
                setAccounts([]);
                setSelectedAccount(null);
            }
        });
        return () => subscription.unsubscribe();
    }, [fetchAccounts, supabase]);

    const selectAccount = (accountId: string | null) => {
        if (accountId === null) {
            setSelectedAccount(null);
        } else {
            const account = accounts.find(a => a.id === accountId);
            if (account) setSelectedAccount(account);
        }
    };

    const addAccount = async (newAccount: Omit<Account, 'id' | 'user_id' | 'created_at'>) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data, error } = await supabase.from('accounts').insert([{
            ...newAccount,
            user_id: user.id
        }]).select().single();

        if (error) throw error;

        const createdAccount = { ...data, start_amount: Number(data.start_amount) };
        setAccounts(prev => [...prev, createdAccount]);
    };

    const updateAccount = async (id: string, updates: Partial<Account>) => {
        const { error } = await supabase.from('accounts').update(updates).eq('id', id);
        if (error) throw error;

        setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
        if (selectedAccount?.id === id) {
            setSelectedAccount(prev => prev ? { ...prev, ...updates } : null);
        }
    };

    const deleteAccount = async (id: string) => {
        const { error } = await supabase.from('accounts').delete().eq('id', id);
        if (error) throw error;

        setAccounts(prev => prev.filter(a => a.id !== id));
        if (selectedAccount?.id === id) setSelectedAccount(null);
    };

    return (
        <AccountContext.Provider value={{
            accounts,
            selectedAccount,
            isLoading,
            selectAccount,
            addAccount,
            updateAccount,
            deleteAccount
        }}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccounts = () => {
    const context = useContext(AccountContext);
    if (!context) throw new Error('useAccounts must be used within AccountProvider');
    return context;
};

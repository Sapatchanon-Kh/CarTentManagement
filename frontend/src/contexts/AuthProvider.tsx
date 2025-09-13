// src/contexts/AuthProvider.tsx

import { useState, useEffect, type ReactNode } from 'react';
import type { Customer } from '../interface/Customer';
import type { Employee } from '../interface/Employee';
import type { Manager } from '../interface/Manager';
import { AuthContext, type AuthContextType } from './AuthContext';

// A Union Type that can be a Customer, an Employee, or a Manager
export type User = Customer | Employee | Manager;

// Helper function to check if a user is a Manager based on a unique property
const isManager = (user: User): user is Manager => {
  return (user as Manager).Username !== undefined;
};

// Helper function to check if a user is an Employee based on a unique property like 'position'
const isEmployee = (user: User): user is Employee => {
  return (user as Employee).position !== undefined;
};

// Helper function to check if a user is a Customer based on a unique property
const isCustomer = (user: User): user is Customer => {
  return (user as Customer).phone !== undefined;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [manager, setManager] = useState<Manager | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedCustomer = localStorage.getItem('currentCustomer');
            const storedEmployee = localStorage.getItem('currentEmployee');
            const storedManager = localStorage.getItem('currentManager');

            if (storedToken) setToken(storedToken);
            if (storedCustomer) setCustomer(JSON.parse(storedCustomer));
            if (storedEmployee) setEmployee(JSON.parse(storedEmployee));
            if (storedManager) setManager(JSON.parse(storedManager));
        } finally {
            setLoading(false);
        }
    }, []);
    
    const login = (userData: User, userToken: string) => {
        setToken(userToken);
        localStorage.setItem('token', userToken);

        if (isManager(userData)) {
            setManager(userData);
            setEmployee(null);
            setCustomer(null);
            localStorage.setItem('currentManager', JSON.stringify(userData));
            localStorage.removeItem('currentEmployee');
            localStorage.removeItem('currentCustomer');
        } else if (isEmployee(userData)) {
            setEmployee(userData);
            setCustomer(null);
            setManager(null);
            localStorage.setItem('currentEmployee', JSON.stringify(userData));
            localStorage.removeItem('currentCustomer');
            localStorage.removeItem('currentManager');
        } else if (isCustomer(userData)) { 
            setCustomer(userData as Customer);
            setEmployee(null);
            setManager(null);
            localStorage.setItem('currentCustomer', JSON.stringify(userData));
            localStorage.removeItem('currentEmployee');
            localStorage.removeItem('currentManager');
        } else {
            console.error('Unknown user data type');
        }
    };

    const logout = () => {
        setToken(null);
        setCustomer(null);
        setEmployee(null);
        setManager(null);
        localStorage.removeItem('token');
        localStorage.removeItem('currentCustomer');
        localStorage.removeItem('currentEmployee');
        localStorage.removeItem('currentManager');
    };

    const user = customer || employee || manager;
    const role = manager ? 'manager' : (employee ? 'employee' : (customer ? 'customer' : null));

    const value: AuthContextType = {
      user,
      role: role as 'customer' | 'employee' | 'manager' | undefined | null,
      token,
      loading,
      login,
      logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
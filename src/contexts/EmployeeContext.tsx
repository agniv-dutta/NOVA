import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Employee } from '@/types/employee';
import { generateEmployees } from '@/utils/dataGenerator';

interface EmployeeContextValue {
  employees: Employee[];
  refreshData: () => void;
  getEmployee: (id: string) => Employee | undefined;
}

const EmployeeContext = createContext<EmployeeContextValue | null>(null);

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(() => generateEmployees(100));

  const refreshData = useCallback(() => {
    setEmployees(generateEmployees(100));
  }, []);

  const getEmployee = useCallback((id: string) => {
    return employees.find(e => e.id === id);
  }, [employees]);

  return (
    <EmployeeContext.Provider value={{ employees, refreshData, getEmployee }}>
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('useEmployees must be used within EmployeeProvider');
  return ctx;
}

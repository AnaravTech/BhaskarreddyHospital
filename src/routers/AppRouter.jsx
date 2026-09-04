import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { Login } from '../pages/Login';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { getRouteByModuleId } from './routes';

export const AppRouter = () => {
  const { currentUser, activeModule } = useHospital();

  if (!currentUser) {
    return <Login />;
  }

  const activeRoute = getRouteByModuleId(activeModule);
  const ActiveComponent = activeRoute.component;

  return (
    <DashboardLayout>
      <ActiveComponent />
    </DashboardLayout>
  );
};

export default AppRouter;

// src/router/AppRouter.tsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layouts
import CustomerLayout from '../layout/AppLayout';
import ManagerLayout from '../layout/ManagerLayout';
import EmployeeLayout from '../layout/EmployeeLayout';

// Pages
import LoginPage from '../pages/login/LoginPage';
import BuyCar from '../pages/customer/buycar/BuyCar';
import RentCarPage from '../pages/customer/rentcar/RentCarPage';
import CusProfilePage from '../pages/customer/profile/ProfilePage';
import PaymentPage from '../pages/customer/payment/PaymentPage';
import BuyInsurancePage from '../pages/customer/insurance/BuyInsurancePage';
import InspectionCarPage from '../pages/customer/inspection/InspectionCarPage';
import InspectionCreatePage from '../pages/customer/inspection/InspectionCreatePage';
import PickupCarPage from '../pages/customer/pickup-delivery/PickupCarPage';
import PickupCarCreatePage from '../pages/customer/pickup-delivery/PickupCarPageCreate';

// Manager Pages
import HomePage from '../pages/manager/stock/HomePage';
import AddnewCarPage from '../pages/manager/stock/AddnewCarPage';
import EditCarTentPage from '../pages/manager/stock/EditCarTentPage';
import AddRentPage from '../pages/manager/rent/AddRentPage';
import EditRentPage from '../pages/manager/rent/EditRentPage';
import CreateRentCarPage from '../pages/manager/rent/CreateRentCarPage';
import RentListPage from '../pages/manager/rent/RentListPage';
import AddSellPage from '../pages/manager/sell/AddSellPage';
import CreateSellCarPage from '../pages/manager/sell/CreateSellCarPage';
import EditSellPage from '../pages/manager/sell/EditSellPage';
import SellListPage from '../pages/manager/sell/SellListPage';

//Manager Blank Page
import TentSummaryPage from '../pages/manager/summary/TentSummaryPage';
import ManageEmployeePage from '../pages/manager/employee/ManageEmployeePage';
import MaProfilePage from '../pages/manager/profile/MaProfilePage'


// Employee Pages 
import HomePageEm from '../pages/employee/HomePageEm';
import AppointmentDetailsPage from '../pages/employee/pickup-delivery/AppointmentDetailsPage';
import AppointmentAll from '../pages/employee/pickup-delivery/AppointmentAll';
import InspectionPage from '../pages/employee/inspection/InspectionPage';
import SummaryPage from '../pages/employee/sell-summary/SummaryPage'
import EmployeeDashboard from '../pages/employee/profile/EmployeeDashboard'
// --- vvvvv --- THIS IS THE FIX --- vvvvv ---
interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user } = useAuth(); // Change from userRole to user

    if (!user) {
        // If no user is logged in, redirect to the login page
        return <Navigate to="/login" replace />;
    }

    // Check if the user's role is in the list of allowed roles
    return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/login" replace />;
};
// --- ^^^^^ --- END OF FIX --- ^^^^^ ---

const AppRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* --- Manager Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
                <Route element={<ManagerLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/add-car" element={<AddnewCarPage />} />
                    <Route path="/edit-car/:id" element={<EditCarTentPage />} />
                    <Route path="/rent" element={<RentListPage />} />
                    <Route path="/edit-rent/:id" element={<EditRentPage />} />
                    <Route path="/create-rent/:id" element={<CreateRentCarPage />} />
                    <Route path="/add-rent" element={<AddRentPage />} />
                    <Route path="/sell" element={<SellListPage />} />
                    <Route path="/edit-sell/:id" element={<EditSellPage />} />
                    <Route path="/create-sell/:id" element={<CreateSellCarPage />} />
                    <Route path="/add-sell" element={<AddSellPage />} />

                    {/* blank page */}
                    <Route path="/tent-summary" element={<TentSummaryPage />} />
                    <Route path="/manage-employee" element={<ManageEmployeePage />} />
                    <Route path="/manager-profile" element={<MaProfilePage />} />

                </Route>
            </Route>

            {/* --- Employee Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                <Route element={<EmployeeLayout />}>
                    <Route path="/homepage-employee" element={<HomePageEm />} />
                    <Route path="/appointment-details/:id" element={<AppointmentDetailsPage />} />
                    <Route path="/AppointmentAll" element={<AppointmentAll />} />
                    <Route path="/Inspection" element={<InspectionPage />} />
                    <Route path="/Summary" element={<SummaryPage />} />
                    <Route path="/Profile" element={<EmployeeDashboard />} />


                </Route>
            </Route>

            {/* --- Customer and Public Routes --- */}
            <Route element={<CustomerLayout />}>
                <Route path="/" element={<Navigate to="/buycar" />} />
                <Route path="/buycar" element={<BuyCar />} />
                <Route path="/rentcar" element={<RentCarPage />} />
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                    <Route path="/profile" element={<CusProfilePage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/buy-insurance" element={<BuyInsurancePage />} />
                    <Route path="/inspection" element={<InspectionCarPage />} />
                    <Route path="/inspection-create" element={<InspectionCreatePage />} />
                    <Route path="/pickup-car" element={<PickupCarPage />} />
                    <Route path="/pickup-car/create" element={<PickupCarCreatePage />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRouter;
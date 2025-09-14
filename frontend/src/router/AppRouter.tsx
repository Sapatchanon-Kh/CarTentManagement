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
import RegisterPage from '../pages/customer/register/RegisterPage';
import BuyCar from '../pages/customer/buycar/BuyCar';
import BuyCarDetailPage from '../pages/customer/buycar/BuyCarDetail';
import RentCarPage from '../pages/customer/rentcar/RentCarPage';
import RentCarDetailPage from '../pages/customer/rentcar/RentCarDetailPage';
import CusProfilePage from '../pages/customer/profile/ProfilePage';
import PaymentPage from '../pages/customer/payment/PaymentPage';
import BuyInsurancePage from '../pages/customer/insurance/BuyInsurancePage';
import InspectionCarPage from '../pages/customer/inspection/InspectionCarPage';
import InspectionCreatePage from '../pages/customer/inspection/InspectionCreatePage';
import PickupCarPage from '../pages/customer/pickup-delivery/PickupCarPage';
import PickupCarCreatePage from '../pages/customer/pickup-delivery/PickupCarPageCreate';

// Manager Pages
import AllCarPage from '../pages/manager/stock/AllCarPage';
import AddnewCarPage from '../pages/manager/stock/AddnewCarPage';
import EditCarTentPage from '../pages/manager/stock/EditCarTentPage';
import AddRentPage from '../pages/manager/rent/AddRentPage';

import EditRentPage from '../pages/manager/rent/AddRentPage';

import CreateRentCarPage from '../pages/manager/rent/CreateRentCarPage';
import RentListPage from '../pages/manager/rent/RentListPage';
import AddSellPage from '../pages/manager/sell/AddSellPage';
import CreateSellCarPage from '../pages/manager/sell/CreateSellCarPage';
import EditSellPage from '../pages/manager/sell/EditSellPage';
import SellListPage from '../pages/manager/sell/SellListPage';
import ManagerInsurancePage from '../pages/manager/insurance/ManagerInsurance'

//Manager Blank Page
import TentSummaryPage from '../pages/manager/summary/TentSummaryPage';
import ManageEmployeePage from '../pages/manager/employee/ManageEmployeePage';
import MaProfilePage from '../pages/manager/profile/MaProfilePage'


// Employee Pages 
import HomePageEm from '../pages/employee/Payment_forEmployee';
import AppointmentDetailsPage from '../pages/employee/pickup-delivery/AppointmentDetailsPage';
import AppointmentAll from '../pages/employee/pickup-delivery/AppointmentAll';
import InspectionPage from '../pages/employee/inspection/InspectionPage';
import SummaryPage from '../pages/employee/salecontact/SummaryPage'
import EmpProfilePage from '../pages/employee/profile/EmployeeDashboard'
import PaymentDetail from '../pages/employee/PaymentDetail';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { user, role, loading } = useAuth();

    // Show a loading state until authentication check is complete
    if (loading) {
        return <div>กำลังโหลด...</div>;
    }

    if (!user || !role) {
        // If there's no user or no role after loading, redirect to the login page.
        return <Navigate to="/login" replace />;
    }

    return allowedRoles.includes(role) ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* --- Manager Routes --- */}
            <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
                <Route element={<ManagerLayout />}>
                    <Route path="/home" element={<AllCarPage />} />
                    <Route path="/add-car" element={<AddnewCarPage />} />
                    <Route path="/edit-car/:id" element={<EditCarTentPage />} />
                    <Route path="/rent" element={<RentListPage />} />
                   <Route path="/add-rent/:id" element={<CreateRentCarPage />} />
                    <Route path="/add-rent" element={<AddRentPage />} />
                    <Route path="/sell" element={<SellListPage/>} />
                    <Route path="/edit-sell/:saleId" element={<EditSellPage/>} />
                    <Route path="/add-sell/:carId" element={<CreateSellCarPage />} />
                    <Route path="/add-sell" element={<AddSellPage />} />

                    {/* blank page  */}
                    <Route path="/tent-summary" element={<TentSummaryPage />} />
                    <Route path="/manage-employee" element={<ManageEmployeePage />} />
                    <Route path="/manager-profile" element={<MaProfilePage />} />
                    <Route path="/manager-insurance" element={<ManagerInsurancePage />} />
                    

                </Route>
            </Route>

            {/* --- Employee Routes --- PaymentDetail*/}
            <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
                <Route element={<EmployeeLayout />}>
                    <Route path="/homepage-employee" element={<HomePageEm />} />
                    <Route path="/payment-detail/:id" element={<PaymentDetail />} />
                    <Route path="/appointment-details/:id" element={<AppointmentDetailsPage />} />
                    <Route path="/AppointmentAll" element={<AppointmentAll />} />
                    <Route path="/Inspection" element={<InspectionPage />} />
                    <Route path="/Summary" element={<SummaryPage />} />
                    <Route path="/Emp-Profile" element={<EmpProfilePage />} />


                </Route>
            </Route>

            {/* --- Customer and Public Routes --- */}
            <Route element={<CustomerLayout />}>
                <Route path="/" element={<Navigate to="/buycar" />} />
                <Route path="/buycar" element={<BuyCar />} />
                    <Route path="/buycar-details/:id" element={<BuyCarDetailPage />} />
                <Route path="/rentcar" element={<RentCarPage />} />
                    <Route path="/rentcar-details/:id" element={<RentCarDetailPage />} />
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                    <Route path="/Cus-profile" element={<CusProfilePage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                    <Route path="/buy-insurance" element={<BuyInsurancePage />} />
                    <Route path="/inspection-car" element={<InspectionCarPage />} />
                    <Route path="/inspection-create" element={<InspectionCreatePage />} />
                    <Route path="/pickup-car" element={<PickupCarPage />} />
                    <Route path="/pickup-car/create" element={<PickupCarCreatePage />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRouter;
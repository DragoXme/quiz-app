import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/profile/ProfilePage';
import CreateQuestionPage from './pages/questions/CreateQuestionPage';
import ExploreQuestionsPage from './pages/questions/ExploreQuestionsPage';
import QuestionDetailPage from './pages/questions/QuestionDetailPage';
import TestConfigPage from './pages/test/TestConfigPage';
import TestPage from './pages/test/TestPage';
import TestResultPage from './pages/test/TestResultPage';
import ContestSummariesPage from './pages/contests/ContestSummariesPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Toaster position="top-right" />
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Protected Routes */}
                    <Route path="/home" element={
                        <ProtectedRoute><HomePage /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><ProfilePage /></ProtectedRoute>
                    } />
                    <Route path="/questions" element={
                        <ProtectedRoute><ExploreQuestionsPage /></ProtectedRoute>
                    } />
                    <Route path="/questions/create" element={
                        <ProtectedRoute><CreateQuestionPage /></ProtectedRoute>
                    } />
                    <Route path="/questions/:id" element={
                        <ProtectedRoute><QuestionDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/test/configure" element={
                        <ProtectedRoute><TestConfigPage /></ProtectedRoute>
                    } />
                    <Route path="/test/:contestId" element={
                        <ProtectedRoute><TestPage /></ProtectedRoute>
                    } />
                    <Route path="/test/:contestId/result" element={
                        <ProtectedRoute><TestResultPage /></ProtectedRoute>
                    } />
                    <Route path="/contests" element={
                        <ProtectedRoute><ContestSummariesPage /></ProtectedRoute>
                    } />
                    <Route path="/contests/:contestId" element={
                        <ProtectedRoute><TestResultPage /></ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                        <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
                    } />

                    {/* Default redirect */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
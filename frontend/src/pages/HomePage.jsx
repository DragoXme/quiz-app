import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const cards = [
        {
            title: 'Explore Questions',
            description: 'Browse, filter and sort all your questions.',
            icon: '🔍',
            color: '#4F46E5',
            lightColor: '#EEF2FF',
            path: '/questions'
        },
        {
            title: 'Create Question',
            description: 'Add new MCQ or Fill in the blank questions.',
            icon: '✏️',
            color: '#10B981',
            lightColor: '#ECFDF5',
            path: '/questions/create'
        },
        {
            title: 'Take Test',
            description: 'Start a customized test with your questions.',
            icon: '🎯',
            color: '#F59E0B',
            lightColor: '#FFFBEB',
            path: '/test/configure'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
            <Navbar />

            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '48px 24px'
            }}>
                {/* Welcome */}
                <div style={{ marginBottom: '48px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: '#111',
                        marginBottom: '8px'
                    }}>
                        Welcome back, {user?.username}! 👋
                    </h1>
                    <p style={{ color: '#666', fontSize: '16px' }}>
                        What would you like to do today?
                    </p>
                </div>

                {/* Main Action Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '24px',
                    marginBottom: '48px'
                }}>
                    {cards.map((card) => (
                        <div
                            key={card.path}
                            onClick={() => navigate(card.path)}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: '16px',
                                padding: '32px 24px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: '2px solid transparent',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.border = `2px solid ${card.color}`;
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.border = '2px solid transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                            }}
                        >
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '16px',
                                backgroundColor: card.lightColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                margin: '0 auto 16px'
                            }}>
                                {card.icon}
                            </div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#111',
                                marginBottom: '8px'
                            }}>
                                {card.title}
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#666',
                                lineHeight: '1.5'
                            }}>
                                {card.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Secondary Actions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                }}>
                    <div
                        onClick={() => navigate('/contests')}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            padding: '20px 24px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
                    >
                        <span style={{ fontSize: '24px' }}>🏆</span>
                        <div>
                            <p style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>
                                Contest Summaries
                            </p>
                            <p style={{ fontSize: '12px', color: '#888' }}>
                                View past test results
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/analytics')}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            padding: '20px 24px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
                    >
                        <span style={{ fontSize: '24px' }}>📊</span>
                        <div>
                            <p style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>
                                Analytics
                            </p>
                            <p style={{ fontSize: '12px', color: '#888' }}>
                                Track your performance
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
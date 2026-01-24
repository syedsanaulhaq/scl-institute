import { useState } from 'react';
import axios from 'axios';
import { User, Lock, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/v1/auth/login`, {
                email,
                password
            });

            const userData = response.data.user;
            localStorage.setItem('accessToken', response.data.tokens.accessToken);
            localStorage.setItem('user', JSON.stringify(userData));
            onLoginSuccess(userData);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-scl-bg p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-scl-light/10 via-scl-bg to-scl-bg">
            <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-white/20">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-scl-purple text-white mb-4 shadow-lg shadow-scl-purple/30">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        SCL Institute
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Log in to your account to continue
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-scl-error p-4 text-scl-error animate-in fade-in slide-in-from-left-4 duration-300">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="text-sm font-medium text-gray-700 ml-1 mb-1 block group-focus-within:text-scl-purple transition-colors">
                                Email Address
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-scl-purple transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-scl-purple focus:border-transparent transition-all sm:text-sm"
                                    placeholder="admin@scl.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-sm font-medium text-gray-700 ml-1 mb-1 block group-focus-within:text-scl-purple transition-colors">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-scl-purple transition-colors" />
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-scl-purple focus:border-transparent transition-all sm:text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-scl-purple hover:bg-scl-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scl-purple transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>

                    <div className="text-center pt-2">
                        <span className="text-gray-500 text-sm">Demo: admin@scl.com / password</span>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;

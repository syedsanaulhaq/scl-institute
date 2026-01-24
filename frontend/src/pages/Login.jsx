import { useState } from 'react';
import axios from 'axios';
import { User, Lock, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const LoginPage = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            {/* Left Side - Image/Branding (Visible on Desktop) */}
            <div className="relative hidden lg:flex lg:w-1/2 flex-col bg-scl-dark p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900/40 z-10" />
                <img
                    src="/assets/institute_banner.png"
                    alt="Institute Campus"
                    className="absolute inset-0 h-full w-full object-cover scale-105"
                />

                <div className="relative z-20 flex items-center text-2xl font-bold tracking-tight">
                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl mr-3 border border-white/20">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    SCL Institute
                </div>

                <div className="relative z-20 mt-auto max-w-lg">
                    <blockquote className="space-y-4">
                        <p className="text-2xl font-medium leading-relaxed italic text-white/90">
                            &ldquo;Empowering the next generation of global leaders through innovative education and seamless technology integration.&rdquo;
                        </p>
                        <footer className="flex items-center space-x-3 pt-4">
                            <div className="h-px w-12 bg-white/30" />
                            <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">SCL Academic Board</span>
                        </footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 bg-gray-50/50">
                <div className="mx-auto w-full max-w-[400px]">
                    <div className="flex flex-col space-y-3 text-center mb-10">
                        <div className="lg:hidden mx-auto bg-scl-purple text-white p-3 rounded-2xl mb-4 shadow-xl">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Login to SCL</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            Enter your credentials below to access the management portal
                        </p>
                    </div>

                    <div className="grid gap-6">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2 group">
                                <label className="text-sm font-bold text-gray-700 ml-1 group-focus-within:text-scl-purple transition-colors">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-scl-purple transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent transition-all shadow-sm"
                                        placeholder="admin@scl.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-sm font-bold text-gray-700 group-focus-within:text-scl-purple transition-colors">
                                        Password
                                    </label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-scl-purple transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="block w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-scl-purple focus:border-transparent transition-all shadow-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-scl-purple transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-2xl animate-shake">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-scl-purple hover:bg-scl-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-scl-purple transition-all duration-200 shadow-xl shadow-scl-purple/20 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    'Sign In to Dashboard'
                                )}
                            </button>
                        </form>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-gray-50 px-3 text-gray-400 font-bold tracking-widest">
                                    Demo Environment
                                </span>
                            </div>
                        </div>

                        <div className="text-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-xs text-gray-500 font-medium">Use credentials:</p>
                            <p className="text-sm font-bold text-gray-900 mt-1">admin@scl.com / password</p>
                        </div>
                    </div>

                    <p className="mt-10 text-center text-xs text-gray-400 font-medium pb-8 uppercase tracking-widest">
                        &copy; 2026 SCL Institute Global. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

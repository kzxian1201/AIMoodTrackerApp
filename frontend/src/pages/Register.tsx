import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { UserPlus, Heart } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/register', { username, password });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            console.error("Register error:", err);
            alert('Registration failed. Username might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl animate-fadeIn">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-pink-100 mb-4">
                        <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Join MoodEcho</h2>
                    <p className="mt-2 text-sm text-gray-600">Start your mental wellness journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700 mb-1">Choose a Username</label>
                        <input
                            id="reg-username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                            placeholder="e.g. happy_user"
                        />
                    </div>
                    <div>
                        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
                        <input
                            id="reg-password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full py-2.5 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-70 transition-all transform active:scale-[0.98]"
                    >
                        <UserPlus size={18} />
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <div className="text-center pt-2">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">Already have an account? Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
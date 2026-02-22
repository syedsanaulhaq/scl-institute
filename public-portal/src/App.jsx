import './index.css';

function App() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">SCL Institute</h1>
                    <p className="text-xl text-blue-100">Welcome to the SCL Institute Portal</p>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-2xl p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">What would you like to do?</h2>
                        <p className="text-gray-600 text-lg">Choose an option below to get started</p>
                    </div>

                    {/* Links/Buttons */}
                    <div className="space-y-4">
                        {/* SCL System Link */}
                        <a
                            href="http://185.211.6.60:3000"
                            className="block w-full"
                        >
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <h3 className="text-2xl font-bold mb-2">SCL System</h3>
                                        <p className="text-blue-100">Access the main SCL Institute portal for students and staff</p>
                                    </div>
                                    <div className="text-4xl ml-4">→</div>
                                </div>
                            </div>
                        </a>

                        {/* Apply Now Link */}
                        <a
                            href="http://185.211.6.60:3000/apply"
                            className="block w-full"
                        >
                            <div className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <h3 className="text-2xl font-bold mb-2">Apply Now</h3>
                                        <p className="text-green-100">Submit your application to SCL Institute</p>
                                    </div>
                                    <div className="text-4xl ml-4">→</div>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
                        <p className="text-sm">© 2026 SCL Institute. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
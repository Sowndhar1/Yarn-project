import { useNavigate } from 'react-router-dom';

const TrackPackage = () => {
    const navigate = useNavigate();

    const trackingSteps = [
        { title: "Order Placed", date: "Jan 4, 10:30 AM", completed: true, icon: "📝" },
        { title: "Processing", date: "Jan 4, 2:15 PM", completed: true, icon: "🏭" },
        { title: "Shipped", date: "Jan 5, 9:00 AM", completed: true, icon: "🚚" },
        { title: "Out for Delivery", date: "Expected Today", completed: false, active: true, icon: "📦" },
        { title: "Delivered", date: "Expected Jan 6", completed: false, icon: "🏠" }
    ];

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="mb-8">
                <button onClick={() => navigate('/my-account/orders')} className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-4 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Orders
                </button>
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-light text-slate-800">Track Package</h1>
                        <p className="text-slate-500 mt-1">Tracking ID: <span className="font-mono font-bold text-slate-700">TRK-{Math.floor(Math.random() * 100000000)}</span></p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Estimated Delivery</p>
                        <p className="text-xl font-bold text-green-600">Tomorrow, by 8pm</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tracking Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
                        <div className="relative">
                            <div className="absolute top-4 left-6 bottom-4 w-1 bg-slate-100 rounded-full"></div>
                            <div className="space-y-10">
                                {trackingSteps.map((step, idx) => (
                                    <div key={idx} className="relative flex gap-6">
                                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl border-[4px] transition-all bg-white
                                             ${step.completed ? 'border-green-500 text-green-600' :
                                                step.active ? 'border-indigo-600 text-indigo-600 animate-pulse' : 'border-slate-200 text-slate-300'}
                                         `}>
                                            {step.icon}
                                        </div>
                                        <div className={`pt-2 ${step.completed || step.active ? 'opacity-100' : 'opacity-40'}`}>
                                            <h3 className="font-bold text-lg text-slate-800">{step.title}</h3>
                                            <p className="text-sm text-slate-500 font-medium">{step.date}</p>
                                            {step.active && (
                                                <p className="text-xs text-indigo-600 font-bold mt-1 bg-indigo-50 px-2 py-1 rounded inline-block">
                                                    Current Status
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Updates Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Latest Updates</h3>
                        <div className="space-y-4 text-sm">
                            <div className="flex gap-4">
                                <div className="font-mono text-slate-400">10:45 AM</div>
                                <div className="text-slate-700">Package arrived at local delivery facility.</div>
                            </div>
                            <div className="flex gap-4">
                                <div className="font-mono text-slate-400">06:20 AM</div>
                                <div className="text-slate-700">Package departed from distribution center.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Map Placeholder */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative min-h-[300px] flex flex-col justify-end">
                        <div className="absolute inset-0 opacity-50 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/77.0,11.0,7,0/400x400?access_token=YOUR_TOKEN')] bg-cover bg-center">
                            {/* Fake Map Background */}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-lg mb-1">On the way</h3>
                            <p className="text-sm text-slate-400 mb-4">Tirupur, Tamil Nadu</p>
                            <button className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition">
                                View Live Map
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-2">Delivery Address</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            123, Knitting Factory Road,<br />
                            Industrial Estate,<br />
                            Tirupur - 641604
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackPackage;

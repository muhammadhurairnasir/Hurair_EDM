const DashboardCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-gray-800/80 backdrop-blur-lg border border-gray-700/50 p-6 rounded-3xl flex items-center justify-between hover:border-gray-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:-translate-y-1 transition-all duration-300 shadow-xl group">
      <div>
        <h3 className="text-gray-400 font-medium mb-1 text-sm tracking-wide">{title}</h3>
        <p className="text-3xl font-extrabold text-white tracking-tight">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${colorClass}`}>
        <Icon className="w-7 h-7" />
      </div>
    </div>
  );
};

export default DashboardCard;

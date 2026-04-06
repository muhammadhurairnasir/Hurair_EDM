const DashboardCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl flex items-center justify-between hover:border-gray-600 transition-colors shadow-lg">
      <div>
        <h3 className="text-gray-400 font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-gray-100">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="w-8 h-8" />
      </div>
    </div>
  );
};

export default DashboardCard;

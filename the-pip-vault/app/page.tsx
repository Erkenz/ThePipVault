"use client"; 



export default function Home() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-pip-text">
          Dashboard
        </h1>
        <span className="text-pip-muted text-sm">
          Welcome back to The PipLab
        </span>
      </div>

      {/* KPI Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-pip-card border border-pip-border p-6 rounded-xl">
          <h3 className="text-pip-muted text-sm font-medium">Total Net Profit</h3>
          <p className="text-2xl font-bold text-pip-green mt-2">+ $ 0.00</p>
        </div>

        {/* Card 2 */}
        <div className="bg-pip-card border border-pip-border p-6 rounded-xl">
          <h3 className="text-pip-muted text-sm font-medium">Win Rate</h3>
          <p className="text-2xl font-bold text-white mt-2">0%</p>
        </div>

        {/* Card 3 */}
        <div className="bg-pip-card border border-pip-border p-6 rounded-xl">
          <h3 className="text-pip-muted text-sm font-medium">Profit Factor</h3>
          <p className="text-2xl font-bold text-pip-gold mt-2">0.00</p>
        </div>
      </div>
      
      {/* Chart Placeholder */}
      <div className="bg-pip-card border border-pip-border p-6 rounded-xl h-64 flex items-center justify-center text-pip-muted">
        Equity Curve Chart (US7)
      </div>
    </div>
  );
}
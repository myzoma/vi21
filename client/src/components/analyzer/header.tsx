export default function Header() {
  return (
    <header className="sticky top-0 z-50 gradient-bg border-b border-border shadow-2xl backdrop-blur-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="primary-gradient p-3 rounded-xl shadow-lg">
              <i className="fas fa-chart-line text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                محلل موجات إليوت المتقدم
              </h1>
              <p className="text-sm text-muted-foreground">
                Elliott Wave Analyzer Pro
              </p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="flex items-center space-x-reverse space-x-2 glass-effect px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-primary rounded-full pulse-glow"></div>
              <span className="text-sm font-medium">متصل - بيانات حقيقية</span>
            </div>
            <button 
              className="glass-effect hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
              data-testid="button-settings"
            >
              <i className="fas fa-cog text-muted-foreground"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

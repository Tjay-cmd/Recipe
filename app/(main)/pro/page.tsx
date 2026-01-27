import Link from 'next/link'
import { ProCheckoutButton } from '@/components/ProCheckoutButton'

const FEATURES = [
  {
    title: 'Weekly Meal Planner',
    description: 'Plan your meals with an interactive calendar and stay organized',
    icon: '📅',
  },
  {
    title: 'Smart Shopping Lists',
    description: 'Add recipe ingredients with one click and never forget what to buy',
    icon: '🛒',
  },
  {
    title: 'Exclusive Pro Recipes',
    description: 'Access premium recipes with detailed instructions and tips',
    icon: '⭐',
  },
  {
    title: 'Recipe Collections',
    description: 'Organize your favorite recipes into custom collections',
    icon: '📚',
  },
  {
    title: 'Cook Mode',
    description: 'Distraction-free cooking with screen wake lock',
    icon: '👨‍🍳',
  },
  {
    title: 'Print Recipes',
    description: 'Beautiful print-friendly layouts for offline cooking',
    icon: '🖨️',
  },
  {
    title: 'Ad-Free Experience',
    description: 'Enjoy recipes without any advertisements',
    icon: '✨',
  },
]

export default function ProPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-20">
        <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
          🎉 Limited Time Offer
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-orange-500 bg-clip-text text-transparent leading-tight pb-2 overflow-visible">
          Upgrade to Pro
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Plan your meals, create smart shopping lists, and access exclusive recipes—all in one place.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto mb-20">
        <div className="bg-gradient-to-br from-white via-emerald-50/30 to-white rounded-3xl shadow-2xl border-2 border-emerald-400/50 p-12 relative overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-300/30 to-transparent rounded-full -mr-20 -mt-20 blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-300/30 to-transparent rounded-full -ml-16 -mb-16 blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-200/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          
          {/* Popular badge */}
          <div className="absolute top-6 right-6 bg-gradient-to-r from-emerald-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
            MOST POPULAR
          </div>
          
          <div className="relative z-10">
            {/* Price section */}
            <div className="text-center mb-10">
              <div className="mb-1">
                <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Starting at</span>
              </div>
              <div className="flex items-baseline justify-center gap-2 mb-3">
                <span className="text-7xl font-extrabold bg-gradient-to-r from-emerald-600 via-emerald-500 to-orange-500 bg-clip-text text-transparent leading-none">$3</span>
                <span className="text-2xl font-semibold text-gray-500">/month</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100/50 rounded-full">
                <span className="text-emerald-600 font-semibold">Billed monthly</span>
                <span className="text-xs text-gray-500">• Cancel anytime</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <div className="mb-8">
              <ProCheckoutButton />
            </div>
            
            {/* Trust indicators */}
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Cancel anytime. No hidden fees.</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Secure payment via PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-20 relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-orange-50/20 to-emerald-50/30 rounded-3xl -z-10"></div>
        
        <div className="relative px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            What's Included
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Everything you need to transform your cooking experience
          </p>
          
          {/* Improved grid layout - centers last item when odd number */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {FEATURES.map((feature, index) => (
              <div 
                key={feature.title} 
                className={`bg-gradient-to-br from-emerald-100 to-orange-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-emerald-200/50 hover:border-emerald-300 group relative overflow-hidden hover:from-emerald-200 hover:to-orange-200 ${
                  index === FEATURES.length - 1 && FEATURES.length % 3 !== 0 
                    ? 'lg:col-start-2' 
                    : ''
                }`}
              >
                {/* Subtle overlay on hover for depth */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                
                {/* Icon with white background to stand out */}
                <div className="relative z-10 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-sm group-hover:bg-white group-hover:scale-110 group-hover:rotate-3 shadow-md transition-all duration-300">
                    <span className="text-3xl">{feature.icon}</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
                
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/0 group-hover:bg-white/20 rounded-bl-full transition-all duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-20 border border-gray-100">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">Free vs Pro</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-5 px-6 text-gray-900 font-bold">Feature</th>
                <th className="text-center py-5 px-6 text-gray-600 font-semibold">Free</th>
                <th className="text-center py-5 px-6 text-emerald-600 font-bold text-lg">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium">Access to recipes</td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium">Save recipes</td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium">Shopping Lists</td>
                <td className="text-center py-4 px-6 text-gray-400">—</td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium">Meal Planner Calendar</td>
                <td className="text-center py-4 px-6 text-gray-400">—</td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium">Exclusive Pro Recipes</td>
                <td className="text-center py-4 px-6 text-gray-400">—</td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium">Print-Friendly Layouts</td>
                <td className="text-center py-4 px-6 text-gray-400">—</td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium">Recipe Collections</td>
                <td className="text-center py-4 px-6 text-gray-400">—</td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 font-medium">Ad-Free Experience</td>
                <td className="text-center py-4 px-6 text-gray-400">—</td>
                <td className="text-center py-4 px-6">
                  <span className="text-2xl text-emerald-600">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <ProCheckoutButton />
      </div>
    </div>
  )
}

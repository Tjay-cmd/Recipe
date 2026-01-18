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
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Upgrade to Pro</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Plan your meals, create smart shopping lists, and access exclusive recipes—all in one place.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto mb-16">
        <div className="bg-white rounded-lg shadow-lg border-2 border-emerald-500 p-8">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">$3</div>
            <div className="text-gray-600">per month</div>
          </div>
          <ProCheckoutButton />
          <p className="text-sm text-gray-500 text-center mt-4">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">What's Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Free vs Pro</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4">Feature</th>
                <th className="text-center py-4 px-4">Free</th>
                <th className="text-center py-4 px-4">Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-4 px-4">Access to recipes</td>
                <td className="text-center py-4 px-4">✓</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Save recipes</td>
                <td className="text-center py-4 px-4">✓</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Shopping Lists</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Meal Planner Calendar</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Exclusive Pro Recipes</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Print-Friendly Layouts</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Recipe Collections</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr>
                <td className="py-4 px-4">Ad-Free Experience</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
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

import Link from 'next/link'
import { ProCheckoutButton } from '@/components/ProCheckoutButton'

const FEATURES = [
  {
    title: 'Meal Plans',
    description: 'Weekly meal plans curated for your dietary preferences',
    icon: '📅',
  },
  {
    title: 'Grocery Lists',
    description: 'Auto-generated shopping lists for your meal plans',
    icon: '🛒',
  },
  {
    title: 'Macro-Counted Plans',
    description: 'Nutritional information and macro tracking for every recipe',
    icon: '📊',
  },
  {
    title: 'Weekly Drops',
    description: 'Exclusive recipes delivered to your inbox every week',
    icon: '📧',
  },
  {
    title: 'Saved Collections',
    description: 'Organize your favorite recipes into custom collections',
    icon: '⭐',
  },
  {
    title: 'Downloadable PDFs',
    description: 'Download recipes as beautiful PDFs for offline use',
    icon: '📄',
  },
]

export default function ProPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Upgrade to Pro</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get access to meal plans, grocery lists, macro tracking, and exclusive recipes.
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
                <td className="py-4 px-4">Meal plans</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Grocery lists</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Macro tracking</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr className="border-b">
                <td className="py-4 px-4">Weekly recipe drops</td>
                <td className="text-center py-4 px-4">—</td>
                <td className="text-center py-4 px-4">✓</td>
              </tr>
              <tr>
                <td className="py-4 px-4">Downloadable PDFs</td>
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

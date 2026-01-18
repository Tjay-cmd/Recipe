import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">YumSpot</h3>
            <p className="text-sm">
              Viral recipes you can actually cook. Join thousands of home cooks discovering amazing dishes.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/recipes" className="hover:text-emerald-400 transition-colors">
                  All Recipes
                </Link>
              </li>
              <li>
                <Link href="/tag/Airfryer" className="hover:text-emerald-400 transition-colors">
                  Airfryer Recipes
                </Link>
              </li>
              <li>
                <Link href="/tag/High-Protein" className="hover:text-emerald-400 transition-colors">
                  High Protein
                </Link>
              </li>
              <li>
                <Link href="/tag/Budget" className="hover:text-emerald-400 transition-colors">
                  Budget Meals
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-emerald-400 transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-emerald-400 transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/pro" className="hover:text-emerald-400 transition-colors">
                  Upgrade to Pro
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal & Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} YumSpot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

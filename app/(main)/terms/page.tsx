import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | RecipeHub',
  description: 'Terms of Service for RecipeHub - Read our terms and conditions for using our recipe website.',
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-lg max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 mb-4">
            By accessing and using RecipeHub, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="text-gray-700 mb-4">
            Permission is granted to temporarily access and use RecipeHub for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to reverse engineer any software contained on RecipeHub</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding your account credentials and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Pro Subscription</h2>
          <p className="text-gray-700 mb-4">
            Pro subscriptions are billed monthly and can be cancelled at any time. Subscription fees are non-refundable. Access to Pro features will continue until the end of the current billing period after cancellation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. User Content</h2>
          <p className="text-gray-700 mb-4">
            By submitting content (recipes, reviews, comments) to RecipeHub, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display that content on our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Disclaimer</h2>
          <p className="text-gray-700 mb-4">
            The materials on RecipeHub are provided on an 'as is' basis. RecipeHub makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Limitations</h2>
          <p className="text-gray-700 mb-4">
            In no event shall RecipeHub or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on RecipeHub.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul className="list-none mb-4 text-gray-700 space-y-2">
            <li>Email: <a href="/contact" className="text-emerald-600 hover:underline">Contact Form</a></li>
            <li>Website: <a href="/contact" className="text-emerald-600 hover:underline">Contact Page</a></li>
          </ul>
        </section>
      </div>
    </div>
  )
}

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | RecipeHub',
  description: 'Privacy Policy for RecipeHub - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <div className="prose prose-lg max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-gray-700 mb-4">
            Welcome to RecipeHub ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
          <p className="text-gray-700 mb-4">
            We may collect personal information that you voluntarily provide to us when you:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Register for an account (email address, display name)</li>
            <li>Subscribe to our email newsletter</li>
            <li>Contact us through our contact form</li>
            <li>Save recipes to your favorites</li>
            <li>Create shopping lists and meal plans</li>
            <li>Submit ratings and reviews</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Automatically Collected Information</h3>
          <p className="text-gray-700 mb-4">
            When you visit our website, we automatically collect certain information about your device, including:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages you visit and time spent on pages</li>
            <li>Referring website addresses</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Process your account registration and manage your account</li>
            <li>Send you email newsletters and updates (with your consent)</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Personalize your experience on our website</li>
            <li>Analyze usage patterns and trends to improve our website</li>
            <li>Detect, prevent, and address technical issues</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
          </p>
          <p className="text-gray-700 mb-4">
            We use cookies for:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Authentication and session management</li>
            <li>Remembering your preferences</li>
            <li>Analyzing website traffic and usage</li>
            <li>Displaying personalized content and advertisements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="text-gray-700 mb-4">
            We use third-party services that may collect information used to identify you:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li><strong>Google AdSense:</strong> We use Google AdSense to display advertisements. Google may use cookies and other tracking technologies to serve personalized ads. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">Google's Ad Settings</a>.</li>
            <li><strong>Supabase:</strong> We use Supabase for database and authentication services. Their privacy policy can be found at <a href="https://supabase.com/privacy" className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.</li>
            <li><strong>Vercel:</strong> Our website is hosted on Vercel. Their privacy policy can be found at <a href="https://vercel.com/legal/privacy-policy" className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee its absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt out of email communications</li>
            <li>Request a copy of your data</li>
          </ul>
          <p className="text-gray-700 mb-4">
            To exercise these rights, please contact us at the email address provided in the Contact section.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
          <p className="text-gray-700 mb-4">
            Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700 mb-4">
            If you have any questions about this Privacy Policy, please contact us:
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

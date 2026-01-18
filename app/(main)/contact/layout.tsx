import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us | RecipeHub',
  description: 'Get in touch with RecipeHub. Have questions, suggestions, or feedback? We\'d love to hear from you!',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

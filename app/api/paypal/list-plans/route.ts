import { NextRequest, NextResponse } from 'next/server'
import { getPayPalPlansByProduct } from '@/lib/paypal/client'

export async function GET(request: NextRequest) {
  try {
    const productId = process.env.PAYPAL_PRODUCT_ID

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID not configured' },
        { status: 400 }
      )
    }

    const plans = await getPayPalPlansByProduct(productId)

    return NextResponse.json({ plans })
  } catch (error: any) {
    console.error('Error fetching PayPal plans:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Check for Mercado Pago Access Token
if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
    console.error("MERCADO_PAGO_ACCESS_TOKEN is not set in environment variables.");
}

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
        return NextResponse.json(
            { error: 'Payment service is not configured.' },
            { status: 503 }
        );
    }
    
    try {
        const { items } = await request.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Cart items are required.' }, { status: 400 });
        }

        // Ensure the base URL is set for constructing back URLs
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const notificationUrl = `${baseUrl}/api/webhooks/mercadopago`;
        
        // Create a unique ID for the order to track it
        const externalReference = `impres-loja-${Date.now()}`;

        const preferenceBody = {
            items: items.map(item => ({
                id: item.id,
                title: item.name,
                quantity: Number(item.quantity),
                unit_price: Number(item.price),
                currency_id: 'BRL',
            })),
            back_urls: {
                success: `${baseUrl}/checkout/success`,
                failure: `${baseUrl}/checkout/failure`,
                pending: `${baseUrl}/checkout/pending`,
            },
            auto_return: 'approved' as 'approved',
            notification_url: notificationUrl,
            external_reference: externalReference, // Pass the unique ID
        };

        const preference = new Preference(client);
        const result = await preference.create({ body: preferenceBody });

        return NextResponse.json({ id: result.id, init_point: result.init_point });

    } catch (error: any) {
        console.error("Error creating Mercado Pago preference:", error);
        return NextResponse.json(
            { error: 'Failed to create payment preference.', details: error.message }, 
            { status: 500 }
        );
    }
}

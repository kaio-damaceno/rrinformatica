import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { db } from '@/lib/firebaseClient';
import { doc, runTransaction, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Order, Product } from '@/types';

// Initialize Mercado Pago client
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.type === 'payment') {
            const paymentId = body.data.id;

            console.log(`Received payment notification for ID: ${paymentId}`);

            const paymentInstance = new Payment(client);
            const payment = await paymentInstance.get({ id: paymentId });

            if (payment && payment.status === 'approved') {
                console.log(`Payment ${paymentId} was approved. Processing stock update.`);

                const items = payment.additional_info?.items;
                const externalReference = payment.external_reference;

                if (!items || items.length === 0) {
                    console.warn(`Payment ${paymentId} approved but has no items. Skipping stock update.`);
                    return NextResponse.json({ status: 'ok', message: 'No items to process.' });
                }

                // Use Firestore transaction to update stock and create order
                await runTransaction(db, async (transaction) => {
                    const orderItems = [];
                    let totalAmount = 0;
                    
                    for (const item of items) {
                        const productId = item.id;
                        const quantitySold = Number(item.quantity);

                        if (!productId || isNaN(quantitySold) || quantitySold <= 0) {
                            console.warn('Skipping invalid item in transaction:', item);
                            continue;
                        }
                        
                        const productRef = doc(db, 'products', productId);
                        const productDoc = await transaction.get(productRef);

                        if (!productDoc.exists()) {
                            throw new Error(`Product with ID ${productId} not found.`);
                        }

                        const productData = productDoc.data() as Product;
                        const currentStock = productData.stock;

                        if (currentStock < quantitySold) {
                            throw new Error(`Insufficient stock for product ${productData.name} (ID: ${productId}).`);
                        }
                        
                        const newStock = currentStock - quantitySold;
                        transaction.update(productRef, { stock: newStock });
                        console.log(`Stock for product ${productId} updated from ${currentStock} to ${newStock}`);

                        orderItems.push({
                            id: productId,
                            name: productData.name,
                            quantity: quantitySold,
                            price: productData.price,
                        });
                        totalAmount += productData.price * quantitySold;
                    }

                    // Create order document
                    const orderData: Omit<Order, 'id'> = {
                        items: orderItems,
                        total: totalAmount,
                        status: 'paid',
                        paymentId: paymentId.toString(),
                        createdAt: serverTimestamp(),
                    };
                    
                    const ordersCollection = collection(db, 'orders');
                    transaction.set(addDoc(ordersCollection, orderData).withConverter(null), orderData);
                    console.log(`Order created for payment ${paymentId} with reference ${externalReference}.`);
                });

                console.log('Transaction completed successfully.');
            } else {
                console.log(`Payment ${paymentId} status is not 'approved' (status: ${payment.status}). No action taken.`);
            }
        }
        
        return NextResponse.json({ status: 'received' }, { status: 200 });

    } catch (error: any) {
        console.error("Error processing Mercado Pago webhook:", error);
        return NextResponse.json({ error: 'Webhook processing failed.', details: error.message }, { status: 500 });
    }
}

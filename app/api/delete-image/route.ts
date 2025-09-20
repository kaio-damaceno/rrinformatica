import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function POST(request: Request) {
    // Validação movida do escopo do módulo para o escopo do handler
    if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT) {
        console.error("As credenciais do ImageKit não estão configuradas nas variáveis de ambiente.");
        return NextResponse.json(
            { error: 'Serviço de imagem não configurado. Verifique as variáveis de ambiente do servidor.' },
            { status: 503 } // 503 Service Unavailable
        );
    }
    
    const imagekit = new ImageKit({
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    try {
        const { fileId } = await request.json();

        if (!fileId || typeof fileId !== 'string') {
            return NextResponse.json({ error: 'O parâmetro "fileId" é obrigatório e deve ser uma string.' }, { status: 400 });
        }

        await imagekit.deleteFile(fileId);
        
        return NextResponse.json({ success: true, message: `Arquivo com ID ${fileId} foi excluído.` });

    } catch (error: any) {
        console.error('Erro ao excluir a imagem do ImageKit:', error);
        
        // Trata o erro específico de 'arquivo não encontrado' do ImageKit
        if (error.name === 'NotFoundError') {
             return NextResponse.json({ error: 'Arquivo não encontrado no ImageKit.' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Falha ao excluir a imagem.' }, { status: 500 });
    }
}

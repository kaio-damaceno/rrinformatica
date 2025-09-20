import { NextResponse } from 'next/server';
import ImageKit from 'imagekit';

export async function GET() {
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
    const result = imagekit.getAuthenticationParameters();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao gerar parâmetros de autenticação do ImageKit:", error);
    return NextResponse.json(
      { error: 'Falha ao obter os parâmetros de autenticação do ImageKit.' },
      { status: 500 }
    );
  }
}

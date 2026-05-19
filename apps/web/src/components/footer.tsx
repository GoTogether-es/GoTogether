import Link from 'next/link';
import { Container } from '@gotogether/ui';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-blue-600 mb-4 block">
              GoTogether
            </Link>
            <p className="text-gray-500 max-w-sm mb-4">
              Acompañamiento humano y empoderamiento para vivir con más autonomía y seguridad.
            </p>
            <div className="flex items-center text-sm text-gray-400 gap-1">
              Hecho con <Heart className="w-4 h-4 text-red-400 fill-red-400" /> en España
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4">Empresa</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/nosotros" className="hover:text-blue-600 transition-colors">Quiénes somos</Link></li>
              <li><Link href="/info" className="hover:text-blue-600 transition-colors">Cómo funciona</Link></li>
              <li><a href="/contacto" className="hover:text-blue-600 transition-colors">Contactar</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link href="/legal/privacy" className="hover:text-blue-600 transition-colors">Privacidad</Link></li>
              <li><Link href="/legal/terms" className="hover:text-blue-600 transition-colors">Términos</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-50 mt-12 pt-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} GoTogether Technologies S.L. Todos los derechos reservados.
        </div>
      </Container>
    </footer>
  );
}

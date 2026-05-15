import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: 40 }}>
      <h1>No encontramos esta pagina</h1>
      <p>Revisa la URL o vuelve al inicio.</p>
      <Link href="/">Ir a inicio</Link>
    </div>
  );
}

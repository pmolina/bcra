export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const cuit = url.searchParams.get('cuit');

  if (!cuit || !/^\d{11}$/.test(cuit)) {
    return new Response('Invalid CUIT', { status: 400 });
  }

  const body = new URLSearchParams({
    Texto: cuit,
    Tipo: '-1',
    EdadDesde: '-1',
    EdadHasta: '-1',
    IdProvincia: '-1',
    Localidad: '',
    recaptcha_response_field: 'enganio al captcha',
    recaptcha_challenge_field: 'enganio al captcha',
    encodedResponse: '',
  });

  const res = await fetch('https://informes.nosis.com/Home/Buscar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    return new Response('Error fetching extra data', { status: 502 });
  }

  const data = await res.json() as {
    EntidadesEncontradas?: { Actividad: string; Provincia: string }[];
  };

  const entidad = data.EntidadesEncontradas?.[0];
  if (!entidad) {
    return new Response(JSON.stringify({ actividad: null, provincia: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ actividad: entidad.Actividad, provincia: entidad.Provincia }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}

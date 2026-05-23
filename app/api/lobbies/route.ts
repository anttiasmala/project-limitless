// app/api/route.ts

export async function GET() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/parties/lobby/main`,
    { cache: 'no-store' },
  );

  const rooms = await res.json();
  return Response.json(rooms);
}

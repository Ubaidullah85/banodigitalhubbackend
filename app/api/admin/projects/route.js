import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { ensureIndexes, getProjects, isDbConfigured } from '@/lib/mongodb';
import { guard } from '@/lib/auth';
import { DEFAULT_PROJECTS } from '@/lib/projects';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clean(body) {
  const title = String(body.title ?? '').trim();
  const description = String(body.description ?? '').trim();
  const image = String(body.image ?? '').trim();

  if (title.length < 2) return { error: 'Project title is required.' };
  if (description.length < 10) return { error: 'Please write a short description.' };
  if (!/^https?:\/\//i.test(image) && !image.startsWith('/'))
    return { error: 'Image must be a full https:// URL or a path starting with /.' };

  const link = String(body.link ?? '').trim();
  if (link && !/^https?:\/\//i.test(link) && !link.startsWith('/') && link !== '#')
    return { error: 'Project link must be a full https:// URL.' };

  const tags = (Array.isArray(body.tags) ? body.tags : String(body.tags ?? '').split(','))
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    doc: {
      title: title.slice(0, 90),
      description: description.slice(0, 400),
      image,
      alt: String(body.alt ?? title).trim().slice(0, 120),
      tags,
      link: link || '#',
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 100,
    },
  };
}

/** The home page is statically revalidated — bust it whenever projects change. */
function refreshHome() {
  try {
    revalidatePath('/');
  } catch (err) {
    console.error('[admin/projects] revalidate failed:', err);
  }
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  if (!isDbConfigured()) return NextResponse.json({ projects: [], dbMissing: true });

  const col = await getProjects();
  const docs = await col.find({}).sort({ order: 1, createdAt: -1 }).toArray();
  return NextResponse.json({
    projects: docs.map((d) => ({ ...d, _id: String(d._id) })),
    usingDefaults: docs.length === 0,
    defaults: DEFAULT_PROJECTS,
  });
}

export async function POST(req) {
  const denied = await guard();
  if (denied) return denied;
  if (!isDbConfigured())
    return NextResponse.json({ error: 'Database is not configured.' }, { status: 503 });

  const body = await req.json().catch(() => ({}));

  // `seed: true` copies the four original site projects into the database so
  // the admin starts from the existing carousel instead of a blank list.
  if (body.seed) {
    await ensureIndexes();
    const col = await getProjects();
    if ((await col.countDocuments({})) > 0)
      return NextResponse.json({ error: 'Projects already exist.' }, { status: 409 });

    await col.insertMany(
      DEFAULT_PROJECTS.map(({ _id, ...p }, i) => ({
        ...p,
        order: (i + 1) * 10,
        createdAt: new Date(),
      }))
    );
    refreshHome();
    return NextResponse.json({ ok: true, seeded: DEFAULT_PROJECTS.length });
  }

  const { error, doc } = clean(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  await ensureIndexes();
  const col = await getProjects();
  const { insertedId } = await col.insertOne({ ...doc, createdAt: new Date() });
  refreshHome();
  return NextResponse.json({ ok: true, id: String(insertedId) });
}

export async function PATCH(req) {
  const denied = await guard();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id || !ObjectId.isValid(id))
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const { error, doc } = clean(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const col = await getProjects();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: { ...doc, updatedAt: new Date() } });
  refreshHome();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const denied = await guard();
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get('id');
  if (!id || !ObjectId.isValid(id))
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const col = await getProjects();
  await col.deleteOne({ _id: new ObjectId(id) });
  refreshHome();
  return NextResponse.json({ ok: true });
}

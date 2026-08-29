import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getStudents, isDbConfigured } from '@/lib/mongodb';
import { guard } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'contacted', 'shortlisted', 'enrolled', 'rejected'];

function serialise(d) {
  return {
    ...d,
    _id: String(d._id),
    createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt,
  };
}

export async function GET(req) {
  const denied = await guard();
  if (denied) return denied;

  if (!isDbConfigured()) {
    return NextResponse.json({ students: [], stats: null, dbMissing: true });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const status = searchParams.get('status') || '';

  const filter = {};
  if (status && STATUSES.includes(status)) filter.status = status;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { fullName: rx },
      { email: rx },
      { phone: rx },
      { whatsapp: rx },
      { cnic: rx },
      { phoneRaw: rx },
      { whatsappRaw: rx },
    ];
  }

  try {
    const col = await getStudents();
    const [students, total, withLaptop, byStatus] = await Promise.all([
      col.find(filter).sort({ createdAt: -1 }).limit(1000).toArray(),
      col.countDocuments({}),
      col.countDocuments({ laptop: true }),
      col.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]).toArray(),
    ]);

    return NextResponse.json({
      students: students.map(serialise),
      stats: {
        total,
        withLaptop,
        byStatus: Object.fromEntries(byStatus.map((s) => [s._id || 'new', s.n])),
      },
    });
  } catch (err) {
    console.error('[admin/students] load failed:', err);
    return NextResponse.json({ error: 'Could not load applications.' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const denied = await guard();
  if (denied) return denied;

  const { id, status, contacted, notes } = await req.json().catch(() => ({}));
  if (!id || !ObjectId.isValid(id))
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  const update = {};
  if (status !== undefined) {
    if (!STATUSES.includes(status))
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    update.status = status;
  }
  if (contacted !== undefined) update.contacted = Boolean(contacted);
  if (notes !== undefined) update.notes = String(notes).slice(0, 2000);

  if (!Object.keys(update).length)
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });

  update.updatedAt = new Date();

  try {
    const col = await getStudents();
    await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/students] update failed:', err);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const denied = await guard();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id || !ObjectId.isValid(id))
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });

  try {
    const col = await getStudents();
    await col.deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/students] delete failed:', err);
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}

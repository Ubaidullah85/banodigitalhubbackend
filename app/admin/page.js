import AdminApp from '@/components/admin/AdminApp';
import './admin.css';

export const metadata = {
  // `absolute` — otherwise the root layout appends the site name a second time.
  title: { absolute: 'Admin Panel | Bano Digital Hub' },
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}

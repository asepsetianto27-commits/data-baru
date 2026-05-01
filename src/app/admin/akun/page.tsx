import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";
import { getCurrentAdmin } from "@/lib/auth";

export default async function AkunPage() {
  const admin = await getCurrentAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Akun Saya</h1>
        <p className="text-sm text-slate-500">Pengaturan akun admin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-slate-500">Username</dt>
              <dd className="mt-1 text-sm">{admin?.username}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-slate-500">Nama</dt>
              <dd className="mt-1 text-sm">{admin?.name}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
          <CardDescription>
            Sangat disarankan mengganti password default setelah login pertama.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

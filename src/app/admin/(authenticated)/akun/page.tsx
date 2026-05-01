import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password-form";
import { getCurrentAdmin } from "@/lib/auth";
import { ShieldIcon, UserIcon } from "@/components/ui/icons";

function initials(name?: string | null): string {
  if (!name) return "AD";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AkunPage() {
  const admin = await getCurrentAdmin();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Akun Saya</h1>
        <p className="mt-1 text-sm text-slate-500">Pengaturan profil & keamanan akun admin.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Informasi akun yang sedang login.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-base font-bold text-white shadow-soft">
                {initials(admin?.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">
                  {admin?.name}
                </p>
                <p className="truncate text-xs text-slate-500">@{admin?.username}</p>
              </div>
            </div>
            <dl className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between text-sm">
                <dt className="flex items-center gap-2 text-slate-500">
                  <UserIcon size={14} />
                  Username
                </dt>
                <dd className="font-medium text-slate-900">{admin?.username}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="flex items-center gap-2 text-slate-500">
                  <ShieldIcon size={14} />
                  Peran
                </dt>
                <dd className="font-medium text-slate-900">Administrator</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
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
    </div>
  );
}

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login Admin</CardTitle>
          <CardDescription>
            Masuk untuk mengelola pengajuan cuti karyawan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
          <p className="mt-4 text-xs text-slate-500">
            Akun default: <code>admin</code> / <code>admin123</code>. Silakan ganti password
            setelah login pertama.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

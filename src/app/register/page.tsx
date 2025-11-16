import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
       <div className="w-full max-w-sm fade-in-scale">
        <RegisterForm />
      </div>
    </div>
  );
}

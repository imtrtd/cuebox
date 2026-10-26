import Link from "next/link";
import { BrandMark, BrandWordmark } from "@/components/BrandMark";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-brand" aria-label="Cuebox">
          <BrandMark size={40} />
          <BrandWordmark />
        </Link>
        <h1>Вход</h1>
        <p className="auth-lead">
          Облачная библиотека промптов, подсказок, задач и чатов
        </p>
        <LoginForm />
      </div>
    </div>
  );
}

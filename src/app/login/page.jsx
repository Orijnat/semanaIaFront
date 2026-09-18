/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@pollenparque.org.br");
  const [password, setPassword] = useState("Pollen@2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (api.auth.isAuthenticated()) {
      const user = api.auth.getCurrentUser();
      const defaultRoute = user?.role === "Empresa afiliada" ? "/portal-empresa" : "/";
      router.replace(new URLSearchParams(window.location.search).get("next") || defaultRoute);
    }
  }, [router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const loginResult = await api.auth.login(email, password);
      const userRole = loginResult?.user?.role;
      const targetRoute = new URLSearchParams(window.location.search).get("next")
        || (userRole === "Empresa afiliada" ? "/portal-empresa" : "/");
      router.replace(targetRoute);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  function handleSelectProfile(profileEmail) {
    setEmail(profileEmail);
    setPassword("Pollen@2026");
    setError("");
  }

  return (
    <main className="login-page">
      <section className="login-visual">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://pollenparque.com.br/wp-content/themes/pollen/images/2x/banner-principal.jpg"
          id="bgvid"
          className="login-bg-video"
        >
          <source
            data-src="https://pollenparque.com.br/wp-content/themes/pollen/videos/video_banner.webm"
            src="https://pollenparque.com.br/wp-content/themes/pollen/videos/video_banner.webm"
            type="video/webm"
          />
          <source
            data-src="https://pollenparque.com.br/wp-content/themes/pollen/videos/video_banner.mp4"
            src="https://pollenparque.com.br/wp-content/themes/pollen/videos/video_banner.mp4"
            type="video/mp4"
          />
        </video>
        <div className="login-visual-overlay" />

        <div className="login-brand">
          <img
            src="/logo-white.svg"
            alt="Pollen Parque Científico Tecnológico"
            width={176}
            height={39}
            className="img-fluid logo-white"
            loading="lazy"
          />
        </div>

        <div className="login-visual-content">
          <p className="eyebrow">GESTÃO DO PROGRAMA</p>
          <h1>Um lugar claro para cada etapa da parceria.</h1>
          <p>Organize afiliadas, documentos, contratos e financeiro em um só fluxo.</p>
        </div>

        <span className="login-orbit orbit-one" />
        <span className="login-orbit orbit-two" />
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <p className="eyebrow">ACESSO AO PROGRAMA</p>
          <h2>Bem-vinda de volta</h2>
          <p className="login-description">
            Entre para acompanhar o ecossistema de afiliadas do Pollen Parque.
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error && (
              <p className="form-feedback error" role="alert">
                {error}
              </p>
            )}

            <button className="primary-button login-submit" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="login-public-signup-callout" style={{ marginTop: "18px", padding: "12px 14px", background: "#f0f6f2", borderRadius: "8px", border: "1px solid #d4e4d8", textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "#365c47", display: "block" }}>
              Deseja afiliar sua empresa externa?
            </span>
            <Link
              href="/inscricao"
              style={{ fontSize: "12px", fontWeight: "700", color: "#2d6346", textDecoration: "underline", display: "inline-block", marginTop: "4px" }}
            >
              Preencher Formulário de Inscrição Não Residente →
            </Link>
          </div>

          <div className="login-demo-profiles">
            <p className="eyebrow" style={{ marginTop: "24px", marginBottom: "8px" }}>PERFIS DE DEMONSTRAÇÃO</p>
            <div className="demo-profile-buttons">
              <button
                type="button"
                className={`demo-profile-btn ${email === "empresa@biomacircular.com.br" ? "active" : ""}`}
                onClick={() => handleSelectProfile("empresa@biomacircular.com.br")}
              >
                🏢 Empresa Afiliada
              </button>
              <button
                type="button"
                className={`demo-profile-btn ${email === "demo@pollenparque.org.br" ? "active" : ""}`}
                onClick={() => handleSelectProfile("demo@pollenparque.org.br")}
              >
                👤 Equipe do Programa
              </button>
              <button
                type="button"
                className={`demo-profile-btn ${email === "financeiro@pollenparque.org.br" ? "active" : ""}`}
                onClick={() => handleSelectProfile("financeiro@pollenparque.org.br")}
              >
                💳 Financeiro
              </button>
            </div>
          </div>

          <p className="login-demo-note">
            Senha padrão: <strong>Pollen@2026</strong>. Selecione um perfil acima para alternar o fluxo.
          </p>
        </div>
      </section>
    </main>
  );
}
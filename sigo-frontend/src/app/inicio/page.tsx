"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <Image
            src="/logo_siga.jpg"
            alt="SIGO"
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-lg font-bold text-slate-900">SIGO</span>
        </div>
        <nav className="hidden gap-3 md:flex">
          <a
            href="#opcoes"
            className="rounded-md px-3 py-1 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Opcoes
          </a>
          <a
            href="#precos"
            className="rounded-md px-3 py-1 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Precos
          </a>
          <a
            href="#recursos"
            className="rounded-md px-3 py-1 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Recursos
          </a>
          <a
            href="#sobre"
            className="rounded-md px-3 py-1 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            Sobre
          </a>
        </nav>
        <div className="flex gap-3">
          <Link
            href="/cadastro"
            className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Cadastrar-se
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Fazer Login
          </Link>
        </div>
      </header>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
              Nao fique na estrada, siga com a gente.
            </h1>
            <p className="text-lg text-slate-600">
              Customize as pecas do seu carro da sua melhor maneira e faca se tornar real.
            </p>
            <p className="text-sm text-slate-500">
              Focado para tanto o cliente quanto o fornecedor mostrando eficacia e facilidade
            </p>
            <div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Veja as Opcoes
                <span>&rsaquo;</span>
              </Link>
            </div>
          </div>
          <div className="relative h-115 w-full overflow-hidden rounded-3xl bg-slate-100">
            <Image
              src="/reparacao.jpg"
              alt="Mecanico em acao"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 px-6 py-16 text-center lg:px-12 lg:py-24">
        <h2 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          Preparado com solucoes adversas que salvam dinheiro e tempo para aqueles que precisam
        </h2>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">Eficacia</h3>
            <p className="text-lg text-slate-600">
              Nosso sistema vem preparado com maxima eficacia e precisao para os clientes
              customizarem seus carros.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Saiba mais
              <span>&rsaquo;</span>
            </Link>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src="/profissional.jpg"
              alt="Tecnico de motores"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 h-80 w-full overflow-hidden rounded-2xl bg-slate-100 lg:order-1">
            <Image
              src="/burocracia.jpg"
              alt="Documentacao simples"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 space-y-6 lg:order-2">
            <h3 className="text-3xl font-bold text-slate-900">Sem burocracia</h3>
            <p className="text-lg text-slate-600">
              Feito para eliminar papeletas desnecessarias e evitar conflitos burocraticos.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Saiba mais
              <span>&rsaquo;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12 lg:py-24">
        <div className="mx-auto grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">Satisfacao</h3>
            <p className="text-lg text-slate-600">
              Deixar os clientes satisfeitos e nosso principal objetivo.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Saiba mais
              <span>&rsaquo;</span>
            </Link>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src="/cliente.jpg"
              alt="Equipe de atendimento"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-900 px-6 py-12 lg:px-12">
        <div className="mx-auto grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo_siga.jpg"
                alt="SIGO"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full bg-white object-cover"
              />
              <span className="font-bold text-white">SIGO</span>
            </div>
            <p className="text-sm text-slate-400">
              Solucoes eficientes para customizacao e atendimento de veiculos.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Produto</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#opcoes" className="hover:text-white">
                  Opcoes
                </a>
              </li>
              <li>
                <a href="#precos" className="hover:text-white">
                  Precos
                </a>
              </li>
              <li>
                <a href="#recursos" className="hover:text-white">
                  Recursos
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Empresa</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#sobre" className="hover:text-white">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#contato" className="hover:text-white">
                  Contato
                </a>
              </li>
              <li>
                <a href="#blog" className="hover:text-white">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-white">Redes Sociais</h4>
            <ul className="flex gap-4 text-sm">
              <li>
                <a href="#" className="text-slate-400 hover:text-white">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2025 SIGO. Todos os direitos reservados.</p>
          <p className="mt-4 text-xs text-slate-500">
            Imagens fornecidas por{" "}
            <a
              href="https://www.freepik.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Freepik
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}

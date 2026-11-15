#!/usr/bin/env python3
"""Gera demo/index.html a partir do index.html, trocando os [COLCHETES]
por conteúdo fictício de exemplo, para apresentar o site à cliente.

Uso (na raiz do projeto):
    python3 tools/gerar-demo.py

Os links de WhatsApp e telefone continuam apontando para números inválidos
(DDD 00), de propósito: ninguém liga para um número real por engano.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = "https://davimbraz-del.github.io/almeida-barros-/"
DEMO_URL = BASE_URL + "demo/"

src = (ROOT / "index.html").read_text(encoding="utf-8")
s = src


def sub(old, new, count=None):
    global s
    if old not in s:
        raise SystemExit(f"Trecho não encontrado no index.html: {old[:70]!r}")
    s = s.replace(old, new) if count is None else s.replace(old, new, count)


# ---------- <head> ----------
sub("<title>Almeida Barros Corretora de Seguros em [CIDADE – UF] | Atendimento humano</title>",
    "<title>Almeida Barros Corretora de Seguros | Atendimento humano</title>")
sub(" com atendimento humano em [CIDADE – UF].", " com atendimento humano.")
s = re.sub(r'\s*<link rel="canonical"[^>]*>', "", s)
sub('<meta name="color-scheme" content="light">',
    '<meta name="color-scheme" content="light">\n  <meta name="robots" content="noindex, nofollow">')
sub('<meta property="og:url" content="https://www.[SEUDOMINIO].com.br/">',
    f'<meta property="og:url" content="{DEMO_URL}">')
sub('<meta property="og:image" content="https://www.[SEUDOMINIO].com.br/assets/img/og-image.jpg">',
    f'<meta property="og:image" content="{BASE_URL}assets/img/og-image.jpg">')
# dados estruturados ficam só na versão oficial
s = re.sub(r"\s*<!-- Dados estruturados.*?</script>", "", s, flags=re.S)
# comentários de edição ([EDITAR], [TROCAR] etc.)
s = re.sub(r"\s*<!--[^>]*?\[[^>]*?-->", "", s, flags=re.S)

# caminhos relativos: a demo mora em /demo/
s = s.replace('href="favicon.svg"', 'href="../favicon.svg"')
s = s.replace('"assets/', '"../assets/')
s = s.replace('href="css/', 'href="../css/')
s = s.replace('src="js/', 'src="../js/')
s = s.replace('href="privacidade.html"', 'href="../privacidade.html"')

# selo "versão demonstrativa"
sub("</head>", """  <style>
    /* faixa "versão demonstrativa" acima do header */
    :root { --demo-h: 28px; }
    html { scroll-padding-top: calc(var(--header-h) + var(--demo-h) + 12px); }
    .demo-strip {
      position: fixed;
      inset: 0 0 auto;
      z-index: 51;
      display: flex;
      align-items: center;
      justify-content: center;
      height: var(--demo-h);
      margin: 0;
      padding: 0 12px;
      background: #3db4e8;
      color: #121c36;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
    }
    .site-header { top: var(--demo-h); }
    .hero { padding-top: calc(var(--header-h) + var(--demo-h) + 1.5rem); }
    @media (min-width: 960px) {
      .hero { padding-top: calc(var(--header-h) + var(--demo-h)); }
      .hero__a { top: calc(-1 * (var(--header-h) + var(--demo-h))); height: calc(100% + var(--header-h) + var(--demo-h)); }
    }
    @media (max-width: 420px) { .demo-strip__extra { display: none; } }
  </style>
</head>""")
sub('<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>',
    '<p class="demo-strip" role="note">Versão demonstrativa&nbsp;·&nbsp;conteúdo de exemplo<span class="demo-strip__extra">&nbsp;para aprovação</span></p>\n\n  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>')

# ---------- Sobre ----------
s = re.sub(r"<p>\[CONTE AQUI A HISTÓRIA:.*?\]</p>",
           "<p>Tudo começou com um jeito simples de trabalhar: conhecer cada cliente pelo nome, "
           "explicar com calma e estar por perto quando a vida aperta. Essa forma de atender passou "
           "de geração em geração e hoje é o coração da Almeida Barros.</p>",
           s, flags=re.S)

# ---------- Seguradoras ----------
for i in range(1, 9):
    sub(f'alt="[Nome da seguradora {i}]"', f'alt="Seguradora parceira {i}"')
sub("Olá! Vocês trabalham com a seguradora [nome]?", "Olá! Vocês trabalham com a minha seguradora?")

# ---------- Equipe ----------
team = [
    ("Mariana Costa", "Mariana", "[Área: Saúde e Vida]", "Saúde e Vida"),
    ("Ricardo Souza", "Ricardo", "[Área: Auto e Residencial]", "Auto e Residencial"),
    ("Patrícia Lima", "Patrícia", "[Área: Empresas e MEI]", "Empresas e MEI"),
    ("Fernando Rocha", "Fernando", "[Área: Atendimento e pós-venda]", "Atendimento e pós-venda"),
]
parts = s.split('<li class="person"')
if len(parts) != 5:
    raise SystemExit("Esperava 4 pessoas na equipe")
for idx, (full, first, area_old, area_new) in enumerate(team, start=1):
    block = parts[idx]
    block = block.replace("[Nome Sobrenome]", full).replace("[Nome]", first).replace(area_old, area_new)
    parts[idx] = block
s = '<li class="person"'.join(parts)

# ---------- Depoimentos ----------
reviews = [
    ("[Trecho de uma avaliação real do Google, com duas a quatro linhas. Prefira depoimentos que falem do atendimento humano e da rapidez.]",
     "Fui muito bem atendida desde a primeira mensagem. A Mariana explicou cada detalhe do plano de saúde com paciência e me ajudou a escolher a melhor opção para a minha família.",
     "Ana Paula R.", "[há 2 semanas]", "há 2 semanas"),
    ("[Trecho de uma avaliação real do Google. Ex.: como a equipe ajudou na escolha do plano ou num momento difícil.]",
     "Precisei de ajuda com o seguro do carro e não fiquei sozinho em nenhum momento. Liguei e quem atendeu já sabia do meu caso.",
     "Carlos M.", "[há 1 mês]", "há 1 mês"),
    ("[Trecho de uma avaliação real do Google.]",
     "Atendimento humano de verdade. Responderam rápido no WhatsApp e compararam várias seguradoras pra mim, sem enrolação.",
     "Juliana S.", "[há 2 meses]", "há 2 meses"),
    ("[Trecho de uma avaliação real do Google.]",
     "Contratamos o plano odontológico para a equipe da loja. Tudo resolvido sem burocracia e com um preço justo.",
     "Roberto A.", "[há 3 meses]", "há 3 meses"),
    ("[Trecho de uma avaliação real do Google.]",
     "Minha mãe tem 72 anos e foi tratada com todo o carinho. Explicaram tudo devagar, sem pressa nenhuma.",
     "Fernanda T.", "[há 4 meses]", "há 4 meses"),
]
for quote_old, quote_new, name, when_old, when_new in reviews:
    sub(quote_old, quote_new, 1)
    sub("[Nome do cliente]", name, 1)
    sub(when_old, when_new, 1)
initials = iter(r[2][0] for r in reviews)
s = re.sub(r'(<span class="review__avatar" aria-hidden="true">)[A-Z](</span>)',
           lambda m: m.group(1) + next(initials) + m.group(2), s)
sub('<span class="rating__num">[4,9]</span>', '<span class="rating__num">4,9</span>')
sub("Média de [00] avaliações no Google", "Média de 127 avaliações no Google")

# ---------- Contato ----------
sub("[Rua Exemplo, 000, Sala 00]<br>[Bairro], [Cidade – UF]<br>CEP [00000-000]",
    "Rua das Acácias, 120, Sala 4<br>Centro, São Paulo – SP<br>CEP 01010-000")
sub("[Rua Exemplo, 000] · [Cidade – UF]", "Rua das Acácias, 120 · São Paulo – SP")
sub("[Segunda a sexta, das 8h às 18h]", "Segunda a sexta, das 8h às 18h")
sub("[de segunda a sexta, das 8h às 18h]", "de segunda a sexta, das 8h às 18h")
sub('data-map-query="[ENDEREÇO COMPLETO, CIDADE – UF]"', 'data-map-query="Almeida Barros Corretora de Seguros"')
s = s.replace("[(00) 00000-0000]", "(11) 98765-4321")
s = s.replace("[(00) 0000-0000]", "(11) 3456-7890")
sub("[00.000.000/0001-00]", "12.345.678/0001-90")

# ---------- Conferência ----------
visible = re.sub(r"<script.*?</script>|<style.*?</style>", "", s, flags=re.S)
visible = re.sub(r'href="[^"]*"|src="[^"]*"|data-[a-z-]+="[^"]*"', "", visible)
left = sorted(set(re.findall(r"\[[^\]\n]{1,80}\]", re.sub(r"<[^>]+>", " ", visible))))
left += sorted(set(re.findall(r'(?:alt|aria-label|content)="[^"]*\[[^"]*"', s)))
if left:
    raise SystemExit("Ainda há colchetes na demo: " + " | ".join(left))

out = ROOT / "demo" / "index.html"
out.parent.mkdir(exist_ok=True)
out.write_text(s, encoding="utf-8")
print(f"Demo gerada em {out.relative_to(ROOT)}  →  {DEMO_URL}")

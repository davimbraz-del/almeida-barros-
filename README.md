# Almeida Barros – Corretora de Seguros

Landing page estática (HTML, CSS e JavaScript puros, sem frameworks), mobile-first e acessível.

```
index.html          página principal
privacidade.html    política de privacidade (modelo para revisar)
css/styles.css      todo o visual (cores e medidas em variáveis no topo)
js/main.js          menu, abas de perfis, carrossel, widget de dúvidas, mapa e vídeo
assets/fonts/       Montserrat, Inter e Caveat (auto-hospedadas)
assets/img/         logo, ícones, imagem de compartilhamento e placeholders de foto
```

## Como ver

Abra `index.html` no navegador. Para testar como num servidor:

```bash
python3 -m http.server 8000
```

Depois acesse http://localhost:8000.

## O que trocar antes de publicar

Tudo que falta está entre **[COLCHETES]** no código. Procure por `[EDITAR]` e `[TROCAR]` nos comentários do HTML.

| O quê | Onde |
| --- | --- |
| Número do WhatsApp | Substitua `5500000000000` em `index.html` (todas as ocorrências) por `55` + DDD + número, só dígitos. As mensagens prontas de cada botão ficam em `data-wa-msg`. |
| Telefone | `tel:+550000000000` e `[(00) 0000-0000]` |
| Endereço, cidade, CEP, horário | Seção "Onde estamos", rodapé, `<title>`, meta description e o bloco `application/ld+json` no `<head>` |
| Mapa | Atributo `data-map-query` com o endereço completo |
| Domínio | `[SEUDOMINIO]` nas tags `canonical`, Open Graph e JSON-LD |
| CNPJ | Rodapé e `privacidade.html` |
| Lista de seguros | Seção "Qual seguro você procura?": lista provisória; copie ou apague um `<li class="card">` |
| Seguradoras parceiras | Troque os arquivos `assets/img/seguradora-*.svg` pelos logos (SVG ou PNG transparente) e o `alt` com o nome |
| Equipe | Foto, nome, área e o nome na mensagem do WhatsApp de cada `<li class="person">` |
| Avaliações do Google | Nota, quantidade e o texto de avaliações **reais** (não invente depoimentos) e o link do perfil |
| Vídeo institucional | Cole o ID do YouTube em `data-youtube-id` |
| História da corretora | Parágrafo em colchetes da seção "Mais de 40 anos de experiência" |
| Respostas do widget | `<template id="faq-answers">` no fim do `index.html` |

### Fotos

Os arquivos em `assets/img/` com câmera desenhada são placeholders e já dizem qual foto entra e em que tamanho:

- `hero-atendimento.svg`: atendimento humanizado, retrato 5:6, mínimo 1000 × 1200 px
- `sobre-escritorio.svg`: fachada ou recepção, 4:3, mínimo 1200 × 900 px
- `galeria-1.svg`, `galeria-2.svg`: paisagem 16:9, mínimo 1200 × 675 px
- `video-capa.svg`: capa do vídeo, 16:9
- `equipe-1..4.svg`: retratos 4:5, 600 × 750 px

Salve as fotos reais como `.jpg` ou `.webp` (até ~200 KB cada), troque o `src` e revise o `alt`.

### Logo

O logo do site é uma recriação em SVG a partir da descrição da marca (o "A" de faixas diagonais com traços horizontais). Substitua pelo arquivo oficial: o símbolo está em `<symbol id="logo">` no início do `index.html` e do `privacidade.html`, e em `assets/img/logo-mark*.svg` e `favicon.svg`. Depois gere de novo `assets/img/og-image.jpg` (1200 × 630), `apple-touch-icon.png` (180 × 180) e `favicon-32.png`.

## Acessibilidade e desempenho

- Contraste AA em todos os textos; o azul dos botões foi escurecido para `#1A76BE` para o texto branco passar de 4,5:1.
- Foco visível, link "Pular para o conteúdo", abas e carrossel operáveis por teclado.
- Respeita `prefers-reduced-motion`.
- Fontes auto-hospedadas, imagens com `loading="lazy"`, mapa e vídeo só carregam quando a pessoa clica.

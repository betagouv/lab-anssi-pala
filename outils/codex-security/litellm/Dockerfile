FROM node:22-slim AS build-telechargeur
WORKDIR /telechargement-config
COPY outils/codex-security/litellm/telechargement-config/package.json \
     outils/codex-security/litellm/telechargement-config/package-lock.json ./
RUN npm ci --omit=dev

FROM ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02

RUN mkdir -p /app/config

COPY outils/codex-security/litellm/json_schema_to_object.py /app/proxy-config/
COPY outils/codex-security/litellm/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/telechargement-config
COPY outils/codex-security/litellm/telechargement-config /app/telechargement-config
COPY --from=build-telechargeur /telechargement-config/node_modules \
     /app/telechargement-config/node_modules

ENTRYPOINT ["/entrypoint.sh"]

CMD ["--config", "/app/proxy-config/config.yaml", "--port", "8080", "--host", "0.0.0.0"]
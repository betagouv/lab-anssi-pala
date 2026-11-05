FROM node:22-slim@sha256:5ec23b7c622b00547753bc6ffd78085dd868a68aeb41c8e0a1418f033e13d96d AS build-telechargeur
WORKDIR /telechargement-config
COPY outils/codex-security/litellm/telechargement-config/package.json \
     outils/codex-security/litellm/telechargement-config/package-lock.json ./
RUN npm ci --omit=dev

FROM ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02

COPY outils/codex-security/litellm/json_schema_to_object.py /app/proxy-config/
COPY outils/codex-security/litellm/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /app/telechargement-config
COPY outils/codex-security/litellm/telechargement-config /app/telechargement-config
COPY --from=build-telechargeur /telechargement-config/node_modules \
     /app/telechargement-config/node_modules

RUN chown -R 10001:0 /app/proxy-config /app/telechargement-config \
  && chmod -R g=u /app/proxy-config /app/telechargement-config
USER 10001:0

ENTRYPOINT ["/entrypoint.sh"]

CMD ["--config", "/app/proxy-config/config.yaml", "--port", "8080", "--host", "0.0.0.0"]
FROM ghcr.io/berriai/litellm@sha256:87f34979b9f8cb274fac90ca8a4fdda07d8480de22755562a26adeb95ce20d02
RUN mkdir -p /app/proxy-config

COPY outils/codex-security/litellm/config.yaml /app/proxy-config
COPY outils/codex-security/litellm/json_schema_to_object.py /app/proxy-config

CMD ["--config", "/app/proxy-config/config.yaml", "--port", "8080", "--host", "0.0.0.0"]